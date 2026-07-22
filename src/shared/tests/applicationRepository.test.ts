import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApplicationRepository } from "../repositories/ApplicationRepository";
import { mockSupabase } from "./setup";

describe("ApplicationRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should manage job applications in localStorage offline fallback", async () => {
      const listEmpty = await ApplicationRepository.listApplications("user-1");
      expect(listEmpty).toEqual([]);

      const appData = {
        company: "Stripe",
        position: "Staff Engineer",
        date_applied: "2026-07-10",
        resume_version: "V2_Core",
        ats_score: 91,
        status: "Applied" as const,
        notes: "Applied via career site",
        checklist: {
          resume_customized: true,
          cover_letter: true,
          linkedin_updated: true,
          portfolio_ready: true,
          github_updated: true,
          followup_sent: false,
          interview_scheduled: false,
        },
      };

      const created = await ApplicationRepository.createApplication("user-1", appData);
      expect(created.company).toBe("Stripe");
      expect(created.id).toBeDefined();

      let list = await ApplicationRepository.listApplications("user-1");
      expect(list).toHaveLength(1);
      expect(list[0].position).toBe("Staff Engineer");

      await ApplicationRepository.updateApplication("user-1", created.id, {
        status: "OA",
        notes: "OA received",
      });

      list = await ApplicationRepository.listApplications("user-1");
      expect(list[0].status).toBe("OA");
      expect(list[0].notes).toBe("OA received");

      await ApplicationRepository.deleteApplication("user-1", created.id);
      list = await ApplicationRepository.listApplications("user-1");
      expect(list).toHaveLength(0);
    });
  });

  describe("Online Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should query job applications table in Supabase", async () => {
      const mockRecords = [
        {
          id: "app-id-123",
          company: "Apple",
          role: "iOS Developer",
          date_applied: "2026-07-10",
          resume_version: "V1",
          ats_score: 82,
          status: "Interview",
          notes: "Notes",
          attachments: {
            checklist: { resume_customized: true },
          },
          timeline: [],
        },
      ];

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          order: vi.fn(() => Promise.resolve({ data: mockRecords, error: null })),
        };
        return query;
      });

      const list = await ApplicationRepository.listApplications("user-2");
      expect(list).toHaveLength(1);
      expect(list[0].company).toBe("Apple");
      expect(list[0].position).toBe("iOS Developer");
      expect(list[0].checklist.resume_customized).toBe(true);
    });
  });
});
