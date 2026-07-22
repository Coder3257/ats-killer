import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabaseUrl = (process.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || "").trim();

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function getSupabaseAdmin() {
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }) : null;
}

const LIMIT = 60; // 60 requests per minute
const WINDOW_MS = 60 * 1000;
const inMemoryLimits = new Map<string, { count: number; resetTime: number }>();

export async function verifyAuth(req: VercelRequest, res: VercelResponse): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!supabase) {
    res.status(401).json({ error: "Server authentication misconfigured." });
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      return user.id;
    }
  } catch (err: any) {
    // Fall through
  }

  res.status(401).json({ error: "Unauthorized: Invalid Supabase token" });
  return null;
}

export async function rateLimit(userId: string, res: VercelResponse, req: VercelRequest): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(" ")[1] : null;
    const client = token 
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false,
          },
        })
      : supabase;

    // Call the atomic increment RPC function
    const { data: isLimited, error } = await client.rpc("increment_rate_limit", {
      p_user_id: userId,
      p_limit: LIMIT,
      p_window_ms: WINDOW_MS
    });

    if (error) {
      // If the RPC function is not found (PGRST202), fall back to in-memory rate limiter only in local development
      if (error.code === "PGRST202") {
        const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
        if (isProd) {
          console.error("CRITICAL: increment_rate_limit RPC function is missing from the production database.");
          res.status(500).json({ error: "Server rate limiting configuration error. Required DB functions are missing." });
          return true;
        }

        const now = Date.now();
        let limit = inMemoryLimits.get(userId);
        if (!limit || now > limit.resetTime) {
          limit = { count: 1, resetTime: now + WINDOW_MS };
          inMemoryLimits.set(userId, limit);
          return false;
        }

        if (limit.count >= LIMIT) {
          res.status(429).json({ error: "Too many requests. Please try again in a minute." });
          return true;
        }

        limit.count++;
        return false;
      }

      console.error("Rate limit RPC error:", error);
      return false; // Fail open
    }

    if (isLimited) {
      res.status(429).json({ error: "Too many requests. Please try again in a minute." });
      return true;
    }

    return false;
  } catch (err) {
    console.error("Exception in rateLimit logic:", err);
    return false; // Fail open
  }
}
