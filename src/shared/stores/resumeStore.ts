import { create } from "zustand";
import { ResumeService } from "../services/resume.service";
import { Resume } from "../repositories/ResumeRepository";

interface ResumeState {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  loadResumes: (userId: string) => Promise<void>;
  uploadResume: (userId: string, file: File, versionName: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  loading: false,
  error: null,

  loadResumes: async (userId) => {
    set({ loading: true, error: null });
    try {
      const list = await ResumeService.listResumes(userId);
      set({ resumes: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  uploadResume: async (userId, file, versionName) => {
    set({ loading: true, error: null });
    try {
      await ResumeService.uploadResume(userId, file, versionName);
      const list = await ResumeService.listResumes(userId);
      set({ resumes: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
