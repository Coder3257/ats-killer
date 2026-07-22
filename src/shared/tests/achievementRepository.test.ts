import { describe, it, expect, beforeEach, vi } from "vitest";
import { AchievementRepository } from "../repositories/AchievementRepository";
import { mockSupabase } from "./setup";

describe("AchievementRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should retrieve list and update progress in localStorage", async () => {
      const listEmpty = await AchievementRepository.listAchievements("user-1");
      expect(listEmpty).toEqual([]);

      const mockList = [
        { id: "badge-1", name: "AI Wizard", description: "Use AI analysis", progress: 0, unlock_percentage: 15, unlocked: false, icon: "🤖" },
      ];
      localStorage.setItem("ACHIEVEMENTS_LIST", JSON.stringify(mockList));

      let list = await AchievementRepository.listAchievements("user-1");
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("AI Wizard");

      await AchievementRepository.updateAchievement("user-1", "badge-1", { progress: 50, unlocked: true });
      list = await AchievementRepository.listAchievements("user-1");
      expect(list[0].progress).toBe(50);
      expect(list[0].unlocked).toBe(true);
    });
  });

  describe("Online Mode", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should query achievements from Supabase table", async () => {
      const mockRecord = {
        id: "badge-db-1",
        name: "First Application",
        description: "Apply to your first job",
        progress: 100,
        unlock_percentage: 20,
        unlocked: true,
        icon: "💼",
      };

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          order: vi.fn(() => Promise.resolve({ data: [mockRecord], error: null })),
        };
        return query;
      });

      const list = await AchievementRepository.listAchievements("user-2");
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("First Application");
      expect(list[0].unlocked).toBe(true);
    });
  });
});
