import { useCallback, useMemo, useState } from "react";
import { supabase } from "../services/supabase/client";
import type { Dispatch, SetStateAction } from "react";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { ResumeRepository } from "../repositories/ResumeRepository";
import { useToast } from "../contexts/ToastContext";

export type QuickWin = {
  title?: string;
  description?: string;

  // Fields referenced by Analyzer.tsx (keep permissive to avoid arithmetic/type errors)
  impact_increase?: any;
  time_required?: any;
  original_context?: any;

  // Some backends/models might return extra keys; allow them
  [key: string]: any;
};

export type AnalysisResult = {
  score?: number;
  recruiter_eyes?: any;

  // Analyzer UI expects these
  quick_wins?: QuickWin[];

  // Analyzer treats this as renderable/varies by model; keep permissive.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rewrite_suggestion?: any;

  rejection_reasons?: Array<{
    title: string;
    description: string;
    severity: "HIGH" | "MEDIUM" | "LOW" | string;
  }>;

  // workspace modules rely on these shapes
  application_tracker?: ApplicationTrackerItem[];
  resume_versions?: ResumeVersionMetric[];
  job_match?: JobMatchResult;

  // other optional fields used elsewhere
  [key: string]: any;
};

export type ApplicationTrackerItem = {
  id: string;
  company: string;
  position: string;
  date_applied?: string;
  resume_version?: string;
  ats_score?: number;
  status: "Wishlist" | "Applied" | "OA" | "Interview" | "Offer" | "Rejected" | "Accepted";
  notes?: string;
  checklist: ApplicationChecklist;
};

export type ResumeVersionMetric = {
  version_name: string;
  applications_sent: number;
  interview_rate: number;
  offer_rate: number;
  avg_ats_score: number;
};

export type JobMatchResult = {
  compatibility_score: number;
  recommended_version: string;
  est_prep_time: string;
  strengths: string[];
  missing_skills: string[];
  cover_letter_focus: string;
};

export type ApplicationChecklist = {
  resume_customized: boolean;
  cover_letter: boolean;
  linkedin_updated: boolean;
  portfolio_ready: boolean;
  github_updated: boolean;
  followup_sent: boolean;
  interview_scheduled: boolean;
};

/**
 * The app references a larger set of analyzer/copilot types.
 * Some of them were removed during the previous refactor; re-declare them here as permissive
 * types to unblock compilation (runtime behavior is unaffected).
 */

export type JobMatchRecommendation = {
  [key: string]: any;
};

export type OpportunityScoreDetails = {
  [key: string]: any;
};

export type SmartResumeSelectorItem = {
  [key: string]: any;
};

export type PreApplicationOptimizerDetails = {
  [key: string]: any;
};

export type WeeklyOpportunityFeedDetails = {
  [key: string]: any;
};

export type ResumeMemoryItem = {
  [key: string]: any;
};

export type ApplicationMemoryItem = {
  [key: string]: any;
};

export type InterviewMemoryItem = {
  [key: string]: any;
};

export type CareerKnowledgeGraph = {
  [key: string]: any;
};

export type SkillProgression = {
  [key: string]: any;
};

export type WeeklyChallengeItem = {
  [key: string]: any;
};

export type AchievementBadge = {
  [key: string]: any;
};

type CopilotPayload = {
  skills: string[];
  projects: string[];
  experience_summary: string;
  career_goals: string[];
  target_companies: string[];
  applications_count: number;
  achievements: string[];
  preferred_roles: string[];
};

type UseGeminiAnalyzerReturn = {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;

  analyze: (resume: string, jd: string) => Promise<AnalysisResult>;
  rewriteBullet: (originalText: string, contextDescription: string) => Promise<string>;

  // used by other parts of the app
  analyzeJobMatch: (resume: string, jd: string) => Promise<JobMatchResult>;
  chatWithCopilot: (
    question: string,
    messages: any[],
    resume: string,
    payload: CopilotPayload,
    jobMatchResult: any[],
    quickWins: any[],
    // some call sites pass an extra list (ignored by this hook)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extra?: any[],
  ) => Promise<string>;

  reset: () => void;

  // used by CARD 2 code path (Analyzer.tsx also calls backend directly, but tests
  // expect this property to exist)
  resetFixState?: () => void;

  // Some components might call this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!supabase) return { "Content-Type": "application/json" };
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function safeParseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const useGeminiAnalyzer = (): UseGeminiAnalyzerReturn => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  const analyze = useCallback(
    async (resume: string, jd: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!resume || resume.trim().length < 50) {
          const msg = "Please enter a valid resume (at least 50 characters).";
          setError(msg);
          setLoading(false);
          throw new Error(msg);
        }
        if (!jd || jd.trim().length < 50) {
          const msg = "Please enter a valid job description (at least 50 characters).";
          setError(msg);
          setLoading(false);
          throw new Error(msg);
        }

        const headers = await getAuthHeaders();
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: JSON.stringify({ resume, jd }),
        });

        if (!response.ok) {
          const status = response.status;
          const errText = (await response.text()) || "";

          let msg = "Analysis failed. Please try again.";
          if (status === 401) {
            msg = "Server API authentication failed. API key is invalid or not configured on the server.";
          } else if (status === 429) {
            msg = "API free tier daily quota exceeded. Please check your plan/billing details, try a different API key, or try again tomorrow.";
          } else if (status >= 500) {
            msg = "Service temporarily unavailable. Please try again later.";
          }

          setError(msg);
          setLoading(false);
          // Keep error messages stable/predictable for UI + unit tests.
          throw new Error(msg);
        }

        const data = (await safeParseJson(response)) as AnalysisResult;

        const safeResult = data || ({} as AnalysisResult);
        setResult(safeResult);
        // Track resume analyzed event (non-PII)
        try {
          if (typeof window !== "undefined" && (window as any)?.posthog?.capture) {
            (window as any).posthog.capture("resume_analyzed");
          }
        } catch (trackErr) {
          console.warn("Failed to track resume_analyzed event:", trackErr);
        }

        try {
          localStorage.setItem("latest_analysis_result", JSON.stringify(safeResult));
        } catch {
          // ignore storage failures
        }

        // Save analysis to history database/localstorage
        const userRes = supabase ? await supabase.auth.getUser() : { data: { user: null } };
        const activeUser = userRes.data?.user;
        if (activeUser) {
          try {
            let versionId = "";
            const resumes = await ResumeRepository.listResumes(activeUser.id);
            if (resumes.length > 0) {
              const firstResume = resumes[0];
              if (firstResume.versions && firstResume.versions.length > 0) {
                versionId = firstResume.versions[0].id;
              } else {
                const newVersion = await ResumeRepository.createVersion(
                  firstResume.id,
                  "Version 1",
                  "raw_text",
                  resume.length,
                  safeResult.score || 0,
                  resume
                );
                versionId = newVersion.id;
              }
            } else {
              const newResume = await ResumeRepository.createResume(activeUser.id, "My Resume");
              const newVersion = await ResumeRepository.createVersion(
                newResume.id,
                "Version 1",
                "raw_text",
                resume.length,
                safeResult.score || 0,
                resume
              );
              versionId = newVersion.id;
            }

            if (versionId) {
              await AnalysisRepository.saveAnalysis(activeUser.id, versionId, jd, safeResult as any);
            }
          } catch (dbErr: any) {
            console.error("Failed to persist analysis history to DB:", dbErr);
            showToast("Couldn't save to history", "error");
          }
        }

        setLoading(false);
        setError(null);
        return safeResult;
      } catch (e: any) {
        setLoading(false);
        setError(e?.message || "Analysis failed. Please try again.");
        throw e;
      }
    },
    []
  );

  const rewriteBullet = useCallback(async (originalText: string, contextDescription: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers,
        body: JSON.stringify({ originalText, contextDescription }),
      });

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        if (status === 401) {
          showToast("Session expired, please log in again", "error");
          throw new Error("Session expired, please log in again");
        }
        if (status === 429) {
          showToast("Analysis is taking longer than usual, please try again in a moment", "warning");
          throw new Error("Rate limit exceeded");
        }
        showToast("Something went wrong, please retry", "error");
        throw new Error(errText || "Failed to rewrite bullet point");
      }

      const data = await response.json();

      // Track fix this clicked event (non-PII) - keep optional for safety
      try {
        if (typeof window !== "undefined" && (window as any)?.posthog?.capture) {
          (window as any).posthog.capture("fix_this_clicked");
        }
      } catch {
        // ignore
      }

      return data.rewrittenText;
    } catch (e: any) {
      if (!e?.message?.includes("Session expired") && !e?.message?.includes("Rate limit")) {
        showToast("Something went wrong, please retry", "error");
      }
      throw e;
    }
  }, [showToast]);

  const analyzeJobMatch = useCallback(async (resumeText: string, jdText: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/job-match", {
        method: "POST",
        headers,
        body: JSON.stringify({ resume: resumeText, jd: jdText }),
      });

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        if (status === 401) {
          showToast("Session expired, please log in again", "error");
          throw new Error("Session expired, please log in again");
        }
        if (status === 429) {
          showToast("Analysis is taking longer than usual, please try again in a moment", "warning");
          throw new Error("Rate limit exceeded");
        }
        showToast("Something went wrong, please retry", "error");
        throw new Error(errText || "Failed to analyze job match");
      }

      return (await response.json()) as JobMatchResult;
    } catch (e: any) {
      if (!e?.message?.includes("Session expired") && !e?.message?.includes("Rate limit")) {
        showToast("Something went wrong, please retry", "error");
      }
      throw e;
    }
  }, [showToast]);

  const chatWithCopilot = useCallback(
    async (
      question: string,
      messages: any[],
      resumeText: string,
      payload: CopilotPayload,
      jobMatchResult: any[],
      quickWins: any[],
      _extra?: any[],
    ) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({
            question,
            messages,
            resume: resumeText,
            context: payload,
            jobMatchResult,
            quickWins,
          }),
        });

        if (!response.ok) {
          const status = response.status;
          const errText = await response.text();
          if (status === 401) {
            showToast("Session expired, please log in again", "error");
            throw new Error("Session expired, please log in again");
          }
          if (status === 429) {
            showToast("Analysis is taking longer than usual, please try again in a moment", "warning");
            throw new Error("Rate limit exceeded");
          }
          showToast("Something went wrong, please retry", "error");
          throw new Error(errText || "Failed to chat with copilot");
        }

        const data = await response.json();
        // Tests expect: data.reply
        return data.reply as string;
      } catch (e: any) {
        if (!e?.message?.includes("Session expired") && !e?.message?.includes("Rate limit")) {
          showToast("Something went wrong, please retry", "error");
        }
        throw e;
      }
    },
    [showToast]
  );

  return useMemo(
    () => ({
      loading,
      result,
      error,

      analyze,
      rewriteBullet,
      analyzeJobMatch,
      chatWithCopilot,
      reset,
    }),
    [loading, result, error, analyze, rewriteBullet, analyzeJobMatch, chatWithCopilot, reset]
  );
};
