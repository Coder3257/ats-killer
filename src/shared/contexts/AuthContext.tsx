import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "../services/supabase/client";

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  lifetime_access?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  hasConfig: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Supabase connection client is checked dynamically

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single();

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      const { data: creditsData } = await supabase
        .from("credits")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (profileErr) throw profileErr;

      const hasActiveSub = subscriptionData?.status === "active" && 
        new Date(subscriptionData.current_period_end) > new Date();

      setProfile({
        id: userId,
        full_name: profileData?.full_name || "",
        avatar_url: profileData?.avatar_url || "",
        credits: creditsData?.amount || 0,
        lifetime_access: hasActiveSub,
      });
    } catch (e: any) {
      // Fallback
      setProfile({
        id: userId,
        full_name: "SaaS Professional",
        avatar_url: "",
        credits: 10,
      });
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signOut,
        hasConfig: hasSupabaseConfig,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useUser = () => {
  const { user, profile } = useAuth();
  return { user, profile };
};

export const useSession = () => {
  const { session } = useAuth();
  return session;
};
