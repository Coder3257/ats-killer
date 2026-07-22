import { create } from "zustand";
import { AchievementRepository, AchievementBadge } from "../repositories/AchievementRepository";

interface CareerState {
  achievements: AchievementBadge[];
  loading: boolean;
  error: string | null;
  loadAchievements: (userId: string) => Promise<void>;
  updateAchievement: (userId: string, id: string, progress: number, unlocked: boolean) => Promise<void>;
}

export const useCareerStore = create<CareerState>((set) => ({
  achievements: [],
  loading: false,
  error: null,

  loadAchievements: async (userId) => {
    set({ loading: true, error: null });
    try {
      const list = await AchievementRepository.listAchievements(userId);
      set({ achievements: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateAchievement: async (userId, id, progress, unlocked) => {
    set({ loading: true, error: null });
    try {
      await AchievementRepository.updateAchievement(userId, id, { progress, unlocked });
      const list = await AchievementRepository.listAchievements(userId);
      set({ achievements: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
