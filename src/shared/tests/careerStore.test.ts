import { describe, it, expect, beforeEach } from "vitest";
import { useCareerStore } from "../stores/careerStore";

describe("useCareerStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useCareerStore.setState({
      achievements: [],
      loading: false,
      error: null,
    });
    (globalThis as any).setSupabaseClient(null);
  });

  it("should initialize with empty achievements list", () => {
    const state = useCareerStore.getState();
    expect(state.achievements).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it("should load achievements from repository fallback empty list", async () => {
    await useCareerStore.getState().loadAchievements("test-user");
    expect(useCareerStore.getState().achievements).toEqual([]);
  });

  it("should load populated achievements and support updates", async () => {
    const mockAchievements = [
      { id: "ach-1", name: "Resume Master", description: "Upload resume", progress: 0, unlock_percentage: 15, unlocked: false, icon: "📝" },
    ];
    localStorage.setItem("ACHIEVEMENTS_LIST", JSON.stringify(mockAchievements));

    await useCareerStore.getState().loadAchievements("test-user");
    expect(useCareerStore.getState().achievements).toHaveLength(1);
    expect(useCareerStore.getState().achievements[0].unlocked).toBe(false);

    await useCareerStore.getState().updateAchievement("test-user", "ach-1", 100, true);

    const state = useCareerStore.getState();
    expect(state.achievements[0].progress).toBe(100);
    expect(state.achievements[0].unlocked).toBe(true);

    const saved = JSON.parse(localStorage.getItem("ACHIEVEMENTS_LIST") || "[]");
    expect(saved[0].progress).toBe(100);
    expect(saved[0].unlocked).toBe(true);
  });
});
