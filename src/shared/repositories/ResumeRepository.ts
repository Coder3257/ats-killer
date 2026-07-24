// Removed supabase import; using global supabase

export interface ResumeVersion {
  id: string;
  version_name: string;
  file_path: string;
  file_size: number;
  ats_score: number;
  notes?: string;
  raw_text?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  name: string;
  user_id: string;
  versions?: ResumeVersion[];
  created_at: string;
}

function getSupabase() {
  return (globalThis as any).supabase;
}

export class ResumeRepository {
  static async listResumes(userId: string): Promise<Resume[]> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("RESUMES_LIST");
      return fallback ? JSON.parse(fallback) : [];
    }

    const { data, error } = await client
      .from("resumes")
      .select("*, versions:resume_versions(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createResume(userId: string, name: string): Promise<Resume> {
    const client = getSupabase();
    if (!client) {
      const list = await this.listResumes(userId);
      const newResume: Resume = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        user_id: userId,
        created_at: new Date().toISOString(),
        versions: [],
      };
      list.push(newResume);
      localStorage.setItem("RESUMES_LIST", JSON.stringify(list));
      return newResume;
    }

    const { data, error } = await client
      .from("resumes")
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createVersion(
    resumeId: string,
    versionName: string,
    filePath: string,
    fileSize: number,
    atsScore: number,
    rawText: string
  ): Promise<ResumeVersion> {
    const client = getSupabase();
    if (!client) {
      // Local mock fallback
      const list = localStorage.getItem("RESUMES_LIST");
      const resumes: Resume[] = list ? JSON.parse(list) : [];
      const resume = resumes.find(r => r.id === resumeId);
      const newVersion: ResumeVersion = {
        id: Math.random().toString(36).substring(2, 9),
        version_name: versionName,
        file_path: filePath,
        file_size: fileSize,
        ats_score: atsScore,
        raw_text: rawText,
        created_at: new Date().toISOString(),
      };
      if (resume) {
        resume.versions = resume.versions || [];
        resume.versions.push(newVersion);
        localStorage.setItem("RESUMES_LIST", JSON.stringify(resumes));
      }
      return newVersion;
    }

    const { data, error } = await client
      .from("resume_versions")
      .insert({
        resume_id: resumeId,
        version_name: versionName,
        file_path: filePath,
        file_size: fileSize,
        ats_score: atsScore,
        raw_text: rawText,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
