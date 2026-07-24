import React, { useState, useRef, useEffect } from "react";
import {

  FileText,
  Briefcase,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Key,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
  Eye,
  Clock,
  Activity,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGeminiAnalyzer,
  AnalysisResult,
  QuickWin,
} from "../../hooks/useGeminiAnalyzer";
import { supabase } from "../../shared/services/supabase/client";
import { LoadingSequence, DiagnosticModal } from "../../components";
import { lazy } from "react";

const CareerIntelligence = lazy(() => import("../career/CareerIntelligence"));
const JobSearchWorkspace = lazy(() => import("../jobs/JobSearchWorkspace"));
const CareerDashboard = lazy(() => import("../dashboard/CareerDashboard"));
const AICareerCopilot = lazy(() => import("../copilot/AICareerCopilot"));
const AIOpportunityEngine = lazy(() => import("./AIOpportunityEngine"));


// Custom useCountUp hook inside the file
function useCountUp(target: number, duration: number = 1600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const end = target;
    const totalSteps = 50;
    const stepTime = Math.floor(duration / totalSteps);
    const increment = end / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      start += increment;
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

interface AnalyzerProps {
  onAuthRequired?: () => void;
}

export default function Analyzer({ onAuthRequired }: AnalyzerProps) {
  const { loading, result, error, analyze, reset, rewriteBullet } = useGeminiAnalyzer();

  // State
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedWins, setCopiedWins] = useState(false);
  const [copiedRewrite, setCopiedRewrite] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [dashOffset, setDashOffset] = useState(326.7);

  // ATS Simulator selected system
  const [selectedAts, setSelectedAts] = useState<string | null>(null);

  // Rewriting state for individual quick wins
  const [rewrites, setRewrites] = useState<{
    [key: number]: {
      loading: boolean;
      text: string | null;
      error: string | null;
      copied: boolean;
    };
  }>({});

  // Fix-state for CARD 2 (rejection reasons)
  const [fixes, setFixes] = useState<{
    [idx: number]: {
      loading: boolean;
      text: string | null;
      error: string | null;
      copied: boolean;
    };
  }>({});

  // Diagnostic Modal State
  const [activeDiagnosticDetail, setActiveDiagnosticDetail] = useState<{
    title: string;
    description: string;
    details: string[];
    actionItems: string[];
  } | null>(null);

  // References for scrolling
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);

  // Animate progress bars and circular score ring when result becomes available
  useEffect(() => {
    if (result) {
      setAnimateBars(false);
      setDashOffset(326.7);

      const t = setTimeout(() => {
        setAnimateBars(true);
        const circumference = 2 * Math.PI * 52;
        setDashOffset((1 - result.score / 100) * circumference);
      }, 100);

      return () => clearTimeout(t);
    } else {
      setAnimateBars(false);
      setDashOffset(326.7);
    }
  }, [result]);

  // Scroll to results when they load
  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Analyze trigger
  const handleAnalyze = async () => {
    try {
      setRewrites({});
      setSelectedAts(null);
      await analyze(resume, jd);
    } catch (err) {
      // Error handled by hook and exposed through state
    }
  };

  // Reset trigger
  const handleReset = () => {
    reset();
    setShowRewrite(false);
    setSelectedAts(null);
    setRewrites({});
    setTimeout(() => {
      inputsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Copy handlers
  const handleCopyRewrite = () => {
    if (!result?.rewrite_suggestion) return;
    navigator.clipboard.writeText(result.rewrite_suggestion);
    setCopiedRewrite(true);
    setTimeout(() => {
      setCopiedRewrite(false);
    }, 2000);
  };

  const handleCopyQuickWins = () => {
    if (!result?.quick_wins) return;
    const winsText = result.quick_wins
      .map((w, idx) => `${idx + 1}. ${w.title} (${w.impact_increase} Score, Time: ${w.time_required})\n${w.description}`)
      .join("\n\n");
    navigator.clipboard.writeText(winsText);
    setCopiedWins(true);
    setTimeout(() => {
      setCopiedWins(false);
    }, 2000);
  };

  const handleCopyFix = (idx: number, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setFixes((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], copied: true },
    }));
    setTimeout(() => {
      setFixes((prev) => ({
        ...prev,
        [idx]: { ...prev[idx], copied: false },
      }));
    }, 2000);
  };

  const handleFixIssue = async (idx: number, issueTitle: string, issueDescription: string) => {
    const resumeSection = resume;
    const jdContext = jd;

    const issueText = `${issueTitle}: ${issueDescription}`;

    if (!resumeSection?.trim() || !jdContext?.trim()) return;

    setFixes((prev) => ({
      ...prev,
      [idx]: { loading: true, text: null, error: null, copied: false },
    }));

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(`/api/fix-suggestion`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          issueText,
          resumeSection,
          jdContext,
        }),
      });

      if (!response.ok) {
        let errMsg = `Fix failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) errMsg = data.error;
        } catch {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      const data = (await response.json()) as { suggestion?: string; error?: string };
      const suggestion = (data?.suggestion || "").trim();

      if (!suggestion) {
        throw new Error("AI returned an empty rewrite.");
      }

      setFixes((prev) => ({
        ...prev,
        [idx]: { loading: false, text: suggestion, error: null, copied: false },
      }));
    } catch (err: any) {
      setFixes((prev) => ({
        ...prev,
        [idx]: {
          loading: false,
          text: null,
          error: err?.message || "Failed to generate fix suggestion.",
          copied: false,
        },
      }));
    }
  };

  // Inline bullet rewrite trigger
  const handleRewriteBullet = async (idx: number, originalContext: string, description: string) => {
    if (!originalContext) return;
    setRewrites((prev) => ({
      ...prev,
      [idx]: { loading: true, text: null, error: null, copied: false },
    }));

    try {
      const text = await rewriteBullet(originalContext, description);
      setRewrites((prev) => ({
        ...prev,
        [idx]: { loading: false, text, error: null, copied: false },
      }));
    } catch (err: any) {
      setRewrites((prev) => ({
        ...prev,
        [idx]: { loading: false, text: null, error: err.message || "Failed to rewrite bullet.", copied: false },
      }));
    }
  };

  const handleCopyInlineRewrite = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setRewrites((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], copied: true },
    }));
    setTimeout(() => {
      setRewrites((prev) => ({
        ...prev,
        [idx]: { ...prev[idx], copied: false },
      }));
    }, 2000);
  };

  // Word counts
  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Determine score grade
  const getScoreGrade = (score: number) => {
    if (score >= 80) {
      return {
        label: "Strong match",
        colorClass: "text-[#10B981]",
        bgClass: "bg-[#D1FAE5] text-[#065F46]",
        strokeColor: "#10B981",
      };
    } else if (score >= 60) {
      return {
        label: "Needs work",
        colorClass: "text-[#D97706]",
        bgClass: "bg-[#FEF3C7] text-[#92400E]",
        strokeColor: "#D97706",
      };
    } else {
      return {
        label: "At risk",
        colorClass: "text-[#EF4444]",
        bgClass: "bg-[#FEE2E2] text-[#991B1B]",
        strokeColor: "#EF4444",
      };
    }
  };

  // Color mapping for Heatmap section grades
  const getHeatmapColor = (grade: "Excellent" | "Good" | "Average" | "Weak") => {
    switch (grade) {
      case "Excellent":
        return "bg-[#10B981]";
      case "Good":
        return "bg-[#10B981]/80";
      case "Average":
        return "bg-[#D97706]";
      case "Weak":
        return "bg-[#EF4444]";
      default:
        return "bg-[#4E453F]";
    }
  };

  const currentScore = result ? result.score : 0;
  const grade = getScoreGrade(currentScore);
  const animatedScoreValue = useCountUp(currentScore, 1600);
  const highRisksCount = result
    ? result.rejection_reasons.filter((r) => r.severity === "HIGH").length
    : 0;

  const isReadyToAnalyze = resume.trim().length >= 50 && jd.trim().length >= 50;

  // Sorted quick wins by impact increase descending
  const sortedQuickWins = result
    ? [...result.quick_wins].sort((a, b) => b.impact_increase - a.impact_increase)
    : [];

  return (
    <section id="analyzer" className="bg-[#FAF8F5] py-20 relative overflow-hidden font-sans">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-[#1C1008]/5 blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#D97706]/5 blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#D97706]/20 inline-block">
            The Tool — Phase 1
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Paste. Analyze. Win.
          </h2>
          <p className="text-sm sm:text-base text-[#4E453F] max-w-xl mx-auto font-sans font-medium leading-relaxed">
            Two inputs. 15 seconds. Know exactly why you're being rejected and what the company actually wants.
          </p>
        </div>



        {/* Input Grid (Hidden when result exists) */}
        {!result && (
          <div ref={inputsRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {/* Left Card: Your Resume */}
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow hover:-translate-y-[3px] transition-transform duration-200 ease-out flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F5F0E8] p-2.5 rounded-xl text-[#D97706] h-10 w-10 shrink-0 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1C1008]">Your Resume</h3>
                      <p className="text-[11px] text-[#4E453F]/70 font-semibold">Plain text works best</p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4E453F]/60 font-semibold bg-[#F5F0E8] px-2.5 py-1 rounded-lg">
                    {getWordCount(resume)} words
                  </span>
                </div>

                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder={`Paste your resume here — plain text works best.

IncludeThank you for choosing <strong>ATS Killer</strong>. Since our Service utilizes real-time API integrations and cloud resources (AI analysis API) to perform analysis...`}
                  className="bg-[#F5F0E8] h-64 rounded-2xl p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 text-[#1C1008] w-full font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Right Card: Job Description */}
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow hover:-translate-y-[3px] transition-transform duration-200 ease-out flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F5F0E8] p-2.5 rounded-xl text-[#D97706] h-10 w-10 shrink-0 flex items-center justify-center">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1C1008]">Job Description</h3>
                      <p className="text-[11px] text-[#4E453F]/70 font-semibold">Paste full JD for best results</p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4E453F]/60 font-semibold bg-[#F5F0E8] px-2.5 py-1 rounded-lg">
                    {getWordCount(jd)} words
                  </span>
                </div>

                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder={`Paste the complete job description here.

Include all requirements, responsibilities, and preferred 
qualifications. Don't trim it — every word matters.`}
                  className="bg-[#F5F0E8] h-64 rounded-2xl p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 text-[#1C1008] w-full font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button (Hidden when result exists) */}
        {!result && (
          <div className="flex flex-col items-center mt-8 space-y-3">
            {loading ? (
              <div className="w-full max-w-[480px] py-4">
                <LoadingSequence steps={["Scanning keywords...", "Checking formatting...", "Matching skills...", "Finalizing report..."]} />
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!isReadyToAnalyze}
                className="w-full max-w-[480px] bg-[#1C1008] text-white py-5 rounded-2xl text-lg font-bold hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 premium-shadow"
              >
                <Sparkles className="h-5 w-5 text-[#D97706]" />
                <span>Analyze My Resume →</span>
              </button>
            )}

            <p className="text-xs text-[#4E453F]/70 font-semibold">
              {!isReadyToAnalyze
                ? "Paste your resume and job description above"
                : "Ready — AI analysis model will process in ~10 seconds"}
            </p>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl p-4 flex items-start gap-3 w-full max-w-[640px] mx-auto mt-6 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#EF4444] mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-bold text-[#1C1008]">Analysis failed</p>
              <p className="text-xs text-[#4E453F] leading-relaxed">{error}</p>
              <button
                onClick={handleAnalyze}
                className="text-xs font-bold text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry Analysis
              </button>
            </div>
          </div>
        )}

        {/* RESULTS PANEL */}
        {result && (
          <div ref={resultsRef} className="max-w-4xl mx-auto space-y-8 mt-10 animate-fade-in-up">

            {/* CARD 1: ATS SCORE */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "ATS Compatibility Score Calibration",
                description: `Your overall ATS compatibility score is calibrated at ${result.score}/100.`,
                details: [
                  `Keyword Match percentage: ${result.keyword_match_percent}%`,
                  `Formatting verification score: ${result.format_score}%`,
                  `Readability grade: ${result.readability}`
                ],
                actionItems: [
                  "Address the missing keywords in experience sections.",
                  "Resolve structural warnings listed in why you are being ghosted.",
                  "Re-verify margins and font sizes before final submittal."
                ]
              })}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#D97706] hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[3px] transition-all duration-200 ease-out cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-[#1C1008] tracking-tight group-hover:text-[#D97706] transition-colors">
                  ATS Compatibility Score
                </h3>
                <span className="text-[10px] font-mono text-[#D97706] font-bold group-hover:underline">Click to view diagnostics →</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* SVG Radial Score Ring */}
                <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4">
                  <div className="relative h-[120px] w-[120px]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      {/* Track circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        className="stroke-[#F5F0E8] fill-none"
                        strokeWidth="10"
                      />
                      {/* Animated Fill circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        className="fill-none transition-all duration-[1800ms] ease-out"
                        stroke={grade.strokeColor}
                        strokeWidth="10"
                        strokeDasharray="326.7"
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Score Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-display font-extrabold text-[#1C1008]">
                        {animatedScoreValue}
                      </span>
                      <span className="text-[10px] font-mono text-[#4E453F]/60 block font-bold mt-0.5">/100</span>
                    </div>
                  </div>

                  {/* Score Level Pill */}
                  <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${grade.bgClass}`}>
                    {grade.label}
                  </span>
                </div>

                {/* Bars & Metrics */}
                <div className="md:col-span-8 space-y-6">
                  {/* Progress Bar 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#1C1008]">
                      <span>Keyword Match</span>
                      <span className="font-mono">{result.keyword_match_percent}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full">
                      <div
                        className="h-full bg-[#D97706] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: animateBars ? `${result.keyword_match_percent}%` : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Progress Bar 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#1C1008]">
                      <span>Format Score</span>
                      <span className="font-mono">{result.format_score}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: animateBars ? `${result.format_score}%` : "0%" }}
                      />
                    </div>
                  </div>

                  {/* 2x2 Metric Pills Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#D1FAE5] text-[#065F46] px-3.5 py-3 rounded-2xl flex flex-col justify-center">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">Found Keywords</span>
                      <span className="text-sm font-bold mt-0.5">{result.keywords_found.length} Matches</span>
                    </div>
                    <div className="bg-[#FEE2E2] text-[#991B1B] px-3.5 py-3 rounded-2xl flex flex-col justify-center">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">Missing Keywords</span>
                      <span className="text-sm font-bold mt-0.5">{result.keywords_missing.length} Gaps</span>
                    </div>
                    <div className="bg-[#D1FAE5] text-[#065F46] px-3.5 py-3 rounded-2xl flex flex-col justify-center">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">Readability</span>
                      <span className="text-sm font-bold mt-0.5">{result.readability}</span>
                    </div>
                    <div className={`px-3.5 py-3 rounded-2xl flex flex-col justify-center ${highRisksCount > 0 ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#D1FAE5] text-[#065F46]"}`}>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">High Risks</span>
                      <span className="text-sm font-bold mt-0.5">{highRisksCount} Warning{highRisksCount !== 1 && "s"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: REJECTION REASONS */}
            <div 
              onClick={(e) => {
                // Prevent opening modal when clicking fix or copy buttons inside the card
                const target = e.target as HTMLElement;
                if (target.closest("button")) return;
                setActiveDiagnosticDetail({
                  title: "Ghosting / Rejection Risks Diagnostics",
                  description: "ATS scoring engines detect layout, syntax, keyword density, and formatting anomalies that result in automated rejection filters.",
                  details: result.rejection_reasons.map(r => `[${r.severity} Risk] ${r.title}: ${r.description}`),
                  actionItems: [
                    "Perform layout formatting validation checks.",
                    "Use the AI bullet optimizer to rewrite problem sections.",
                    "Remove tables, images, or special icons inside resume header."
                  ]
                });
              }}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#EF4444] hover:border-red-400/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[3px] transition-all duration-200 ease-out relative cursor-pointer group"
            >
              <span className="absolute top-7 right-7 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Unique Feature
              </span>

              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1C1008] tracking-tight group-hover:text-[#EF4444] transition-colors">
                    Why You're Being Ghosted
                  </h3>
                  <p className="text-xs text-[#4E453F] mt-1 font-medium">
                    These signals cause automatic rejection before a human sees your application.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#EF4444] font-bold group-hover:underline self-center shrink-0">Click to view diagnostics →</span>
              </div>

              <div className="space-y-4">
                {result.rejection_reasons.map((reason, idx) => {
                  const fixState = fixes[idx];
                  const isFixing = !!fixState?.loading;
                  const hasFixText = !!fixState?.text;
                  const fixError = fixState?.error;

                  return (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up"
                    >
                      <div className="flex items-start gap-3 w-full sm:w-auto">
                        {reason.severity === "HIGH" ? (
                          <XCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                        )}

                        <div className="w-full">
                          <p className="text-sm font-bold text-[#1C1008]">{reason.title}</p>
                          <p className="text-xs text-[#4E453F] mt-1 leading-relaxed">{reason.description}</p>

                          {/* Button below title/description */}
                          {isFixing ? (
                            <div className="mt-3 py-1">
                              <LoadingSequence steps={["Analyzing rejection issue...", "Formulating correction...", "Re-writing bullet...", "Applying fix..."]} />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleFixIssue(idx, reason.title, reason.description)}
                              className="mt-3 bg-[#D97706] text-[#1C1008] hover:bg-[#D97706]/90 active:scale-[0.98] transition-all font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer duration-150 w-full sm:w-auto"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Fix This</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start w-full sm:w-auto">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${reason.severity === "HIGH"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : reason.severity === "MEDIUM"
                              ? "bg-[#FEF3C7] text-[#92400E]"
                              : "bg-[#D1FAE5] text-[#065F46]"
                            }`}
                        >
                          {reason.severity} RISK
                        </span>

                        <AnimatePresence initial={false}>
                          {isFixing && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="w-full"
                            >
                              <div className="mt-2 text-xs text-[#4E453F] bg-[#F5F0E8] border border-[#E5E0D8] rounded-xl p-3 flex items-center gap-2">
                                <RotateCcw className="h-3.5 w-3.5 animate-spin text-[#D97706]" />
                                <span>Generating a rewritten section...</span>
                              </div>
                            </motion.div>
                          )}

                          {!isFixing && fixError && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="w-full"
                            >
                              <div className="mt-2 text-xs text-[#991B1B] bg-red-50/60 border border-red-200/40 rounded-xl p-3 flex items-start gap-2">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#EF4444]" />
                                <span>{fixError}</span>
                              </div>
                            </motion.div>
                          )}

                          {!isFixing && hasFixText && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="w-full"
                            >
                              <div className="mt-2 bg-white border border-[#E5E0D8] rounded-xl p-3 relative">
                                <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#7C3AED] mb-1">
                                  Rewritten resume text
                                </p>
                                <p className="text-xs italic text-[#1C1008] leading-relaxed pr-14 font-medium">
                                  "{fixState?.text}"
                                </p>

                                <button
                                  onClick={() => handleCopyFix(idx, fixState?.text || "")}
                                  disabled={!fixState?.text}
                                  className="absolute top-2 right-2 p-2 bg-white hover:bg-[#FAF8F5] text-[#7C3AED] rounded-xl border border-[#E5E0D8] transition-all flex items-center gap-1 text-[10px] font-bold shrink-0 cursor-pointer disabled:opacity-50"
                                >
                                  {fixState?.copied ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: COMPANY ARCHETYPE */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: `Company Culture & Archetype: ${result.company_archetype.label}`,
                description: "We parsed the phrasing, priority orders, and explicit keywords in the job description to determine company culture requirements.",
                details: result.company_archetype.insights.map(ins => `${ins.icon} ${ins.title}: ${ins.explanation}`),
                actionItems: [
                  "Calibrate cover letter tone to match this company's culture.",
                  "Structure behavioral interviews based on core values described in these insights.",
                  "Ensure project descriptions reflect matching engineering scales."
                ]
              })}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#7C3AED] hover:border-purple-400/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[3px] transition-all duration-200 ease-out relative cursor-pointer group"
            >
              <span className="absolute top-7 right-7 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Unique Feature
              </span>

              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1C1008] tracking-tight group-hover:text-[#7C3AED] transition-colors">
                    What This Company Actually Wants
                  </h3>
                  <p className="text-xs text-[#4E453F] mt-1 font-medium">
                    Decoded from the job description's language patterns, tone, and word frequency.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#7C3AED] font-bold group-hover:underline self-center shrink-0">Click to view diagnostics →</span>
              </div>

              <div>
                <div className="bg-[#EDE9FE] text-[#4C1D95] rounded-2xl px-5 py-3 font-bold text-lg inline-flex items-center gap-2 mb-5">
                  <Target className="h-5 w-5" />
                  <span>{result.company_archetype.label}</span>
                </div>

                <div className="space-y-3">
                  {result.company_archetype.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F5F0E8] rounded-2xl px-4 py-3 flex items-start gap-3 border border-[#E5E0D8]/40"
                    >
                      <span className="text-2xl shrink-0 leading-none">{insight.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[#1C1008]">{insight.title}</p>
                        <p className="text-xs text-[#4E453F] mt-0.5 leading-relaxed">{insight.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 4: KEYWORD ANALYSIS */}
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#10B981] hover:-translate-y-[3px] transition-transform duration-200 ease-out">
              <h3 className="text-xl font-extrabold text-[#1C1008] tracking-tight mb-6">
                Keyword Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Found Keywords */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#1C1008] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Found in your resume
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_found.map((kw, idx) => (
                      <span
                        key={idx}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        className="bg-[#D1FAE5] text-[#065F46] rounded-full px-3 py-1 text-xs font-semibold inline-block animate-pop-in"
                      >
                        {kw}
                      </span>
                    ))}
                    {result.keywords_found.length === 0 && (
                      <span className="text-xs text-[#4E453F]/60 italic font-medium">No matching keywords found</span>
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#1C1008] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Missing — add these
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_missing.map((kw, idx) => (
                      <span
                        key={idx}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        className="bg-[#FEE2E2] text-[#991B1B] rounded-full px-3 py-1 text-xs font-semibold inline-block animate-pop-in"
                      >
                        {kw}
                      </span>
                    ))}
                    {result.keywords_missing.length === 0 && (
                      <span className="text-xs text-[#10B981] font-bold">100% Keyword alignment!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Rewrite suggestion */}
              <div className="mt-8 pt-6 border-t border-[#E5E0D8]">
                <button
                  onClick={() => setShowRewrite(!showRewrite)}
                  className="text-[#7C3AED] hover:text-[#7C3AED]/80 font-bold text-sm flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Eye className="h-4.5 w-4.5" />
                  <span>✦ {showRewrite ? "Hide rewritten summary" : "See rewritten summary"}</span>
                </button>

                {showRewrite && (
                  <div className="bg-[#EDE9FE] rounded-2xl p-4 mt-3 relative border border-[#7C3AED]/10 animate-fade-in-up">
                    <p className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#7C3AED] mb-2">
                      Optimized Professional Summary
                    </p>
                    <p className="text-sm italic text-[#4C1D95] pr-16 leading-relaxed font-sans font-medium">
                      "{result.rewrite_suggestion}"
                    </p>

                    <button
                      onClick={handleCopyRewrite}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-[#7C3AED] rounded-xl border border-[#7C3AED]/20 transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      {copiedRewrite ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 5: QUICK WINS & IMPACT CALCULATOR & INLINE REWRITING (dark card) */}
            <div className="bg-[#1C1008] rounded-3xl p-7 premium-shadow hover:-translate-y-[3px] transition-transform duration-200 ease-out">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-[#D97706] shrink-0" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Your 3 Quick Wins
                </h3>
              </div>
              <p className="text-white/60 text-xs font-medium pl-8 mb-6">
                Fix these first. Sorted by estimated ATS compatibility score impact.
              </p>

              <div className="space-y-4">
                {sortedQuickWins.slice(0, 3).map((win, idx) => {
                  const isRewriting = rewrites[idx]?.loading;
                  const hasRewrite = !!rewrites[idx]?.text;
                  const rewriteError = rewrites[idx]?.error;
                  return (
                    <div
                      key={idx}
                      className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3 border border-white/5"
                    >
                      <div className="flex items-start gap-4 justify-between">
                        <div className="flex items-start gap-4">
                          <span className="text-[#D97706] text-2xl font-extrabold font-mono leading-none">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">{win.title}</p>
                            <p className="text-xs text-white/70 leading-relaxed font-medium">{win.description}</p>
                          </div>
                        </div>

                        {/* Impact Statistics */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                          <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm uppercase shrink-0">
                            <TrendingUp className="h-3 w-3 shrink-0" /> +{win.impact_increase} Score
                          </span>
                          <span className="text-[9px] font-mono font-medium text-white/40 flex items-center gap-0.5 shrink-0 uppercase">
                            <Clock className="h-2.5 w-2.5 shrink-0" /> {win.time_required}
                          </span>
                        </div>
                      </div>

                      {/* original context + rewrite launcher */}
                      {win.original_context && (
                        <div className="mt-2 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/2 p-3 rounded-xl border border-white/2">
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold">Your current draft</p>
                            <p className="text-xs text-white/80 leading-relaxed font-medium italic pr-4">"{win.original_context}"</p>
                          </div>

                          {isRewriting ? (
                            <div className="py-1">
                              <LoadingSequence steps={["Scanning bullet...", "Polishing vocabulary...", "Applying metrics..."]} />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRewriteBullet(idx, win.original_context, win.description)}
                              className="bg-[#D97706] text-[#1C1008] hover:bg-[#D97706]/90 transition-all font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer duration-150 active:scale-[0.98]"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Rewrite Bullet</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Error in rewrite */}
                      {rewriteError && (
                        <div className="text-xs text-red-400 bg-red-950/20 p-2 rounded-xl border border-red-900/30 flex items-center gap-1.5 mt-2">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{rewriteError}</span>
                        </div>
                      )}

                      {/* Expanded rewritten bullet */}
                      <AnimatePresence>
                        {hasRewrite && rewrites[idx]?.text && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-1"
                          >
                            <div className="bg-white/10 rounded-xl p-3 border border-white/10 relative mt-2">
                              <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#D97706] mb-1">
                                AI Optimized Bullet Point
                              </p>
                              <p className="text-xs italic text-white pr-14 leading-relaxed font-medium font-sans">
                                "{rewrites[idx].text}"
                              </p>

                              <button
                                onClick={() => handleCopyInlineRewrite(idx, rewrites[idx].text || "")}
                                className="absolute top-2.5 right-2.5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all flex items-center gap-1 text-[10px] font-bold shrink-0 cursor-pointer"
                              >
                                {rewrites[idx].copied ? (
                                  <>
                                    <Check className="h-3 w-3 text-[#10B981]" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleCopyQuickWins}
                className="bg-[#D97706] text-[#1C1008] hover:bg-[#D97706]/90 active:scale-[0.98] transition-all duration-200 font-bold rounded-2xl py-3.5 w-full mt-6 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {copiedWins ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Copied all quick wins!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy All Quick Wins</span>
                  </>
                )}
              </button>
            </div>

            {/* CARD 6: ATS SIMULATOR CARD */}
            {result.ats_simulation && result.ats_simulation.length > 0 && (
              <div 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest(".grid > div")) return; // ignore if user clicks sub-system cards
                  setActiveDiagnosticDetail({
                    title: "ATS Sandbox Engine Simulation",
                    description: "Simulation of how standard enterprise Applicant Tracking Systems (e.g. Workday, Taleo, Greenhouse) parse and score your resume structure.",
                    details: result.ats_simulation.map(ats => `${ats.name}: Score ${ats.score}/100 [Status: ${ats.status}] - ${ats.biggest_issue}`),
                    actionItems: [
                      "Verify keyword densities align above the 70% threshold.",
                      "Test layout against the PDF standard structure.",
                      "Ensure fonts and layouts use standard clean formats."
                    ]
                  });
                }}
                className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#D97706] hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[3px] transition-all duration-200 ease-out relative cursor-pointer group"
              >
                <span className="absolute top-7 right-7 bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ATS Simulation
                </span>

                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1C1008] tracking-tight group-hover:text-[#D97706] transition-colors">
                      ATS Sandbox Engine
                    </h3>
                    <p className="text-xs text-[#4E453F] mt-1 font-medium">
                      ATS Killer is an AI-powered resume analysis and optimization platform. It utilizes the AI analysis API to scan resumes against target job descriptions, provide matching scores, identify skill gaps, and suggest optimizations to align your resume with Applicant Tracking Systems (ATS).
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#D97706] font-bold group-hover:underline self-center shrink-0">Click to view diagnostics →</span>
                </div>

                {/* Grid of 5 ATS cards */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {result.ats_simulation.map((ats) => {
                    const isSelected = selectedAts === ats.name;
                    const isPass = ats.status === "PASS";
                    return (
                      <div
                        key={ats.name}
                        onClick={() => setSelectedAts(isSelected ? null : ats.name)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${isSelected
                          ? "bg-[#1C1008] border-[#1C1008] text-white"
                          : "bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1008]"
                          }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold font-mono tracking-wide">{ats.name}</p>
                          <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider ${isPass
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                            }`}>
                            {ats.status}
                          </p>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between">
                          <span className={`text-2xl font-display font-extrabold ${isSelected ? "text-white" : "text-[#1C1008]"}`}>
                            {ats.score}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-white/60" : "text-[#4E453F]/60"}`}>
                            /100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ATS Accordion Detail Panel */}
                <AnimatePresence>
                  {selectedAts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4"
                    >
                      {(() => {
                        const atsData = result.ats_simulation.find((a) => a.name === selectedAts);
                        if (!atsData) return null;
                        return (
                          <div className="bg-[#F5F0E8] border border-[#E5E0D8] rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-2">
                              <span className="text-sm font-bold text-[#1C1008] font-mono">
                                {atsData.name} Parser Diagnostics
                              </span>
                              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${atsData.status === "PASS" ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"
                                }`}>
                                Score: {atsData.score}/100
                              </span>
                            </div>

                            <p className="text-xs text-[#4E453F] leading-relaxed">
                              <strong className="text-[#1C1008]">Analysis:</strong> {atsData.explanation}
                            </p>

                            <div className="bg-red-50 text-[#991B1B] p-3 rounded-xl border border-red-200/50 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444] mt-0.5" />
                              <div>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-wider">Biggest System Friction</p>
                                <p className="text-xs font-semibold mt-0.5 leading-relaxed">{atsData.biggest_issue}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* BRAND-NEW RECRUITER INTELLIGENCE SECTION */}
            <div className="border-t border-[#E5E0D8] pt-12 mt-12 space-y-8 animate-fade-in-up">

              <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#7C3AED] uppercase bg-[#EDE9FE] px-3 py-1 rounded-full border border-[#7C3AED]/20 inline-block">
                  Recruiter Intelligence™
                </span>
                <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
                  Recruiter Intelligence Report
                </h3>
                <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                  Five premium AI evaluation modules mapping how hiring managers and human screeners evaluate this exact resume.
                </p>
              </div>

              {/* Row 1: Recruiter Eyes™ & Scan Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* MODULE 1: Recruiter Eyes™ */}
                <div 
                  onClick={() => setActiveDiagnosticDetail({
                    title: "Recruiter Intelligence Gaze simulation",
                    description: "Simulation of where a recruiter's eyes focus during the critical first 6-second scan of your resume structure.",
                    details: [
                      `First Noticed: ${result.recruiter_eyes.first_noticed.join(", ")}`,
                      `Ignored items: ${result.recruiter_eyes.ignored_items.join(", ")}`,
                      `Weakest section: ${result.recruiter_eyes.weakest_section}`,
                      `Strongest section: ${result.recruiter_eyes.strongest_section}`,
                      `Verdict: ${result.recruiter_eyes.verdict}`
                    ],
                    actionItems: [
                      "Relocate important experience parameters to the top fold.",
                      "Verify that dates and role titles are highly legible.",
                      "Clean up formatting in ignored/weakest sections."
                    ]
                  })}
                  className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow border-l-4 border-l-[#7C3AED] flex flex-col justify-between hover:border-purple-400/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[3px] transition-all duration-200 cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-[#1C1008] group-hover:text-[#7C3AED] transition-colors">Recruiter Eyes™</h4>
                      <span className="text-[9px] font-mono font-bold text-[#7C3AED] group-hover:underline">Click to view diagnostics →</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-wider">First Noticed</p>
                          <ul className="text-xs text-[#4E453F] mt-1 space-y-1 list-disc pl-3 leading-relaxed">
                            {result.recruiter_eyes.first_noticed.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Ignored Items</p>
                          <ul className="text-xs text-[#4E453F] mt-1 space-y-1 list-disc pl-3 leading-relaxed">
                            {result.recruiter_eyes.ignored_items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5E0D8]/40 space-y-2">
                        <p className="text-xs text-[#4E453F] leading-relaxed">
                          <strong className="text-[#1C1008]">Skipped Sections: </strong>
                          {result.recruiter_eyes.skipped_sections.join(", ") || "None"}
                        </p>
                        <p className="text-xs text-[#4E453F] leading-relaxed">
                          <strong className="text-[#10B981]">Strongest Section: </strong>
                          {result.recruiter_eyes.strongest_section}
                        </p>
                        <p className="text-xs text-[#4E453F] leading-relaxed">
                          <strong className="text-[#EF4444]">Weakest Section: </strong>
                          {result.recruiter_eyes.weakest_section}
                        </p>
                        <p className="text-xs text-[#4E453F] leading-relaxed">
                          <strong className="text-[#1C1008]">Estimated Scan Speed: </strong>
                          {result.recruiter_eyes.estimated_reading_time}
                        </p>
                        <p className="text-xs text-[#4E453F] leading-relaxed">
                          <strong className="text-[#1C1008]">Verdict: </strong>
                          <span className="font-semibold underline decoration-[#7C3AED]/40 decoration-wavy">{result.recruiter_eyes.verdict}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interview Probability Visual Meter */}
                  <div className="space-y-1.5 mt-5 pt-4 border-t border-[#E5E0D8]/60">
                    <div className="flex justify-between items-center text-xs font-bold text-[#1C1008]">
                      <span>Interview Probability</span>
                      <span className="font-mono text-[#7C3AED]">{result.recruiter_eyes.interview_probability}%</span>
                    </div>
                    <div className="h-2 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E5E0D8]/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: animateBars ? `${result.recruiter_eyes.interview_probability}%` : "0%" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]/70 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* MODULE 2: Recruiter Scan Timeline */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow border-l-4 border-l-[#D97706] flex flex-col justify-between hover:-translate-y-[3px] transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-[#1C1008]">Scan Timeline Gaze</h4>
                      <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                        Gaze Path Map
                      </span>
                    </div>

                    <div className="relative border-l-2 border-[#FAF8F5] pl-6 space-y-4 my-2">
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-[#D97706] to-[#EF4444]" />

                      {result.scan_timeline.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15, duration: 0.5 }}
                          className="relative space-y-1"
                        >
                          <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-[#D97706] shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                          </span>

                          <div className="flex items-baseline gap-2">
                            <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                              {step.time_elapsed}
                            </span>
                            <span className="text-xs font-extrabold text-[#1C1008] font-mono">
                              {step.section_name}
                            </span>
                          </div>

                          <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                            {step.observation}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Resume Heatmap & Attention Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* MODULE 3: Resume Heatmap */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow border-l-4 border-l-[#10B981] flex flex-col justify-between hover:-translate-y-[3px] transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-[#1C1008]">Resume Heatmap</h4>
                      <span className="text-[9px] font-mono font-bold text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded">
                        Section Grading
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {result.resume_heatmap.map((heatmap, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                            <span>{heatmap.section}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${heatmap.grade === "Excellent" || heatmap.grade === "Good"
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : heatmap.grade === "Average"
                                  ? "bg-[#FEF3C7] text-[#92400E]"
                                  : "bg-[#FEE2E2] text-[#991B1B]"
                                }`}>
                                {heatmap.grade}
                              </span>
                              <span className="font-mono text-[#4E453F]/60 text-[10px]">{heatmap.score_percent}%</span>
                            </div>
                          </div>

                          <div className="h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden w-full border border-[#E5E0D8]/40">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: animateBars ? `${heatmap.score_percent}%` : "0%" }}
                              transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.08 }}
                              className={`h-full rounded-full ${getHeatmapColor(heatmap.grade)}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MODULE 4: Attention Score */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow border-l-4 border-l-[#7C3AED] flex flex-col justify-between hover:-translate-y-[3px] transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-[#1C1008]">Recruiter Attention Scores</h4>
                      <span className="text-[9px] font-mono font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded">
                        Eye tracking mapping
                      </span>
                    </div>

                    <div className="space-y-4 mt-2">
                      {result.attention_scores.map((score, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                            <span>{score.section} Focus Intensity</span>
                            <span className="font-mono text-[#7C3AED]">{score.percentage}%</span>
                          </div>

                          <div className="h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden w-full border border-[#E5E0D8]/40">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: animateBars ? `${score.percentage}%` : "0%" }}
                              transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]/70 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 3: Emotional Impression */}
              {/* MODULE 5: Emotional Impression */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow border-l-4 border-l-[#1C1008] hover:-translate-y-[3px] transition-all duration-200">
                <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3 mb-6">
                  <h4 className="text-sm font-extrabold text-[#1C1008]">Emotional & Professional Impression</h4>
                  <span className="text-[9px] font-mono font-bold text-[#1C1008]/60 bg-[#F5F0E8] px-2 py-0.5 rounded">
                    Candidate Profile Aura
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {result.emotional_impression.map((attr, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#1C1008] uppercase tracking-wider">
                          {attr.attribute}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-[#1C1008] bg-[#F5F0E8] px-2.5 py-0.5 rounded border border-[#E5E0D8]/60">
                          {attr.score}
                        </span>
                      </div>

                      <div className="h-2 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: animateBars ? `${attr.score}%` : "0%" }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.08 }}
                          className="h-full bg-[#1C1008] rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Results sections wrapped in Suspense */}
            <Suspense fallback={<div className="max-w-md mx-auto my-12"><LoadingSequence steps={["Loading..."]} /></div>}>
              {/* Career Intelligence Section */}
              <CareerIntelligence result={result} animate={animateBars} />

              {/* Job Search Workspace Section */}
              <JobSearchWorkspace initialResult={result} resume={resume} />

              {/* Career Dashboard Section */}
              <CareerDashboard result={result} animate={animateBars} onNavigateTab={() => { }} />

              {/* AI Career Copilot Section */}
              <AICareerCopilot result={result} resume={resume} />

              {/* AI Opportunity Engine Section */}
              <AIOpportunityEngine result={result} animate={animateBars} />
            </Suspense>

            {/* Reset Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-[#E5E0D8] bg-white rounded-2xl text-sm font-bold text-[#1C1008] hover:bg-[#F5F0E8] transition-all hover:-translate-y-[2px] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Analyze another resume</span>
              </button>
            </div>

          </div>
        )}

      {/* DIAGNOSTIC DETAIL MODAL */}
      <DiagnosticModal
        isOpen={!!activeDiagnosticDetail}
        onClose={() => setActiveDiagnosticDetail(null)}
        title={activeDiagnosticDetail?.title || ""}
        description={activeDiagnosticDetail?.description || ""}
        details={activeDiagnosticDetail?.details}
        actionItems={activeDiagnosticDetail?.actionItems}
      />

      </div>
    </section>
  );
}
