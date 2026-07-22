import { supabase } from "./supabase/client";
import { ResumeRepository, Resume, ResumeVersion } from "../repositories/ResumeRepository";

export class ResumeService {
  static async uploadResume(
    userId: string,
    file: File,
    versionName: string
  ): Promise<{ resume: Resume; version: ResumeVersion }> {
    // 1. Create resume record if it doesn't exist (using file name as reference)
    const list = await ResumeRepository.listResumes(userId);
    let resume = list.find(r => r.name.toLowerCase() === file.name.toLowerCase());
    if (!resume) {
      resume = await ResumeRepository.createResume(userId, file.name);
    }

    // 2. Upload file to Supabase Storage if configured
    let filePath = `resumes/${userId}/${resume.id}_${Date.now()}_${file.name}`;
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) {
        // Fallback or retry
        console.warn("Storage upload failed, fallback to mock path", uploadError);
      }
    }

    // 3. Extract text content (for mock testing/offline, read as text; in production, parsed by parser API)
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsText(file.slice(0, 10000)); // Read first 10k characters
    });

    // 4. Create resume version entry with mock ATS score (seeded randomly if new)
    const mockAts = Math.floor(Math.random() * 30) + 60; // 60-90
    const version = await ResumeRepository.createVersion(
      resume.id,
      versionName,
      filePath,
      file.size,
      mockAts,
      text
    );

    return { resume, version };
  }

  static async listResumes(userId: string): Promise<Resume[]> {
    return ResumeRepository.listResumes(userId);
  }
}
