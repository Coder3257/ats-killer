import { supabase } from "../services/supabase/client";

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  progress: number;
  unlock_percentage: number;
  unlocked: boolean;
  icon: string;
}

export class AchievementRepository {
  static async listAchievements(userId: string): Promise<AchievementBadge[]> {
    if (!supabase) {
      const fallback = localStorage.getItem("ACHIEVEMENTS_LIST");
      return fallback ? JSON.parse(fallback) : [];
    }

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      progress: item.progress,
      unlock_percentage: item.unlock_percentage || 15,
      unlocked: item.unlocked,
      icon: item.icon || "🏆",
    }));
  }

  static async updateAchievement(userId: string, id: string, data: Partial<AchievementBadge>): Promise<void> {
    if (!supabase) {
      const list = await this.listAchievements(userId);
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        localStorage.setItem("ACHIEVEMENTS_LIST", JSON.stringify(list));
      }
      return;
    }

    const updates: any = {};
    if (data.progress !== undefined) updates.progress = data.progress;
    if (data.unlocked !== undefined) updates.unlocked = data.unlocked;

    const { error } = await supabase
      .from("achievements")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
