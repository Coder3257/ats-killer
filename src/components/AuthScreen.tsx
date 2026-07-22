import React, { useState } from "react";
import { useAuth } from "../shared/contexts/AuthContext";
import { Mail, Lock, User, Github, Chrome, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "../shared/contexts/ToastContext";
import { supabase } from "../shared/services/supabase/client";
import posthog from 'posthog-js';

interface AuthScreenProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AuthScreen({ onSuccess, onClose }: AuthScreenProps) {
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error("Service unavailable, try again. Database client is not configured.");
      }

      if (isLogin) {
        // Real Login Call
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Explicit Error Handling
          if (signInError.status === 400 || signInError.message.includes("Invalid login credentials")) {
            throw new Error("Incorrect email or password. Please verify and try again.");
          }
          throw signInError;
        }

        // Track user sign in
        try {
          if (typeof window !== 'undefined') {
            posthog.capture('user_signed_in');
          }
        } catch (trackErr) {
          console.warn('Failed to track user_signed_in event from login:', trackErr);
        }

        showToast("Welcome back! Redirecting to workspace...", "success");
        onSuccess();
      } else {
        // Real Sign Up Call
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) {
          console.log("RAW SUPABASE SIGNUP ERROR:", {
            message: signUpError.message,
            status: signUpError.status,
            name: signUpError.name,
            raw: signUpError,
          });
          // Explicit Error Handling
          if (signUpError.message.includes("User already registered") || signUpError.status === 422) {
            throw new Error("An account with this email address already exists. Try logging in.");
          }
          if (signUpError.message.toLowerCase().includes("weak") || signUpError.message.includes("should be at least 6 characters")) {
            throw new Error("Password is too weak. Please choose a stronger password (at least 6 characters).");
          }
          throw signUpError;
        }

        // Track sign up completion
        try {
          if (typeof window !== 'undefined') {
            posthog.capture('signup_completed');
          }
        } catch (trackErr) {
          console.warn('Failed to track signup_completed event:', trackErr);
        }

        // Check if email confirmation is required (session is null on signup)
        if (data.user && !data.session) {
          setVerificationSent(true);
          showToast("Account created! Please confirm your email to log in.", "info");
        } else {
          showToast("Account created successfully! Redirecting...", "success");
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      showToast(err.message || "Failed to authenticate.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    if (!supabase) {
      setError("Service unavailable, try again. Database client is not configured.");
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || "OAuth login failed.");
      showToast(err.message || "OAuth login failed.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1008]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4E453F] hover:text-[#1C1008] text-sm font-mono cursor-pointer"
        >
          ✕
        </button>

        {/* LOGO HEADER */}
        <div className="text-center space-y-2">
          <div className="bg-[#FEF3C7] p-2 rounded-2xl w-fit mx-auto text-[#D97706] border border-[#D97706]/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-display font-extrabold text-[#1C1008]">
            {!supabase ? "Service Unavailable" : verificationSent ? "Check your inbox" : isLogin ? "Welcome back" : "Create your account"}
          </h3>
          <p className="text-xs text-[#4E453F] font-semibold">
            ATS Killer Premium SaaS Operating System
          </p>
        </div>

        {/* ERROR SUMMARY */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-xs text-rose-950 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!supabase ? (
          <div className="space-y-6 text-center">
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-950 space-y-2">
              <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                Service unavailable, try again.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#1C1008] text-white hover:bg-stone-900 transition-all rounded-2xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : verificationSent ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50/50 text-[#1C1008] p-4 rounded-2xl border border-emerald-100 space-y-2">
              <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                We've sent a verification link to <span className="text-[#D97706] font-bold">{email}</span>.
                Please click the link in your email to confirm your account and log in.
              </p>
            </div>
            <button
              onClick={() => {
                setVerificationSent(false);
                setIsLogin(true);
                setError(null);
              }}
              className="w-full py-3 bg-[#1C1008] text-white hover:bg-stone-900 transition-all rounded-2xl text-xs font-bold cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 focus:border-[#D97706] rounded-2xl text-xs font-semibold focus:outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 focus:border-[#D97706] rounded-2xl text-xs font-semibold focus:outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 focus:border-[#D97706] rounded-2xl text-xs font-semibold focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1C1008] text-white hover:bg-stone-900 transition-all rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? "Verifying..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            {/* OAUTH SECTION */}
            <div className="space-y-4 pt-2 border-t border-[#E5E0D8]/40">
              <div className="text-center">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block">Or login via OAuth SSO</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuth("google")}
                  className="py-2.5 border border-[#E5E0D8]/60 hover:bg-[#FAF8F5] rounded-2xl text-[11px] font-bold text-[#1C1008] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Chrome className="h-4 w-4 text-[#D97706]" />
                  <span>Google</span>
                </button>

                <button
                  onClick={() => handleOAuth("github")}
                  className="py-2.5 border border-[#E5E0D8]/60 hover:bg-[#FAF8F5] rounded-2xl text-[11px] font-bold text-[#1C1008] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Github className="h-4 w-4 text-stone-800" />
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* SWITCH TYPE */}
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[11px] text-[#D97706] hover:underline font-semibold cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}