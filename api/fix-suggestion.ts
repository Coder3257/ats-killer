import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth, rateLimit, getSupabaseAdmin } from "./_utils.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

export const config = {
  runtime: "nodejs",
};

type NvidiaChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning?: string;
      reasoning_content?: string;
      final?: string;
      text?: string;
    };
  }>;
};

type NvidiaFixResponse = {
  ok: boolean;
  suggestion?: string;
  error?: string;
};

function extractFinalFromMessage(data: NvidiaChatResponse): string {
  const msg = data.choices?.[0]?.message;
  if (!msg) return "";

  // Prefer "content" if present, otherwise try other common fields.
  const candidates = [
    msg.content,
    msg.final,
    msg.text,
  ]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  return candidates[0] || "";
}

function sanitizeLeakedOutput(raw: string): string {
  const cleaned = (raw || "").replace(/\r\n/g, "\n").trim();
  if (!cleaned) return cleaned;

  // Split into blocks separated by blank lines and keep the last likely "answer" block.
  const blocks = cleaned
    .split(/\n{2,}/g)
    .map((b) => b.trim())
    .filter(Boolean);

  let candidate = blocks.length ? blocks[blocks.length - 1] : cleaned;

  // Strip common labels / quotes
  candidate = candidate
    .replace(/^["']+/, "")
    .replace(/["']+$/, "")
    .replace(/^(answer|final|rewritten)\s*[:\-]\s*/i, "")
    .trim();

  // If still looks like it contains meta reasoning, keep only the last non-empty line
  const lower = candidate.toLowerCase();
  const metaMarkers = [
    "we need to",
    "let me think",
    "chain-of-thought",
    "step-by-step",
    "reasoning",
    "analysis",
    "however,",
    "therefore,",
    "in conclusion",
  ];

  if (metaMarkers.some((m) => lower.includes(m))) {
    const lines = candidate.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length) candidate = lines[lines.length - 1];
  }

  return candidate.trim();
}

/**
 * Extract the most relevant resume section based on the issue text.
 * @param fullText The full resume text (or section) provided by the client.
 * @param issueText The issue description from the analysis.
 * @returns The subsection that should be edited, or the original text if no clear section.
 */
function extractRelevantSection(fullText: string, issueText: string): string {
  const lines = fullText.split('\n');
  const sections: { [title: string]: string[] } = {};
  let currentTitle = '';
  let currentLines: string[] = [];

  const headerRegex = /^([A-Z][A-Z\s&]+):?\s*$/; // Matches lines like "EXPERIENCE", "SKILLS:", etc.

  for (const line of lines) {
    const trimmed = line.trim();
    if (headerRegex.test(trimmed)) {
      // Save previous section
      if (currentTitle) {
        sections[currentTitle] = currentLines;
      }
      // Start new section
      const match = trimmed.match(headerRegex);
      currentTitle = match ? match[1].trim() : trimmed;
      currentLines = [];
    } else {
      if (currentTitle !== '' || trimmed !== '') {
        currentLines.push(line); // keep original line with indentation
      }
    }
  }
  // Save last section
  if (currentTitle) {
    sections[currentTitle] = currentLines;
  }

  if (Object.keys(sections).length === 0) {
    // No clear sections found; return original
    return fullText;
  }

  const issueLower = issueText.toLowerCase();
  // Mapping from issue keywords to likely section titles
  const keywordToSection: Record<string, string[]> = {
    experience: ['EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT'],
    skill: ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES'],
    education: ['EDUCATION', 'ACADEMIC BACKGROUND'],
    project: ['PROJECTS', 'PROJECT EXPERIENCE'],
    certification: ['CERTIFICATIONS', 'LICENSES & CERTIFICATIONS'],
    achievement: ['ACHIEVEMENTS', 'ACCOMPLISHMENTS'],
    summary: ['SUMMARY', 'PROFESSIONAL SUMMARY', 'PROFILE'],
    objective: ['OBJECTIVE', 'CAREER OBJECTIVE'],
  };

  let targetTitle: string | null = null;
  let maxScore = 0;

  for (const [keyword, titles] of Object.entries(keywordToSection)) {
    if (issueLower.includes(keyword)) {
      for (const title of titles) {
        if (sections[title]) {
          const score = sections[title].join('\n').length; // Prefer longer section
          if (score > maxScore) {
            maxScore = score;
            targetTitle = title;
          }
        }
      }
    }
  }

  // If no keyword matched, pick the first section (or longest)
  if (!targetTitle) {
    let longestTitle: string | null = null;
    let longestLength = -1;
    for (const [title, lines] of Object.entries(sections)) {
      const len = lines.join('\n').length;
      if (len > longestLength) {
        longestLength = len;
        longestTitle = title;
      }
    }
    targetTitle = longestTitle;
  }

  if (targetTitle && sections[targetTitle]) {
    // Return the section lines joined with newline, preserving original line breaks
    return sections[targetTitle].join('\n');
  }

  // Fallback: return original
  return fullText;
}

async function callNvidiaNim({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<NvidiaFixResponse> {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer and ATS optimizer. Follow the user's instructions precisely. Output ONLY the final rewritten resume text; do not include reasoning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: `NVIDIA NIM request failed with status ${response.status} for model "${model}"`,
    };
  }

  const data = (await response.json()) as NvidiaChatResponse;
  const suggestion = extractFinalFromMessage(data);

  if (!suggestion) {
    return { ok: false, error: `AI service returned an empty response for model "${model}".` };
  }

  return { ok: true, suggestion };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req, res);
    if (!userId) return;

    if (await rateLimit(userId, res, req)) return;

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Database admin client is not configured on the server." });
    }

    const { issueText, resumeSection, jdContext } = req.body || {};

    if (!issueText || !resumeSection) {
      return res.status(400).json({ error: "Missing required fields: issueText and resumeSection" });
    }

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_API_KEY) {
      console.log("[fix-suggestion] NVIDIA_API_KEY present:", !!process.env.NVIDIA_API_KEY);
      return res.status(500).json({ error: "NVIDIA API key is not configured on the server." });
    }

    // Temporary debug: confirm env var presence (do not log the value itself).
    console.log("[fix-suggestion] Key present:", !!process.env.NVIDIA_API_KEY);

    // Extract the relevant resume section to edit based on the issue
    const relevantSection = extractRelevantSection(resumeSection, issueText);

    // -----------------------------------------------------------------------
    // Metrics/quantification guard — AI models fabricate numbers when asked to
    // add metrics, which is worse than useless. Detect these issues and return
    // a placeholder-annotated version of the original text instead.
    // -----------------------------------------------------------------------
    const METRICS_PATTERN =
      /metric|quantif|measurable\s+impact|numbers?|percentage|impact\s+data|data[-\s]driven|kpi|roi/i;

    if (METRICS_PATTERN.test(issueText)) {
      console.log("[fix-suggestion] Metrics-type issue detected — skipping AI call, returning placeholder annotation.");

      // Append a placeholder to every bullet point that does not already contain a number.
      const NUMBER_RE = /\d/;
      const annotated = relevantSection
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          // Only annotate bullet lines (starting with -, •, *, or a number+.)
          const isBullet = /^([-•*]|\d+\.)/.test(trimmed);
          if (isBullet && !NUMBER_RE.test(trimmed)) {
            return line.trimEnd() + " [Add specific metric, e.g. improved X by Y%]";
          }
          return line;
        })
        .join("\n");

      const metricsBody = JSON.stringify({ suggestion: annotated });
      res.setHeader("Content-Type", "application/json");
      res.end(metricsBody);
      return;
    }
    // -----------------------------------------------------------------------

    const prompt = `
You are an expert resume writer and ATS optimizer. Your task is to rewrite a specific resume section to address a specific issue identified by an ATS analysis.

Issue to fix: "${issueText}"

Job Description Context:
${jdContext}

Current Resume Section:
${relevantSection}

Instructions:
1. Rewrite ONLY the provided resume section to directly address the issue described.
2. Keep the rewrite concise, impactful, and tailored to the job description.
3. Maintain truthfulness - do not invent false experience or skills.
4. Focus on fixing the specific issue mentioned (e.g., if issue is "unclear timeframe", add clear dates; if issue is "missing keywords", incorporate relevant terms from the JD).
5. Return ONLY the rewritten resume section text, with no additional commentary, explanation, or formatting.
6. If the issue cannot be addressed by rewriting this section (e.g., it's about missing sections entirely), return the original section unchanged.

Rewritten section:
`;

    // Model selection:
    // NVIDIA model IDs can vary by account/entitlements, so try an ordered list.
    const modelCandidates = [
      // Confirmed valid primary model
      "meta/llama-3.1-8b-instruct",
      "nvidia/nemotron-3-super-120b-a12b",
      // Fallback candidates
      "moonshotai/kimi-k2.6",
      "deepseek-ai/deepseek-v3",
    ];

    let lastError: string | null = null;

    for (const model of modelCandidates) {
      console.log(`[fix-suggestion] Trying NVIDIA model: ${model}`);

      const attempt = await callNvidiaNim({
        apiKey: NVIDIA_API_KEY,
        model,
        prompt,
      });

      if (attempt.ok && attempt.suggestion) {
        console.log(`[fix-suggestion] NVIDIA model success: ${model}`);
        // Sanitizer: strip leaked chain-of-thought / meta-reasoning if present.
        const cleaned = attempt.suggestion
          .replace(/\r\n/g, "\n")
          .trim();

        const reasoningMarkers = [
          "we need to",
          "let me think",
          "thinking",
          "analysis",
          "deliberation",
          "reasoning",
          "here's how",
          "step-by-step",
        ];

        const hasMarkers = reasoningMarkers.some((m) =>
          cleaned.toLowerCase().includes(m)
        );

        let finalText = cleaned;

        if (hasMarkers) {
          // Heuristic: keep the last non-empty block (often the actual final rewrite).
          const blocks = cleaned
            .split(/\n{2,}/g)
            .map((b) => b.trim())
            .filter(Boolean);

          if (blocks.length > 0) {
            finalText = blocks[blocks.length - 1];
          }

          // Also strip any leading labels like "Rewritten section:".
          finalText = finalText.replace(/^Rewritten\s*(resume)?\s*(section)?\s*:\s*/i, "");
          finalText = finalText.trim();
        }

        const successBody = JSON.stringify({ suggestion: finalText });
        res.setHeader('Content-Type', 'application/json');
        res.end(successBody);
        return;
      }

      lastError = attempt.error || "Unknown NVIDIA error";
      console.warn(`[fix-suggestion] NVIDIA model failed: ${model}. Error: ${lastError}`);
    }

    console.error("NVIDIA fix-suggestion failed (all models):", lastError);

    const errorBody = JSON.stringify({
      error: "Failed to generate fix suggestion from AI service.",
      attemptedModels: modelCandidates,
      lastError: lastError || undefined,
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(errorBody);
    return;
  } catch (err: any) {
    console.error("Error in fix-suggestion API:", err);
    const errorBody = JSON.stringify({ error: "Internal server error" });
    res.setHeader('Content-Type', 'application/json');
    res.end(errorBody);
    return;
  }
}