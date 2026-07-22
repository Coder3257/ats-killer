import { create } from "zustand";
import { AnalysisService } from "../services/analysis.service";
import { AnalysisRecord } from "../repositories/AnalysisRepository";
import type { AnalysisResult } from "../types/geminiAnalyzerTypes";

interface AnalysisState {
  history: AnalysisRecord[];
  currentResult: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  resumeInput: string;
  jdInput: string;
  loadHistory: (userId: string) => Promise<void>;
  runAnalysis: (
    userId: string,
    versionId: string,
    resumeText: string,
    jdText: string,
    apiKey: string
  ) => Promise<AnalysisResult>;
  setCurrentResult: (result: AnalysisResult | null) => void;
  setResumeInput: (text: string) => void;
  setJdInput: (text: string) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  history: [],
  currentResult: null,
  loading: false,
  error: null,
  resumeInput: localStorage.getItem("latest_resume_text") || "",
  jdInput: localStorage.getItem("latest_jd_text") || "",

  loadHistory: async (userId) => {
    set({ loading: true, error: null });
    try {
      const history = await AnalysisService.getHistory(userId);
      set({ history, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  runAnalysis: async (userId, versionId, resumeText, jdText, apiKey) => {
    set({ loading: true, error: null });
    try {
      const result = await AnalysisService.runAnalysis(userId, versionId, resumeText, jdText, apiKey);
      set({ currentResult: result, loading: false });
      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  setCurrentResult: (currentResult) => set({ currentResult }),
  setResumeInput: (resumeInput) => {
    localStorage.setItem("latest_resume_text", resumeInput);
    set({ resumeInput });
  },
  setJdInput: (jdInput) => {
    localStorage.setItem("latest_jd_text", jdInput);
    set({ jdInput });
  },
}));
