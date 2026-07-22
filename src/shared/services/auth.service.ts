import { supabase } from "./supabase/client";
import { UserRepository, UserProfile } from "../repositories/UserRepository";

export class AuthService {
  static async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getProfile(userId: string): Promise<UserProfile> {
    return UserRepository.getProfile(userId);
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    return UserRepository.updateProfile(userId, data);
  }

  static async signOut(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
