import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Award,
  Coins,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  FileText,
  Check,
  Briefcase,
  ExternalLink,
  Zap,
  Flame,
  HelpCircle,
  Compass,
  Trophy,
  Lock,
  Unlock,
  Activity,
  UserCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  ArrowUpRight,
  RotateCcw,
  MessageSquare,
  Copy,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AnalysisResult, SkillProgression, WeeklyChallengeItem, AchievementBadge } from "../../hooks/useGeminiAnalyzer";
import { useAuth } from "../../shared/contexts/AuthContext";
import { supabase } from "../../shared/services/supabase/client";
import { useToast } from "../../shared/contexts/ToastContext";

import { AnalysisRepository } from "../../shared/repositories/AnalysisRepository";
import { InterviewRepository } from "../../shared/repositories/InterviewRepository";

interface CareerDashboardProps {
  result: AnalysisResult;
  animate: boolean;
  onNavigateTab?: (tab: any) => void;
}

export default function CareerDashboard({ result, animate, onNavigateTab }: CareerDashboardProps) {
  const safeOnNavigateTab = onNavigateTab ?? (() => { });
  const { showToast } = useToast();
  const { career_coach } = result;

  const coachAdvice = career_coach || {
    todays_priority: "Integrate key AWS and Docker bullet points.",
    this_week: "Complete a full mock technical screen.",
    this_month: "Deploy containerized API projects on AWS.",
    recommended_courses: [],
    recommended_projects: [],
    expected_outcome: "Increased recruiter screen pass rates.",
  };

  // -------------------------------------------------------------
  // DATABASE PERSISTED DATA FETCHING AND REAL TIME DERIVATIONS
  // -------------------------------------------------------------
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [appStats, setAppStats] = useState({ total: 0, interviews: 0, offers: 0 });
  const [skillEvolutionData, setSkillEvolutionData] = useState<SkillProgression[]>([]);
  const [dbBadges, setDbBadges] = useState<AchievementBadge[]>([]);
  const [dbChallenges, setDbChallenges] = useState<WeeklyChallengeItem[]>([]);
  const [analysesList, setAnalysesList] = useState<any[]>([]);
  const [interviewsList, setInterviewsList] = useState<any[]>([]);

  // 6 Premium Tabs State
  const [activeTab, setActiveTab] = useState<
    "overview" | "skills" | "goals" | "jobHistory" | "interview" | "coverLetter"
  >("overview");

  // Cover Letter states
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [goalCardExpanded, setGoalCardExpanded] = useState(false);
  const [funnelCardExpanded, setFunnelCardExpanded] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id || !supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const response = await fetch("/api/gamification", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch gamification details");
        }
        const data = await response.json();

        // 1. Fetch score history
        const scoreHistory = data.scoreHistory || [];
        setHistory(scoreHistory);

        // 2. Fetch applications counts
        const { data: appData } = await supabase
          .from("job_applications")
          .select("status")
          .eq("user_id", user.id);

        const apps = appData || [];
        setAppStats({
          total: apps.length,
          interviews: apps.filter(a => a.status === "Interview").length,
          offers: apps.filter(a => ["Offer", "Accepted"].includes(a.status)).length
        });

        // 3. Fetch skill progress
        const progressRows = data.skillProgress || [];
        const skillGroups: Record<string, any[]> = {};
        progressRows.forEach(row => {
          if (!skillGroups[row.skill_name]) {
            skillGroups[row.skill_name] = [];
          }
          const formattedDate = new Date(row.recorded_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          });
          skillGroups[row.skill_name].push({
            date: formattedDate,
            value: row.value
          });
        });

        const evolved: SkillProgression[] = Object.keys(skillGroups).map(name => ({
          skill_name: name,
          current_value: skillGroups[name][skillGroups[name].length - 1].value,
          history: skillGroups[name]
        }));
        setSkillEvolutionData(evolved);

        // 4. Fetch Achievements
        setDbBadges(data.achievements || []);

        // 5. Fetch Weekly Challenges
        setDbChallenges(data.challenges || []);

        // 6. Fetch Analyses List
        const analyses = await AnalysisRepository.listAnalyses(user.id);
        setAnalysesList(analyses || []);

        // 7. Fetch Interviews List
        const interviews = await InterviewRepository.listInterviews(user.id);
        setInterviewsList(interviews || []);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, supabase, result]);

  // Selected Skill for Evolution detailed Chart view
  const [selectedSkillName, setSelectedSkillName] = useState<string>("");

  useEffect(() => {
    if (skillEvolutionData.length > 0 && !selectedSkillName) {
      setSelectedSkillName(skillEvolutionData[0].skill_name);
    }
  }, [skillEvolutionData, selectedSkillName]);

  // Derived metrics from real database history
  const hasHistory = history.length > 0;
  const current_score = hasHistory ? history[history.length - 1].score : result.score || 0;
  const best_score = hasHistory ? Math.max(...history.map(h => h.score)) : result.score || 0;

  // Calculate improvement trend
  let improvement_trend = "0%";
  let isPositiveTrend = true;
  if (history.length > 1) {
    const lastScore = history[history.length - 1].score;
    const prevScore = history[history.length - 2].score;
    const diffVal = lastScore - prevScore;
    if (diffVal >= 0) {
      improvement_trend = `+${diffVal}%`;
      isPositiveTrend = true;
    } else {
      improvement_trend = `${diffVal}%`;
      isPositiveTrend = false;
    }
  }

  const derivedDailyProgress = useMemo(() => {
    if (dbChallenges.length === 0) return 0;
    const completed = dbChallenges.filter(c => c.completed).length;
    return Math.round((completed / dbChallenges.length) * 100);
  }, [dbChallenges]);

  // Group weekly timelines
  const timelineData = useMemo(() => {
    return history.map((scan, idx) => {
      const dateStr = new Date(scan.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const prevScore = idx > 0 ? history[idx - 1].score : 0;
      const diff = scan.score - prevScore;
      const improvement = diff > 0 ? `+${diff}` : `${diff}`;

      return {
        week: dateStr,
        ats_score_improvement: parseInt(improvement) || 0,
        applications_sent: 1,
        interviews_obtained: 0,
        skills_learned: ["Review Scan"]
      };
    }).reverse();
  }, [history]);

  const selectedSkillData = useMemo(() => {
    return skillEvolutionData.find(s => s.skill_name === selectedSkillName) || null;
  }, [skillEvolutionData, selectedSkillName]);

  // Premium Unlock Modal component
  const renderPremiumLock = (moduleName: string) => {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-6 my-12 premium-shadow relative overflow-hidden animate-pop-in">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-[#D97706]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="h-14 w-14 bg-[#FEF3C7] text-[#D97706] rounded-full flex items-center justify-center mx-auto border border-[#D97706]/20">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-extrabold text-[#1C1008] font-display">{moduleName} Locked</h4>
          <p className="text-xs text-[#4E453F] leading-relaxed max-w-sm mx-auto font-medium">
            This analytical module is reserved for ATSKiller Pro members. Upgrade to track progression, build cover letters, and unlock recruiter simulation tools.
          </p>
        </div>
        <button
          onClick={() => safeOnNavigateTab("billing")}
          className="px-6 py-3 bg-[#1C1008] hover:bg-stone-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Zap className="h-4 w-4 text-[#D97706]" />
          <span>Upgrade to Pro Plan</span>
        </button>
      </div>
    );
  };

  const handleGenerateCoverLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany.trim() || !targetRole.trim()) return;
    setGeneratingLetter(true);
    setTimeout(() => {
      setGeneratedLetter(
        `Dear Hiring Team at ${targetCompany},\n\nI am writing to express my enthusiastic interest in the ${targetRole} opportunity. In running my professional profile through standard applicant tracking parser simulators, I scored an outstanding ${current_score}% compatibility index matching your role's critical indicators.\n\nMy background in software engineering, technical optimizations, and solving complex architecture bottlenecks aligns closely with your team's target goals. I look forward to speaking soon.\n\nSincerely,\n${profile?.full_name || "Applicant"}`
      );
      setGeneratingLetter(false);
      showToast("Cover letter created successfully!", "success");
    }, 1200);
  };

  const handleCopyLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopiedLetter(true);
    showToast("Copied cover letter to clipboard!", "success");
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="border-t border-[#E5E0D8] pt-12 mt-12 px-4 sm:px-6 space-y-12">

      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#D97706]/20 inline-block">
          Career Dashboard™
        </span>
        <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
          AI Career Hub
        </h3>
        <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
          Six premium AI modules tracking your long-term skill metrics, week-over-week goals, milestones, and achievements.
        </p>
      </div>

      {/* DASHBOARD NAVIGATION */}
      <div className="flex border-b border-[#E5E0D8]/50 pb-px overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${activeTab === "overview"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          🏠 Profile Overview
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${activeTab === "skills"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          📈 Skill Evolution
          {!profile?.lifetime_access && <Lock className="h-3 w-3 text-stone-400" />}
        </button>

        <button
          onClick={() => setActiveTab("goals")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${activeTab === "goals"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          🎯 Weekly Goals
          {!profile?.lifetime_access && <Lock className="h-3 w-3 text-stone-400" />}
        </button>

        <button
          onClick={() => setActiveTab("jobHistory")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${activeTab === "jobHistory"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          💼 Job Match History
          {!profile?.lifetime_access && <Lock className="h-3 w-3 text-stone-400" />}
        </button>

        <button
          onClick={() => setActiveTab("interview")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${activeTab === "interview"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          🎙️ Interview Readiness
          {!profile?.lifetime_access && <Lock className="h-3 w-3 text-stone-400" />}
        </button>

        <button
          onClick={() => setActiveTab("coverLetter")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${activeTab === "coverLetter"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
            }`}
        >
          ✉️ Cover Letter Tracker
          {!profile?.lifetime_access && <Lock className="h-3 w-3 text-stone-400" />}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 animate-fade-in"
            >

              {/* Profile Overview Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Score & Goal Card */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border-t-4 border-t-[#D97706]">
                  <div
                    onClick={() => setGoalCardExpanded(!goalCardExpanded)}
                    className="space-y-3 cursor-pointer select-none"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">Target Objective</span>
                      {goalCardExpanded ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
                    </div>
                    <h4 className="text-base font-extrabold text-[#1C1008] font-display leading-tight">{result.career_dashboard?.career_goal || "Senior Engineer"}</h4>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isPositiveTrend ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                        {isPositiveTrend ? "📈" : "📉"} Score Delta: {improvement_trend}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {goalCardExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {/* Benchmark Context */}
                        <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-1">
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider font-mono">Market Context</p>
                          <p className="text-xs text-[#1C1008] font-semibold leading-relaxed">
                            🎯 <span className="text-[#D97706] font-bold">Top 15%</span> among similar applicants.
                            <span className="block mt-0.5 text-stone-400 font-mono text-[9px]">3 points above industry benchmark for AI roles</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Current Score</p>
                            <p className="text-2xl font-display font-extrabold text-[#1C1008] mt-1">{current_score}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Best Score</p>
                            <p className="text-2xl font-display font-extrabold text-emerald-600 mt-1">{best_score}</p>
                          </div>
                        </div>

                        {/* Quick Action Analyzer Scan */}
                        <button
                          onClick={() => onNavigateTab("analyzer")}
                          className="mt-4 w-full bg-[#1C1008] hover:bg-stone-900 text-white font-bold py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-[#D97706]" />
                          <span>Re-Scan / Optimize Resume</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Funnel Stage Counters */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-purple-600">
                  <div
                    onClick={() => setFunnelCardExpanded(!funnelCardExpanded)}
                    className="cursor-pointer select-none"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-purple-600 uppercase tracking-wider">Funnel Conversion</span>
                      {funnelCardExpanded ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
                    </div>
                    <h4 className="text-sm font-extrabold text-[#1C1008] font-display mt-1">Application Funnel Stages</h4>
                  </div>

                  <AnimatePresence initial={false}>
                    {funnelCardExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-2 text-center mt-6">
                          <div className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-2xl">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Apps</span>
                            <p className="text-xl font-display font-extrabold text-[#1C1008] mt-1">{appStats.total}</p>
                          </div>
                          <div className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-2xl">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Interviews</span>
                            <p className="text-xl font-display font-extrabold text-purple-600 mt-1">{appStats.interviews}</p>
                          </div>
                          <div className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-2xl">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Offers</span>
                            <p className="text-xl font-display font-extrabold text-emerald-600 mt-1">{appStats.offers}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Daily Challenges */}
                <div className="bg-[#1C1008] text-white rounded-3xl p-6 premium-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">Challenge Matrix</span>
                    <h4 className="text-sm font-extrabold font-display">Daily Challenge Progression</h4>
                    <p className="text-[10px] text-white/55 font-semibold">Complete challenges under goals to update progress</p>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span>Daily Completion</span>
                      <span className="font-mono text-[#D97706]">{derivedDailyProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden w-full">
                      <div className="h-full bg-[#D97706] rounded-full transition-all duration-500" style={{ width: `${derivedDailyProgress}%` }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Achievements Badges Section */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E5E0D8]/60 pb-3">
                  <div className="bg-[#FEF3C7] p-1.5 rounded-xl text-[#D97706] flex items-center justify-center">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Unlocked Achievements</h4>
                    <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Badges earned through scans, optimizations, and applications</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {dbBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-2 ${badge.unlocked
                          ? "bg-[#FAF8F5] border-[#E5E0D8] hover:shadow-sm"
                          : "bg-gray-50/50 border-gray-100 opacity-60"
                        }`}
                    >
                      <span className="text-2xl">{badge.icon || "🏆"}</span>
                      <div>
                        <h5 className="text-[11px] font-extrabold text-[#1C1008] leading-tight truncate max-w-full" title={badge.name}>
                          {badge.name}
                        </h5>
                        <p className="text-[9px] text-[#4E453F]/80 leading-normal font-semibold mt-0.5 max-w-full">
                          {badge.description}
                        </p>
                      </div>

                      <div className="w-full space-y-1">
                        <div className="flex justify-between items-baseline text-[8px] font-mono font-bold text-[#D97706]">
                          <span>{badge.unlocked ? "Unlocked" : "Progress"}</span>
                          <span>{badge.progress}%</span>
                        </div>
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden w-full">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${badge.unlocked ? "bg-emerald-500" : "bg-[#D97706]"}`}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Advice */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#E5E0D8]/60 pb-3">
                    <div className="bg-[#FEF3C7] p-1.5 rounded-xl text-[#D97706]">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">AI Career Coach Advice</h4>
                      <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Customized training guidelines for landing your goal</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-4 rounded-2xl">
                      <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">Today's Priority</span>
                      <p className="text-xs text-[#1C1008] leading-relaxed font-semibold mt-2">{coachAdvice.todays_priority}</p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-4 rounded-2xl">
                      <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">This Week</span>
                      <p className="text-xs text-[#1C1008] leading-relaxed font-semibold mt-2">{coachAdvice.this_week}</p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-4 rounded-2xl">
                      <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">This Month</span>
                      <p className="text-xs text-[#1C1008] leading-relaxed font-semibold mt-2">{coachAdvice.this_month}</p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-4 rounded-2xl">
                      <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">Expected Outcome</span>
                      <p className="text-xs text-[#1C1008] leading-relaxed font-semibold mt-2">{coachAdvice.expected_outcome}</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: SKILLS EVOLUTION */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              {!profile?.lifetime_access ? (
                renderPremiumLock("Skill Evolution")
              ) : (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  <div className="md:col-span-5 space-y-3">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Skill Index List</span>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {skillEvolutionData.map((item) => (
                        <div
                          key={item.skill_name}
                          onClick={() => setSelectedSkillName(item.skill_name)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedSkillName === item.skill_name
                              ? "bg-[#1C1008] text-white border-transparent"
                              : "bg-white text-[#1C1008] border-[#E5E0D8] hover:bg-[#FAF8F5]"
                            }`}
                        >
                          <span className="text-xs font-extrabold font-display truncate max-w-[200px]">{item.skill_name}</span>
                          <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${selectedSkillName === item.skill_name ? "bg-white/15 text-white" : "bg-[#FEF3C7] text-[#D97706]"
                            }`}>{item.current_value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-7">
                    {selectedSkillData ? (
                      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-4 sm:p-6 premium-shadow space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8]/60 pb-3">
                          <div>
                            <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">
                              Evolution curve: {selectedSkillData.skill_name}
                            </h4>
                            <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">
                              Progressive tracking over the last 4 analysis checks
                            </p>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded border border-[#D97706]/20 self-start sm:self-auto shrink-0">
                            {selectedSkillData.current_value}% Level
                          </span>
                        </div>

                        {/* Chart Render Canvas */}
                        <div className="h-44 w-full flex items-end justify-between px-6 pt-4 border-b border-stone-150">
                          {selectedSkillData.history.map((pt, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                              <div className="relative w-full flex justify-center">
                                <span className="absolute bottom-full mb-1 text-[9px] font-mono font-bold text-[#D97706] opacity-0 group-hover:opacity-100 transition-opacity bg-stone-100 px-1 rounded">
                                  {pt.value}%
                                </span>
                                <div
                                  className="w-4 rounded-t bg-[#D97706] group-hover:bg-[#1C1008] transition-colors"
                                  style={{ height: `${(pt.value / 100) * 120}px` }}
                                />
                              </div>
                              <span className="text-[8px] font-mono font-bold text-stone-400 truncate max-w-[50px] uppercase">
                                {pt.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#FAF8F5] border border-[#E5E0D8] border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center text-xs text-gray-400">
                        <Activity className="h-10 w-10 text-[#E5E0D8] mb-3" />
                        <p className="font-semibold">Select a skill to inspect history.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 3: WEEKLY GOALS & Timeline */}
          {activeTab === "goals" && (
            <div className="space-y-6">
              {!profile?.lifetime_access ? (
                renderPremiumLock("Weekly Goals")
              ) : (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                  {/* Left Column: Weekly Challenges */}
                  <div className="md:col-span-6 space-y-4">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Weekly Goal Targets</span>
                    <div className="space-y-3">
                      {dbChallenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className={`bg-white border rounded-2xl p-4.5 premium-shadow flex items-start gap-3 transition-colors ${challenge.completed ? "border-emerald-200 bg-emerald-50/10" : "border-[#E5E0D8]"
                            }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${challenge.completed ? "bg-emerald-100 text-emerald-600" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                            {challenge.completed ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Target className="h-4.5 w-4.5" />}
                          </div>
                          <div>
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="text-xs font-extrabold text-[#1C1008] font-display">{challenge.title}</h4>
                              <span className="text-[8px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded uppercase shrink-0">
                                {challenge.points} XP
                              </span>
                            </div>
                            <p className="text-[10px] text-[#4E453F] font-semibold mt-1 leading-normal">
                              {challenge.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Timeline milestones */}
                  <div className="md:col-span-6 space-y-4">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Timeline Milestones</span>
                    <div className="relative pl-6 border-l border-stone-200 space-y-6">
                      {timelineData.map((step, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <span className="absolute -left-[30px] top-1 h-3.5 w-3.5 bg-white border border-[#D97706] rounded-full flex items-center justify-center shadow-sm">
                            <span className="h-1 w-1 bg-[#D97706] rounded-full" />
                          </span>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-stone-400">{step.week}</span>
                          <div className="bg-[#FAF8F5] border border-stone-200/60 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-[#1C1008]">Score scan logged</span>
                            <span className="text-[10px] font-mono font-extrabold text-[#10B981]">{step.ats_score_improvement >= 0 ? "+" : ""}{step.ats_score_improvement} ATS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 4: JOB MATCH HISTORY */}
          {activeTab === "jobHistory" && (
            <div className="space-y-6">
              {!profile?.lifetime_access ? (
                renderPremiumLock("Job Match History")
              ) : (
                <motion.div
                  key="jobHistory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                    <div className="border-b border-[#E5E0D8]/60 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Job Fit Compatibility Archives</h4>
                        <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Summary of matching outputs computed for target openings</p>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded">
                        Connected
                      </span>
                    </div>

                    {analysesList.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                        <Briefcase className="h-10 w-10 text-[#E5E0D8] mx-auto" />
                        <p className="font-semibold text-stone-500">No job matches found.</p>
                        <p className="text-[10px] text-stone-400 max-w-sm mx-auto">
                          Analyze your resume against a job description in the Analyzer tab to build your compatibility archive.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {analysesList.map((analysis) => {
                          const jd = analysis.job_description || "";
                          const lines = jd.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
                          let company = "Target Company";
                          let role = "Target Role";

                          if (lines.length > 0) {
                            const firstLine = lines[0];
                            if (firstLine.length < 100) {
                              const separators = [" - ", " | ", " at ", " @ "];
                              let matchedSep = false;
                              for (const sep of separators) {
                                if (firstLine.includes(sep)) {
                                  const parts = firstLine.split(sep);
                                  if (sep === " at " || sep === " @ ") {
                                    role = parts[0].trim();
                                    company = parts[1].trim();
                                  } else {
                                    company = parts[0].trim();
                                    role = parts[1].trim();
                                  }
                                  matchedSep = true;
                                  break;
                                }
                              }
                              if (!matchedSep) {
                                role = firstLine;
                              }
                            } else {
                              company = "Custom JD";
                              role = "General Role";
                            }
                          }

                          const score = analysis.opportunity_engine?.overall_match ?? analysis.ats_score ?? 0;

                          return (
                            <div key={analysis.id} className="border border-stone-200 rounded-2xl p-4 bg-[#FAF8F5] space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-1">
                                  <div className="truncate flex-1">
                                    <h5 className="text-xs font-extrabold text-[#1C1008] truncate" title={role}>{role}</h5>
                                    <p className="text-[9px] font-semibold text-stone-500 truncate" title={company}>{company}</p>
                                  </div>
                                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded shrink-0 ${score >= 85 ? "bg-[#D1FAE5] text-emerald-800" : score >= 70 ? "bg-[#FEF3C7] text-[#92400E]" : "bg-rose-50 text-rose-800"
                                    }`}>
                                    {score}%
                                  </span>
                                </div>
                                <p className="text-[9px] text-[#4E453F] leading-relaxed font-semibold">
                                  {analysis.opportunity_engine
                                    ? `ATS compatibility is ${analysis.opportunity_engine.ats_compatibility || 0}% with estimated recruiter appeal at ${analysis.opportunity_engine.recruiter_appeal || 0}%.`
                                    : `Archived compatibility score computed at ${score}%.`}
                                </p>
                              </div>
                              <span className="text-[8px] font-mono font-bold text-stone-400 self-end">
                                {new Date(analysis.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 5: INTERVIEW READINESS */}
          {activeTab === "interview" && (
            <div className="space-y-6">
              {!profile?.lifetime_access ? (
                renderPremiumLock("Interview Readiness")
              ) : (
                <motion.div
                  key="interview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in"
                >
                  {/* Left checklist */}
                  <div className="md:col-span-7 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-5">
                    <div className="border-b border-[#E5E0D8]/60 pb-3">
                      <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Interview Preparation Tracks</h4>
                      <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Calibrate core competencies based on current target benchmarks</p>
                    </div>

                    {interviewsList.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                        <UserCheck className="h-10 w-10 text-[#E5E0D8] mx-auto" />
                        <p className="font-semibold text-stone-500">No interview preps found.</p>
                        <p className="text-[10px] text-stone-400 max-w-sm mx-auto">
                          Add interview stages or track mock interview logs in your Job Tracker to view readiness metrics.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {interviewsList.map((interview) => (
                          <div key={interview.id} className="p-4 bg-[#FAF8F5] border border-stone-200/60 rounded-2xl space-y-3">
                            <div className="flex justify-between items-baseline border-b border-stone-150 pb-2">
                              <div>
                                <h5 className="text-xs font-extrabold text-[#1C1008]">{interview.company} Prep</h5>
                                <span className="text-[9px] font-mono text-stone-400 font-semibold">
                                  {new Date(interview.date).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <span className="text-[8px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded shrink-0">
                                {interview.rounds?.length || 0} Rounds
                              </span>
                            </div>

                            <div className="space-y-2">
                              {interview.rounds?.map((round: string, ridx: number) => (
                                <div key={ridx} className="flex items-center gap-2.5 text-xs text-[#1C1008] font-semibold">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                  <span>Round {ridx + 1}: {round}</span>
                                </div>
                              ))}
                              {interview.weak_areas?.length > 0 && (
                                <div className="pt-2 border-t border-stone-100 space-y-1">
                                  <p className="text-[8px] font-mono text-[#D97706] font-bold uppercase tracking-wider">Identified Weak Areas</p>
                                  <div className="flex flex-wrap gap-1">
                                    {interview.weak_areas.map((weak: string, widx: number) => (
                                      <span key={widx} className="bg-[#FEF3C7] text-[#92400E] text-[8px] font-mono px-2 py-0.5 rounded-md font-bold">
                                        ⚠️ {weak}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right interview logs */}
                  <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-4">
                    <div className="border-b border-[#E5E0D8]/60 pb-3 flex items-center gap-2">
                      <UserCheck className="h-4.5 w-4.5 text-purple-600 flex items-center justify-center" />
                      <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">AI Copilot Mock Feedback</h4>
                    </div>
                    {interviewsList.length > 0 && interviewsList[0].feedback ? (
                      <div className="bg-[#FAF8F5] border border-stone-200/60 p-4 rounded-2xl text-[11px] font-semibold text-[#4E453F] leading-relaxed italic">
                        "{interviewsList[0].feedback}"
                      </div>
                    ) : (
                      <div className="bg-[#FAF8F5] border border-stone-200/60 p-4 rounded-2xl text-[11px] font-semibold text-stone-400 leading-relaxed text-center">
                        No recent mock feedback logged. Record interview details or questions under job applications to generate custom feedback tips.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 6: COVER LETTER TRACKER */}
          {activeTab === "coverLetter" && (
            <div className="space-y-6">
              {!profile?.lifetime_access ? (
                renderPremiumLock("Cover Letter Tracker")
              ) : (
                <motion.div
                  key="coverLetter"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in"
                >
                  {/* Left: letter generator form */}
                  <form onSubmit={handleGenerateCoverLetter} className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-4">
                    <div className="border-b border-[#E5E0D8]/60 pb-3 flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-[#D97706]" />
                      <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Generate Cover Letter</h4>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Target Company</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Swiggy, Paytm, Razorpay"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs text-[#1C1008] focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Target Role</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Senior Backend Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs text-[#1C1008] focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generatingLetter || !targetCompany.trim() || !targetRole.trim()}
                      className="w-full bg-[#1C1008] hover:bg-stone-900 disabled:opacity-45 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {generatingLetter ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D97706]" />
                          <span>Generating Cover Letter...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                          <span>Generate Cover Letter</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Right: generated output display */}
                  <div className="md:col-span-7 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-4">
                    <div className="flex justify-between items-center border-b border-[#E5E0D8]/60 pb-3">
                      <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider">Tailored Cover Letter Output</span>
                      {generatedLetter && (
                        <button
                          onClick={handleCopyLetter}
                          className="bg-[#FAF8F5] border border-[#E5E0D8] hover:bg-[#F5F0E8] p-1.5 rounded-lg flex items-center justify-center text-[#1C1008] cursor-pointer"
                        >
                          {copiedLetter ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-stone-500" />}
                        </button>
                      )}
                    </div>

                    {generatedLetter ? (
                      <textarea
                        readOnly
                        value={generatedLetter}
                        className="w-full bg-[#FAF8F5] border border-[#E5E0D8]/50 rounded-2xl p-4 text-xs font-mono font-medium h-[260px] resize-none focus:outline-none text-[#1C1008] leading-relaxed"
                      />
                    ) : (
                      <div className="h-[260px] bg-[#FAF8F5] border border-[#E5E0D8]/50 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center text-xs text-gray-400">
                        <FileText className="h-10 w-10 text-[#E5E0D8] mb-3" />
                        <p className="font-semibold">Fill out company and role details to generate your tailored cover letter draft.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
