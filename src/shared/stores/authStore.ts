import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { AuthService } from "../services/auth.service";
import { UserProfile } from "../repositories/UserRepository";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  loadProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  error: null,

  setSession: (session) => {
    const user = session?.user || null;
    set({ session, user, error: null });
    if (user) {
      useAuthStore.getState().loadProfile(user.id);
    } else {
      set({ profile: null });
    }
  },

  loadProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const profile = await AuthService.getProfile(userId);
      set({ profile, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await AuthService.signOut();
      set({ user: null, profile: null, session: null, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
