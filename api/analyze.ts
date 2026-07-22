import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { getResumeAnalysisPrompt } from "./_prompts/resume-analysis.js";
import { AnalysisResultSchema } from "./_schemas/analysisSchema.js";
import { verifyAuth, rateLimit, getSupabaseAdmin } from "./_utils.js";
import { recalculateGamification } from "./_gamification.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils";
import crypto from "crypto";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

export const config = {
  runtime: "nodejs",
};

// Helper function to generate cache key from resume and JD
function generateCacheKey(resume: string, jd: string): string {
  const text = resume + '||' + jd; // Separator to avoid collisions
  return crypto.createHash('sha256').update(text).digest('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req, res);
    if (!userId) return;

    if (await rateLimit(userId, res, req)) return;

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Database admin client is not configured on the server." });
    }

    const { resume, jd, idempotencyKey } = req.body || {};

    if (!resume || !jd) {
      return res.status(400).json({ error: "Missing required fields: resume and jd" });
    }

    // Check if user has unlimited access (Pro subscription or Lifetime access)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("lifetime_access")
      .eq("id", userId)
      .single();

    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const hasLifetimeAccess = profile?.lifetime_access === true;
    const hasActiveSubscription = subscription?.status === "active"
      && new Date(subscription.current_period_end) > new Date();

    const isUnlimited = hasLifetimeAccess || hasActiveSubscription;

    let creditsData = null;

    if (!isUnlimited) {
      const { data: cData, error: creditsError } = await adminClient
        .from("credits")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (creditsError || !cData) {
        console.error("CREDITS ERROR DETECTED:", creditsError, "data:", cData);
        return res.status(402).json({ error: "No credit record found. Please purchase credits." });
      }

      if (cData.amount <= 0) {
        return res.status(402).json({ error: "Insufficient credits. Please upgrade or purchase more credits." });
      }
      creditsData = cData;
    }

    // --- BEGIN CACHING CHANGES ---
    // Generate cache key from resume and JD
    const cacheKey = generateCacheKey(resume, jd);

    let data: any;
    let geminiCalled = false;

    // Check cache for existing result (within last 24 hours)
    try {
      const cacheResult = await adminClient
        .from('analysis_cache')
        .select('result_json')
        .eq('hash', cacheKey)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (!cacheResult.error && cacheResult.data) {
        // Cache hit
        data = cacheResult.data.result_json;
        console.log(`[Cache Hit] Analysis key: ${cacheKey.substring(0, 8)}...`);
      } else {
        // Cache miss or error, we'll proceed to Gemini
        geminiCalled = true;
      }
    } catch (cacheErr) {
      console.error('Error checking analysis cache:', cacheErr);
      geminiCalled = true; // Treat as miss on error
    }

    // If cache miss, call Gemini API
    if (geminiCalled) {
      const cleanKey = (process.env.GEMINI_API_KEY || "").trim();
      if (!cleanKey) {
        return res.status(500).json({ error: "AI Service API key is required on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const execute = async (isRetry: boolean) => {
        const promptText = getResumeAnalysisPrompt(resume, jd, isRetry);
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
              responseMimeType: "application/json",
            },
          });
        } catch (geminiErr) {
          Sentry.captureException(geminiErr, { tags: { source: "gemini_api" } });
          throw geminiErr;
        }

        const text = response.text || "";
        let cleanText = text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith("```")) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }

        const parsed = JSON.parse(cleanText.trim());
        const validated = AnalysisResultSchema.safeParse(parsed);
        if (!validated.success) {
          console.error("Zod validation failure inside API analyze route:", validated.error);
          throw new Error("SaaS API analysis response schema mismatch.");
        }
        return validated.data;
      };

      let dataFromGemini;
      try {
        dataFromGemini = await execute(false);
      } catch (err: any) {
        console.warn("First API try failed, running schema calibration retry loop:", err.message);
        dataFromGemini = await execute(true);
      }
      data = dataFromGemini;
    }
    // --- END CACHING CHANGES ---

    // 3. Decrement user credit if not unlimited AND we actually called Gemini
    if (geminiCalled && !isUnlimited && creditsData) {
      const { error: decrementError } = await adminClient
        .from("credits")
        .update({ amount: creditsData.amount - 1 })
        .eq("user_id", userId);

      if (decrementError) {
        console.error("Failed to decrement user credits:", decrementError);
      }
    }

    // 4. Save analysis details in database
    const { error: insertScoreError } = await adminClient
      .from("score_history")
      .insert({
        user_id: userId,
        score: data.score,
        keyword_match_percent: data.keyword_match_percent,
        jd_snippet: JSON.stringify(data),
        idempotency_key: idempotencyKey || null
      });

    if (insertScoreError) {
      if (insertScoreError.code === "23505" && idempotencyKey) {
        console.warn(`Idempotency conflict detected (23505) for key: ${idempotencyKey}. Refunding credit.`);
        // Restore credit if not unlimited (since it's a duplicate request)
        if (!isUnlimited && creditsData && geminiCalled) {
          await adminClient
            .from("credits")
            .update({ amount: creditsData.amount })
            .eq("user_id", userId);
        }

        const { data: existingScore } = await adminClient
          .from("score_history")
          .select("jd_snippet")
          .eq("user_id", userId)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (existingScore?.jd_snippet) {
          try {
            return res.status(200).json(JSON.parse(existingScore.jd_snippet));
          } catch (e) {
            // fallback
          }
        }
      }
      console.error("Failed to save score history:", insertScoreError);
    }

    // 5. Trigger gamification recalculation
    try {
      await recalculateGamification(userId);
    } catch (gErr) {
      console.error("Failed to recalculate gamification on scan:", gErr);
    }

    // --- BEGIN CACHING CHANGES ---
    // Store result in cache if we called Gemini (to update cache for future requests)
    if (geminiCalled) {
      try {
        await adminClient
          .from('analysis_cache')
          .upsert({
            hash: cacheKey,
            result_json: data,
            created_at: new Date().toISOString()
          }, { onConflict: 'hash' });
        console.log(`[Cache Store] Analysis key: ${cacheKey.substring(0, 8)}...`);
      } catch (cacheErr) {
        console.error('Error storing analysis cache:', cacheErr);
      }
    }
    // --- END CACHING CHANGES ---

    return res.status(200).json(data);
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}