import type { AnalysisResult } from "../types/geminiAnalyzerTypes";

function getSupabase() {
  return (globalThis as any).supabase;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  resume_version_id: string;
  job_description: string;
  ats_score: number;
  recruiter_intelligence: any;
  career_intelligence: any;
  opportunity_engine: any;
  career_dashboard: any;
  created_at: string;
}

export class AnalysisRepository {
  static async saveAnalysis(
    userId: string,
    versionId: string,
    jd: string,
    result: AnalysisResult
  ): Promise<AnalysisRecord> {
    const record = {
      user_id: userId,
      resume_version_id: versionId,
      job_description: jd,
      ats_score: result.score,
      recruiter_intelligence: result.recruiter_eyes,
      career_intelligence: result.career_roadmap,
      opportunity_engine: result.opportunity_engine,
      career_dashboard: result.career_dashboard,
    };

    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("ANALYSES_LIST");
      const list: AnalysisRecord[] = fallback ? JSON.parse(fallback) : [];
      const newRecord: AnalysisRecord = {
        id: Math.random().toString(36).substring(2, 9),
        ...record,
        created_at: new Date().toISOString(),
      };
      list.push(newRecord);
      localStorage.setItem("ANALYSES_LIST", JSON.stringify(list));
      return newRecord;
    }

    const { data, error } = await client
      .from("analyses")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("ANALYSES_LIST");
      return fallback ? JSON.parse(fallback) : [];
    }

    const { data, error } = await client
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async listAnalysesWithResume(userId: string): Promise<any[]> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("ANALYSES_LIST");
      const list = fallback ? JSON.parse(fallback) : [];
      return list.map((record: any) => ({
        ...record,
        resume_versions: {
          version_name: "Local Version",
          raw_text: localStorage.getItem("latest_resume_text") || "Local resume text preview..."
        }
      }));
    }

    const { data, error } = await client
      .from("analyses")
      .select("*, resume_versions(version_name, raw_text)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async deleteAnalysis(id: string): Promise<void> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("ANALYSES_LIST");
      if (fallback) {
        const list = JSON.parse(fallback);
        const filtered = list.filter((item: any) => item.id !== id);
        localStorage.setItem("ANALYSES_LIST", JSON.stringify(filtered));
      }
      return;
    }
    const { error } = await client
      .from("analyses")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}
