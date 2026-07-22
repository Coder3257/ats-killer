import { AnalysisRepository, AnalysisRecord } from "../repositories/AnalysisRepository";
import type { AnalysisResult } from "../types/geminiAnalyzerTypes";
import { supabase } from "./supabase/client";

export class AnalysisService {
  static async runAnalysis(
    userId: string,
    versionId: string,
    resumeText: string,
    jdText: string,
    apiKey: string
  ): Promise<AnalysisResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers,
      body: JSON.stringify({
        resume: resumeText,
        jd: jdText,
        apiKey: apiKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "SaaS analysis endpoint failed.");
    }

    const result = await response.json();

    // Persist in repository
    try {
      await AnalysisRepository.saveAnalysis(userId, versionId, jdText, result);
    } catch (dbErr) {
      console.warn("Failed to persist analysis history to DB:", dbErr);
    }

    return result;
  }

  static async getHistory(userId: string): Promise<AnalysisRecord[]> {
    return AnalysisRepository.listAnalyses(userId);
  }
}
