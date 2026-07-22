import { describe, it, expect, beforeEach, vi } from "vitest";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { mockSupabase } from "./setup";

describe("AnalysisRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should save and retrieve analyses in localStorage", async () => {
      const empty = await AnalysisRepository.listAnalyses("user-1");
      expect(empty).toEqual([]);

      const mockResult = {
        score: 87,
        recruiter_eyes: { strongest_section: "Experience" },
        career_roadmap: {},
        opportunity_engine: {},
        career_dashboard: {},
      } as any;

      const record = await AnalysisRepository.saveAnalysis("user-1", "ver-1", "Job desc", mockResult);
      expect(record.ats_score).toBe(87);
      expect(record.job_description).toBe("Job desc");

      const list = await AnalysisRepository.listAnalyses("user-1");
      expect(list).toHaveLength(1);
      expect(list[0].ats_score).toBe(87);
    });
  });

  describe("Online Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should query analysis history from Supabase", async () => {
      const mockRecords = [
        { id: "an-1", user_id: "user-2", ats_score: 93 },
      ];

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          order: vi.fn(() => Promise.resolve({ data: mockRecords, error: null })),
        };
        return query;
      });

      const list = await AnalysisRepository.listAnalyses("user-2");
      expect(list).toHaveLength(1);
      expect(list[0].ats_score).toBe(93);
    });
  });
});
