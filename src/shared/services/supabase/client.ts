import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || "").trim();

// Create client only if configuration is provided, otherwise export null for graceful fallbacks
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const hasSupabaseConfig = !!supabase;
