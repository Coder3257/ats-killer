import { supabase } from "../services/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  lifetime_access?: boolean;
}

export class UserRepository {
  static async getProfile(userId: string): Promise<UserProfile> {
    if (!supabase) {
      // Offline/Local Storage fallback
      return {
        id: userId,
        full_name: localStorage.getItem("PROFILE_NAME") || "Premium Guest",
        avatar_url: "",
        credits: parseInt(localStorage.getItem("USER_CREDITS") || "50", 10),
        lifetime_access: false,
      };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, lifetime_access")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const { data: credits } = await supabase
      .from("credits")
      .select("amount")
      .eq("user_id", userId)
      .single();

    return {
      id: userId,
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      credits: credits?.amount || 0,
      lifetime_access: !!profile?.lifetime_access,
    };
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    if (!supabase) {
      if (data.full_name) localStorage.setItem("PROFILE_NAME", data.full_name);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      })
      .eq("id", userId);

    if (error) throw error;
  }
}
