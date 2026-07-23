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
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: credits } = await supabase
      .from("credits")
      .select("amount")
      .eq("user_id", userId)
      .single();

    const hasActiveSub = subscription?.status === "active" && 
      new Date(subscription.current_period_end) > new Date();

    return {
      id: userId,
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      credits: credits?.amount || 0,
      lifetime_access: hasActiveSub,
    };
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    if (!supabase) {
      if (data.full_name) localStorage.setItem("PROFILE_NAME", data.full_name);
      return;
    }

    console.log("UserRepository.updateProfile starting:", { userId, data });
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      });

    if (error) {
      console.error("UserRepository.updateProfile failed:", error);
      throw error;
    }
    console.log("UserRepository.updateProfile completed successfully.");
  }
}
