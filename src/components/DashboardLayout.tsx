import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Bot,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Sparkles,
  ChevronRight,
  Menu,
  History,
  X,
} from "lucide-react";
import { useAuth } from "../shared/contexts/AuthContext";
import { useToast } from "../shared/contexts/ToastContext";
import { UserRepository } from "../shared/repositories/UserRepository";
import { useAnalysisStore } from "../shared/stores/analysisStore";
import { useApplicationStore } from "../shared/stores/applicationStore";

const CareerDashboard = lazy(() => import("./CareerDashboard"));
const Analyzer = lazy(() => import("./Analyzer"));
const JobSearchWorkspace = lazy(() => import("./JobSearchWorkspace"));
const AICareerCopilot = lazy(() => import("./AICareerCopilot"));
const CareerIntelligence = lazy(() => import("./CareerIntelligence"));
const Pricing = lazy(() => import("./Pricing"));
const AnalysisHistory = lazy(() => import("./AnalysisHistory"));

function TabLoadingFallback() {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-12 premium-shadow">
      <div className="h-6 w-6 border-2 border-[#D97706]/40 border-t-[#D97706] rounded-full animate-spin mx-auto" />
      <p className="text-[11px] font-mono text-stone-400 uppercase tracking-wider animate-pulse">
        Retrieving workspace module...
      </p>
    </div>
  );
}

const FloatingToolkit = lazy(() => import("./FloatingToolkit"));

interface DashboardLayoutProps {
  onLogout: () => void;
}

type TabType = "dashboard" | "analyzer" | "applications" | "copilot" | "progress" | "history" | "billing" | "settings";

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "analyzer", label: "Resume Analyzer", icon: FileText },
    { id: "applications", label: "Applications Workspace", icon: Briefcase },
    { id: "copilot", label: "AI Career Copilot", icon: Bot },
    { id: "progress", label: "Career Intelligence", icon: TrendingUp },
    { id: "history", label: "Scan History", icon: History },
    { id: "billing", label: "SaaS Pricing & Plans", icon: CreditCard },
    { id: "settings", label: "Profile Settings", icon: Settings },
  ] as const;
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreditsMenu, setShowCreditsMenu] = useState(false);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const analysisHistory = useAnalysisStore((state) => state.history);
  const loadAnalysisHistory = useAnalysisStore((state) => state.loadHistory);
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore((state) => state.loadApplications);

  useEffect(() => {
    if (user?.id) {
      loadAnalysisHistory(user.id).catch(() => {});
      loadApplications(user.id).catch(() => {});
    }
  }, [user?.id, loadAnalysisHistory, loadApplications]);

  // Compute user streak and weekly activity
  const currentStreak = useMemo(() => {
    if (!analysisHistory || analysisHistory.length === 0) return 0;
    const scanDates = new Set<string>();
    analysisHistory.forEach((entry) => {
      try {
        if (entry.created_at) {
          const dateStr = new Date(entry.created_at).toLocaleDateString("en-CA");
          scanDates.add(dateStr);
        }
      } catch (e) {}
    });

    const today = new Date();
    const todayStr = today.toLocaleDateString("en-CA");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    if (!scanDates.has(todayStr) && !scanDates.has(yesterdayStr)) {
      return 0;
    }

    const currentDay = scanDates.has(todayStr) ? today : yesterday;
    let streak = 0;

    while (true) {
      const currentDayStr = currentDay.toLocaleDateString("en-CA");
      if (scanDates.has(currentDayStr)) {
        streak++;
        currentDay.setDate(currentDay.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [analysisHistory]);

  const weeklyScans = useMemo(() => {
    if (!analysisHistory || analysisHistory.length === 0) return 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return analysisHistory.filter((entry) => {
      try {
        return entry.created_at && new Date(entry.created_at).getTime() >= sevenDaysAgo;
      } catch (e) {
        return false;
      }
    }).length;
  }, [analysisHistory]);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || "");
      setProfileAvatar(profile.avatar_url || "");
    }
  }, [profile]);

  // Retrieve latest results from localStorage to share across modules
  const [analysisResult, setAnalysisResult] = useState<any>(() => {
    const saved = localStorage.getItem("latest_analysis_result");
    return saved ? JSON.parse(saved) : null;
  });
  const result = analysisResult;
  const resume = localStorage.getItem("latest_resume_text") || "";

  const handleLoadAnalysis = (resultPayload: any, resumeText: string, jdText: string) => {
    localStorage.setItem("latest_analysis_result", JSON.stringify(resultPayload));
    localStorage.setItem("latest_resume_text", resumeText);
    localStorage.setItem("latest_jd_text", jdText);
    setAnalysisResult(resultPayload);
  };

  const handleAnalysisSuccess = (newResult: any) => {
    setAnalysisResult(newResult);
  };



  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#FAF8F5] text-[#1C1008] font-sans antialiased flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#1C1008] text-white shrink-0 hidden md:flex flex-col justify-between p-6 border-r border-[#1C1008]/20">
        <div className="space-y-8">
          
          {/* LOGO AREA */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="bg-[#D97706] p-1.5 rounded-xl text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-tight">ATS Killer SaaS</h1>
              <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider">Enterprise OS</span>
            </div>
          </div>

          {/* NAV LINKS */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#D97706] text-white shadow-md shadow-[#D97706]/10"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* LOGOUT FOOTER */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={async () => {
              await signOut();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:bg-rose-950/20 hover:text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR BAR */}
        <header className="bg-white border-b border-[#E5E0D8]/60 h-16 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50 select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMobileSidebarOpen(true);
              }}
              className="md:hidden text-[#1C1008] p-1 cursor-pointer hover:bg-[#FAF8F5] rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-[#1C1008]">
                Welcome back, <span className="text-[#D97706]">{profile?.full_name || user?.email || "Premium Guest"}</span>
              </span>
              <div className="h-4 w-[1px] bg-[#E5E0D8]/60" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] font-mono font-bold text-[#4E453F]">
              <span className="bg-[#FAF8F5] border border-[#E5E0D8]/60 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg flex items-center gap-1">
                📊 <span className="text-[#1C1008]">{analysisHistory.length}</span>
                <span className="hidden sm:inline"> Scans</span>
              </span>
              <span className="bg-[#FAF8F5] border border-[#E5E0D8]/60 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg flex items-center gap-1">
                💼 <span className="text-[#1C1008]">{applications.length}</span>
                <span className="hidden sm:inline"> Applications</span>
              </span>
              <span className="bg-[#FAF8F5] border border-[#E5E0D8]/60 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg flex items-center gap-1">
                🔥 <span className="text-[#1C1008]">{currentStreak}d</span>
                <span className="hidden sm:inline"> Streak</span>
              </span>
              <span className="bg-[#FAF8F5] border border-[#E5E0D8]/60 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg flex items-center gap-1">
                📅 <span className="text-[#1C1008]">{weeklyScans}</span>
                <span className="hidden sm:inline"> This Week</span>
              </span>
            </div>
          </div>
 
          <div className="flex items-center gap-4.5">
            {/* CREDITS COUNTER */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlanModal(true);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                  setShowCreditsMenu(false);
                }}
                className="bg-[#FAF8F5] border border-[#E5E0D8]/40 hover:bg-[#F5F0E8] transition-colors px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold text-[#1C1008] cursor-pointer animate-fade-in"
              >
                <span className="text-[#D97706]">🪙</span>
                <span>{profile?.lifetime_access ? "Lifetime Access" : `${profile?.credits ?? 50} credits`}</span>
              </button>
 
              {showCreditsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowCreditsMenu(false)}
                  />
                  
                  <div className="fixed top-16 left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:w-72 mt-2 bg-white border border-[#E5E0D8] rounded-2xl shadow-xl p-5 space-y-4.5 z-50 animate-pop-in text-xs font-semibold max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="border-b border-[#E5E0D8]/60 pb-3 flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider">Plan & AI Quota</span>
                      <span className="text-[9px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#D97706]/20 uppercase">
                        {profile?.lifetime_access ? "Pro Active" : "Basic Trial"}
                      </span>
                    </div>
 
                    <div className="space-y-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-4 rounded-2xl">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#4E453F] font-semibold text-[11px]">AI Quota Limit:</span>
                        <span className="text-[#1C1008] font-bold">
                          {profile?.lifetime_access ? "Unlimited Scans" : "50 Free Scans"}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#4E453F] font-semibold text-[11px]">Current Balance:</span>
                        <span className="text-[#D97706] font-extrabold font-mono">
                          {profile?.lifetime_access ? "Infinite" : `${profile?.credits ?? 50} / 50`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-stone-200/60 rounded-full overflow-hidden w-full mt-1">
                        <div 
                          className="h-full bg-[#D97706] rounded-full" 
                          style={{ width: profile?.lifetime_access ? "100%" : `${((profile?.credits ?? 50) / 50) * 100}%` }} 
                        />
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Credit Usage Rates</span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between items-center text-[#4E453F] font-medium">
                          <span>AI Resume Analysis</span>
                          <span className="font-mono text-[#1C1008] font-bold">1 credit / scan</span>
                        </div>
                        <div className="flex justify-between items-center text-[#4E453F] font-medium">
                          <span>Pre-Application Optimizers</span>
                          <span className="font-mono text-[#1C1008] font-bold">0 credits (Free)</span>
                        </div>
                        <div className="flex justify-between items-center text-[#4E453F] font-medium">
                          <span>Interactive AI Copilot</span>
                          <span className="font-mono text-[#1C1008] font-bold">0 credits (Free)</span>
                        </div>
                      </div>
                    </div>
 
                    <div className="border-t border-[#E5E0D8]/60 pt-3">
                      <button
                        onClick={() => {
                          setActiveTab("billing");
                          setShowCreditsMenu(false);
                        }}
                        className="w-full bg-[#1C1008] hover:bg-stone-900 text-white font-bold py-2.5 rounded-xl text-center text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Upgrade Plan / Buy Credits
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
 
            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowCreditsMenu(false);
                  setShowProfileMenu(false);
                }}
                className="p-2 bg-[#FAF8F5] border border-[#E5E0D8]/40 hover:bg-[#F5F0E8] rounded-xl text-[#4E453F] transition-all relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#D97706] rounded-full animate-ping" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#D97706] rounded-full" />
              </button>
 
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  <div className="fixed top-16 left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:w-80 mt-2 bg-white border border-[#E5E0D8] rounded-2xl shadow-xl p-5 space-y-4 z-50 animate-pop-in text-xs font-semibold max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="flex justify-between border-b border-[#E5E0D8]/60 pb-2">
                      <span className="font-bold text-[#1C1008] text-xs">Activity & Career Alerts</span>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[10px] text-[#D97706] hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
 
                    {/* SCORE & PROGRESS QUICK-LOOK */}
                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#4E453F] text-[10px] uppercase font-mono font-bold tracking-wider">ATS Score Diagnostic</span>
                        <span className="text-[10px] font-mono font-extrabold text-[#10B981] bg-[#D1FAE5] px-1.5 py-0.5 rounded">
                          +12% Trend
                        </span>
                      </div>
                      
                      {result ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[#1C1008] font-extrabold text-sm">{result.score}% Compatibility</span>
                            <span className="text-[10px] text-[#4E453F]/60 font-mono font-bold">Good Standing</span>
                          </div>
                          <div className="h-1 bg-stone-200 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${result.score}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <p className="text-[#1C1008] text-[11px] font-bold">Uncalibrated Profile</p>
                          <button
                            onClick={() => {
                              setActiveTab("analyzer");
                              setShowNotifications(false);
                            }}
                            className="text-[9px] text-[#D97706] font-mono hover:underline font-bold uppercase mt-1 cursor-pointer block mx-auto"
                          >
                            Run First Analysis
                          </button>
                        </div>
                      )}
                    </div>
 
                    {/* ACTIONABLE ENGAGEMENT NUDGES */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Recommended Actions</span>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setActiveTab("progress");
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-[#FAF8F5] border border-transparent hover:border-[#E5E0D8]/60 rounded-xl transition-all flex items-start gap-2 group cursor-pointer"
                        >
                          <span className="text-sm shrink-0 mt-0.5">⚠️</span>
                          <div>
                            <p className="text-[11px] font-extrabold text-[#1C1008] group-hover:text-[#D97706] transition-colors">Resolve Critical Gaps</p>
                            <p className="text-[9px] text-[#4E453F]/75 font-semibold leading-relaxed mt-0.5">Fix primary missing keywords to bypass automated parsing filters.</p>
                          </div>
                        </button>
 
                        <button
                          onClick={() => {
                            setActiveTab("applications");
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-[#FAF8F5] border border-transparent hover:border-[#E5E0D8]/60 rounded-xl transition-all flex items-start gap-2 group cursor-pointer"
                        >
                          <span className="text-sm shrink-0 mt-0.5">📅</span>
                          <div>
                            <p className="text-[11px] font-extrabold text-[#1C1008] group-hover:text-[#D97706] transition-colors">Pending Follow-ups</p>
                            <p className="text-[9px] text-[#4E453F]/75 font-semibold leading-relaxed mt-0.5">You have active application opportunities that reached review stage today.</p>
                          </div>
                        </button>
                      </div>
                    </div>
 
                    {/* MONETISATION & UPSELL ADS */}
                    <div className="border-t border-[#E5E0D8]/60 pt-3.5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">Membership Perks</span>
                      
                      <button
                        onClick={() => {
                          setActiveTab("billing");
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-3 bg-gradient-to-br from-amber-50 to-[#FEF3C7]/40 border border-[#D97706]/15 hover:border-[#D97706]/35 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer"
                      >
                        <span className="text-base shrink-0">💎</span>
                        <div>
                          <p className="text-[11px] font-extrabold text-[#92400E]">Unlock Recruiter View™</p>
                          <p className="text-[9px] text-[#92400E]/80 font-semibold leading-relaxed mt-0.5">
                            Export standard ATS PDF templates and unlock infinite analysis triggers with Pro.
                          </p>
                        </div>
                      </button>
 
                      <button
                        onClick={() => {
                          setActiveTab("billing");
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-stone-50 border border-dashed border-stone-200 hover:border-stone-400 rounded-xl transition-all flex items-start gap-2 group cursor-pointer"
                      >
                        <span className="text-xs shrink-0 mt-0.5">🪙</span>
                        <div className="flex-1 flex justify-between items-center gap-1.5">
                          <div>
                            <p className="text-[10px] font-extrabold text-[#1C1008]">Need extra credits?</p>
                            <p className="text-[8px] text-stone-500 font-semibold mt-0.5">Get 10 fresh scans for only $4.99</p>
                          </div>
                          <span className="bg-[#1C1008] text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase shrink-0">Buy Boost</span>
                        </div>
                      </button>
                    </div>
 
                  </div>
                </>
              )}
            </div>
 
            {/* PROFILE MENU */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                  setShowCreditsMenu(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 pl-3.5 border-l border-[#E5E0D8]/60 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="h-8 w-8 bg-[#FEF3C7] border border-[#D97706]/20 rounded-full flex items-center justify-center text-[#D97706] shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                 <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-[#1C1008]">{profile?.full_name || "Premium Guest"}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlanModal(true);
                      setShowProfileMenu(false);
                      setShowNotifications(false);
                      setShowCreditsMenu(false);
                    }}
                    className="text-[9px] font-mono text-[#D97706] font-extrabold uppercase hover:underline cursor-pointer block text-left"
                  >
                    SaaS Active
                  </button>
                </div>
              </button>
 
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  
                  <div className="fixed top-16 left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:w-56 mt-2 bg-white border border-[#E5E0D8] rounded-2xl shadow-xl p-4 space-y-3.5 z-50 animate-pop-in text-xs font-semibold max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="border-b border-[#E5E0D8]/60 pb-3">
                      <p className="text-xs font-extrabold text-[#1C1008] truncate">{profile?.full_name || "Premium Guest"}</p>
                      <p className="text-[10px] text-stone-500 font-semibold truncate mt-0.5">{user?.email || "guest@***REMOVED***.com"}</p>
                    </div>
 
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab("settings");
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-[#FAF8F5] text-stone-700 hover:text-[#1C1008] transition-colors cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-stone-400" />
                        <span>Account Settings</span>
                      </button>
 
                      <button
                        onClick={() => {
                          setActiveTab("billing");
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-[#FAF8F5] text-stone-700 hover:text-[#1C1008] transition-colors cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 text-stone-400" />
                        <span>Billing & Credits</span>
                      </button>
                    </div>
 
                    <div className="border-t border-[#E5E0D8]/60 pt-2.5">
                      <button
                        onClick={async () => {
                          setShowProfileMenu(false);
                          await signOut();
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* WORKSPACE CONTENT ROUTER */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          <Suspense fallback={<TabLoadingFallback />}>
            {activeTab === "dashboard" && (
              result ? (
                <div className="space-y-8">
                  <CareerDashboard result={result} animate={true} onNavigateTab={setActiveTab} />
                </div>
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 my-12 premium-shadow">
                  <LayoutDashboard className="h-12 w-12 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#1C1008]">Dashboard Locked</h4>
                  <p className="text-xs text-[#4E453F] leading-relaxed">
                    Run your first AI resume compatibility analysis to populate progression metrics, weekly milestones, and evolution goals.
                  </p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="px-5 py-2.5 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to Analyzer</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}

            {activeTab === "analyzer" && <Analyzer />}

            {activeTab === "applications" && (
              result ? (
                <JobSearchWorkspace initialResult={result} resume={resume} />
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 my-12 premium-shadow">
                  <Briefcase className="h-12 w-12 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#1C1008]">Applications Board Locked</h4>
                  <p className="text-xs text-[#4E453F] leading-relaxed">
                    Analyze your resume first to seed your job search workspace.
                  </p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="px-5 py-2.5 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to Analyzer</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}

            {activeTab === "copilot" && (
              result ? (
                <AICareerCopilot result={result} resume={resume} />
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 my-12 premium-shadow">
                  <Bot className="h-12 w-12 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#1C1008]">AI Copilot Locked</h4>
                  <p className="text-xs text-[#4E453F] leading-relaxed">
                    Unlock your interactive Copilot by uploading and analyzing your resume.
                  </p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="px-5 py-2.5 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to Analyzer</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}

            {activeTab === "progress" && (
              result ? (
                <CareerIntelligence result={result} animate={true} />
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 my-12 premium-shadow">
                  <TrendingUp className="h-12 w-12 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#1C1008]">Career Intelligence Locked</h4>
                  <p className="text-xs text-[#4E453F] leading-relaxed">
                    Run your first analysis to calibrate expectations and roadmap parameters.
                  </p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="px-5 py-2.5 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to Analyzer</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}

            {activeTab === "billing" && <Pricing />}

            {activeTab === "history" && (
              <AnalysisHistory 
                onLoadAnalysis={handleLoadAnalysis} 
                setActiveTab={setActiveTab} 
              />
            )}

            {activeTab === "settings" && (
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 md:p-8 premium-shadow space-y-6 max-w-xl animate-pop-in">
                <div>
                  <h3 className="text-lg font-bold font-display text-[#1C1008]">Profile Settings</h3>
                  <p className="text-xs text-[#4E453F] font-semibold mt-0.5">Manage your personal profile details and accounts</p>
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user?.id) return;
                    console.log("Profile Settings submit triggered:", { profileName, profileAvatar });
                    setUpdatingProfile(true);
                    try {
                      await UserRepository.updateProfile(user.id, {
                        full_name: profileName,
                        avatar_url: profileAvatar,
                      });
                      await refreshProfile();
                      showToast("Profile details updated successfully! Reloading page...", "success");
                      // Delay reload slightly to let user read toast
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } catch (err: any) {
                      console.error("Profile Settings save caught error:", err);
                      showToast(err.message || "Failed to update profile", "error");
                    } finally {
                      setUpdatingProfile(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Aman Gupta"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs text-[#1C1008] focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Avatar Image URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://example.com/avatar.jpg"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs text-[#1C1008] focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-[#1C1008] hover:bg-stone-900 disabled:opacity-45 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {updatingProfile ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>

                <div className="border-t border-[#E5E0D8]/60 pt-4.5 space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Account Quota Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-3 rounded-2xl">
                      <span className="text-[8px] font-mono font-bold text-stone-400 uppercase block">Current Tier</span>
                      <span className="text-xs font-bold text-[#1C1008] mt-1 block">
                        {profile?.lifetime_access ? "Pro Active / Lifetime" : "Basic Trial"}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-3 rounded-2xl">
                      <span className="text-[8px] font-mono font-bold text-stone-400 uppercase block">Available Balance</span>
                      <span className="text-xs font-bold text-[#D97706] mt-1 block">
                        {profile?.lifetime_access ? "Infinite" : `${profile?.credits ?? 0} Credits`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <FloatingToolkit onAnalysisSuccess={handleAnalysisSuccess} setActiveTab={setActiveTab} />
        </Suspense>

      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-[#1C1008]/40 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#1C1008] text-white z-50 md:hidden flex flex-col justify-between p-6 animate-pop-in">
            <div className="space-y-8">
              {/* LOGO AREA */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#D97706] p-1.5 rounded-xl text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h1 className="font-display font-extrabold text-sm tracking-tight">ATS Killer SaaS</h1>
                    <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider">Enterprise OS</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* NAV LINKS */}
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
                  { id: "analyzer", label: "Resume Analyzer", icon: FileText },
                  { id: "applications", label: "Applications Workspace", icon: Briefcase },
                  { id: "copilot", label: "AI Career Copilot", icon: Bot },
                  { id: "progress", label: "Career Intelligence", icon: TrendingUp },
                  { id: "history", label: "Scan History", icon: History },
                  { id: "billing", label: "SaaS Pricing & Plans", icon: CreditCard },
                  { id: "settings", label: "Profile Settings", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? "bg-[#D97706] text-white shadow-md shadow-[#D97706]/10"
                          : "text-stone-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* LOGOUT FOOTER */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={async () => {
                  setMobileSidebarOpen(false);
                  await signOut();
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:bg-rose-950/20 hover:text-rose-400 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out Session</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-pop-in">
            <div className="flex justify-between items-center border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wide font-mono">Plan Details</h3>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="text-stone-400 hover:text-[#1C1008] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 py-2">
              <p className="text-xs text-[#4E453F]">
                Your Current Plan:{" "}
                <span className="font-extrabold text-[#1C1008] block text-sm mt-1">
                  {profile?.lifetime_access ? "✨ Lifetime Access" : `Free — ${profile?.credits ?? 50} credits left`}
                </span>
              </p>
              <p className="text-[11px] text-[#4E453F]/80 leading-relaxed">
                {profile?.lifetime_access 
                  ? "Thank you for being a lifetime member! You have infinite credits for scanning and intelligence features."
                  : "Upgrade to unlock unlimited resume scans, Recruiter View™ diagnostics, and unlimited AI assistant chats."}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] hover:bg-[#F5F0E8] text-[#1C1008] py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              {!profile?.lifetime_access && (
                <button
                  onClick={() => {
                    setActiveTab("billing");
                    setShowPlanModal(false);
                  }}
                  className="flex-1 bg-[#D97706] hover:bg-[#B45309] text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
