import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeRepository } from "../repositories/ResumeRepository";
import { mockSupabase } from "./setup";

describe("ResumeRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should list, create resume and add version in localStorage", async () => {
      const resumesEmpty = await ResumeRepository.listResumes("usr-1");
      expect(resumesEmpty).toEqual([]);

      const created = await ResumeRepository.createResume("usr-1", "my_cv.pdf");
      expect(created.name).toBe("my_cv.pdf");
      expect(created.user_id).toBe("usr-1");

      const resumes = await ResumeRepository.listResumes("usr-1");
      expect(resumes).toHaveLength(1);
      expect(resumes[0].name).toBe("my_cv.pdf");

      const version = await ResumeRepository.createVersion(
        created.id,
        "V1",
        "mock://path",
        12345,
        78,
        "Resume Text Content"
      );
      expect(version.version_name).toBe("V1");
      expect(version.ats_score).toBe(78);

      const resumesWithVersion = await ResumeRepository.listResumes("usr-1");
      expect(resumesWithVersion[0].versions).toHaveLength(1);
      expect(resumesWithVersion[0].versions?.[0].version_name).toBe("V1");
    });
  });

  describe("Online Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should fetch resumes from Supabase", async () => {
      const mockData = [
        { id: "res-1", name: "Resume 1", user_id: "usr-2", created_at: "2026-07-10T00:00:00.000Z", resume_versions: [] },
      ];

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        };
        return query;
      });

      const list = await ResumeRepository.listResumes("usr-2");
      expect(list).toEqual(mockData);
    });

    it("should create a resume on Supabase", async () => {
      const mockResult = { id: "res-new", name: "New Resume", user_id: "usr-2" };

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          insert: vi.fn(() => query),
          select: vi.fn(() => query),
          single: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
        };
        return query;
      });

      const res = await ResumeRepository.createResume("usr-2", "New Resume");
      expect(res).toEqual(mockResult);
    });
  });
});
