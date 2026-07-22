import { describe, it, expect, beforeEach, vi } from "vitest";
import { InterviewRepository } from "../repositories/InterviewRepository";
import { mockSupabase } from "./setup";

describe("InterviewRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should manage interview memory logs in localStorage", async () => {
      const listEmpty = await InterviewRepository.listInterviews("user-1");
      expect(listEmpty).toEqual([]);

      const mockInterview = {
        date: "2026-07-10",
        company: "Netflix",
        rounds: ["System Design"],
        technical_questions: ["Design Netflix"],
        behavioral_questions: ["Why Netflix?"],
        feedback: "Went well",
        weak_areas: ["Caching"],
      };

      const created = await InterviewRepository.createInterview("user-1", mockInterview);
      expect(created.company).toBe("Netflix");
      expect(created.id).toBeDefined();

      let list = await InterviewRepository.listInterviews("user-1");
      expect(list).toHaveLength(1);
      expect(list[0].rounds).toEqual(["System Design"]);
    });
  });

  describe("Online Mode (Supabase Integration)", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should insert a new application first if none exists for the company", async () => {
      const insertedApp = { id: "app-generated-id", company: "Meta", role: "Interview Prep Reference" };
      const insertedInterview = { id: "int-id", company: "Meta", date: "2026-07-10", rounds: [], technical_questions: [], behavioral_questions: [], feedback: "", weak_areas: [] };

      mockSupabase.from.mockImplementation((table: string): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          limit: vi.fn(() => {
            // First call: check existing apps (return empty list)
            return Promise.resolve({ data: [], error: null });
          }),
          insert: vi.fn(() => query),
          single: vi.fn(() => {
            if (table === "job_applications") {
              return Promise.resolve({ data: insertedApp, error: null });
            } else if (table === "interviews") {
              return Promise.resolve({ data: insertedInterview, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return query;
      });

      const interviewData = {
        date: "2026-07-10",
        company: "Meta",
        rounds: [],
        technical_questions: [],
        behavioral_questions: [],
        feedback: "",
        weak_areas: [],
      };

      const result = await InterviewRepository.createInterview("user-2", interviewData);
      expect(result.company).toBe("Meta");
      expect(result.id).toBe("int-id");
    });

    it("should reuse existing application if one exists for the company", async () => {
      const existingApp = { id: "app-existing-id" };
      const insertedInterview = { id: "int-id-2", company: "Meta", date: "2026-07-10", rounds: [], technical_questions: [], behavioral_questions: [], feedback: "", weak_areas: [] };

      mockSupabase.from.mockImplementation((table: string): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          limit: vi.fn(() => {
            // Return existing app
            return Promise.resolve({ data: [existingApp], error: null });
          }),
          insert: vi.fn(() => query),
          single: vi.fn(() => {
            if (table === "interviews") {
              return Promise.resolve({ data: insertedInterview, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return query;
      });

      const interviewData = {
        date: "2026-07-10",
        company: "Meta",
        rounds: [],
        technical_questions: [],
        behavioral_questions: [],
        feedback: "",
        weak_areas: [],
      };

      const result = await InterviewRepository.createInterview("user-2", interviewData);
      expect(result.company).toBe("Meta");
      expect(result.id).toBe("int-id-2");
    });
  });
});
