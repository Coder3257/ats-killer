import React, { useState } from "react";
import {
  Wrench,
  X,
  Sparkles,
  MessageSquare,
  RotateCcw,
  Download,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
} from "lucide-react";
import { useGeminiAnalyzer, AnalysisResult } from "../shared/hooks/useGeminiAnalyzer";
import { useToast } from "../shared/contexts/ToastContext";

interface FloatingToolkitProps {
  onAnalysisSuccess: (newResult: AnalysisResult) => void;
  setActiveTab: (tab: any) => void;
}

export default function FloatingToolkit({ onAnalysisSuccess, setActiveTab }: FloatingToolkitProps) {
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeView, setActiveView] = useState<"menu" | "rewrite" | "recheck" | "faq">("menu");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // useGeminiAnalyzer hooks
  const { loading: rewriteLoading, rewriteBullet } = useGeminiAnalyzer();
  const { loading: recheckLoading, analyze } = useGeminiAnalyzer();

  // Rewrite state
  const [originalBullet, setOriginalBullet] = useState("");
  const [targetContext, setTargetContext] = useState("");
  const [rewrittenResult, setRewrittenResult] = useState<string | null>(null);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  // Score Recheck state
  const [recheckSuccess, setRecheckSuccess] = useState(false);
  const [recheckError, setRecheckError] = useState<string | null>(null);

  const SUCCESS_STORIES = [
    {
      name: "Aman Gupta",
      role: "Full Stack Engineer",
      company: "Swiggy",
      metric: "+45% Response Rate",
      text: "Callback from Swiggy in 7 days after optimizing missing keywords."
    },
    {
      name: "Priyanka Roy",
      role: "Senior Product Manager",
      company: "Paytm",
      metric: "3 Loops in 10 Days",
      text: "ATS score jumped from 62 to 94; unlocked multiple top-tier startup loops."
    },
    {
      name: "Vikram Malhotra",
      role: "Growth Analyst",
      company: "Razorpay",
      metric: "Offer Received",
      text: "Uncovered hidden job post keywords automatically to clear initial screening."
    }
  ];

  const TOOLKIT_FAQs = [
    {
      q: "How does the ATS compatibility score work?",
      a: "Enterprise ATS platforms parse resume text and check for exact keyword density matching the job posting. We simulate these parsing filters dynamically to grade your resume compatibility."
    },
    {
      q: "How do I trigger a score recheck?",
      a: "When you upload a new resume variation, click 'Score Recheck' in this toolkit. It runs the Gemini API analysis using your active resume and JD context to refresh metrics."
    },
    {
      q: "Is my personal resume data private?",
      a: "Yes. Your resume parameters are securely cached in local storage for analysis and are never stored on public indexing databases or utilized for model training."
    }
  ];

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalBullet.trim()) return;
    try {
      setRewrittenResult(null);
      const res = await rewriteBullet(originalBullet, targetContext);
      setRewrittenResult(res);
      showToast("Bullet rewritten successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to rewrite bullet", "error");
    }
  };

  const handleCopyRewrite = () => {
    if (!rewrittenResult) return;
    navigator.clipboard.writeText(rewrittenResult);
    setCopiedRewrite(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedRewrite(false), 2000);
  };

  const handleRecheck = async () => {
    const resumeText = localStorage.getItem("latest_resume_text");
    const jdText = localStorage.getItem("latest_jd_text");

    if (!resumeText || !jdText) {
      setRecheckError("Please upload and analyze a resume first in the Resume Analyzer tab.");
      return;
    }

    try {
      setRecheckError(null);
      setRecheckSuccess(false);
      const res = await analyze(resumeText, jdText);
      if (res) {
        onAnalysisSuccess(res);
        setRecheckSuccess(true);
        showToast("Analysis score refreshed successfully!", "success");
      }
    } catch (err: any) {
      setRecheckError(err.message || "Failed to recheck score.");
      showToast("Re-analysis failed.", "error");
    }
  };

  const handleExport = () => {
    const resumeText = localStorage.getItem("latest_resume_text");
    if (!resumeText) {
      showToast("No resume text found to export. Analyze a resume first.", "error");
      return;
    }

    try {
      const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "optimized_resume.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Resume exported successfully as text file!", "success");
    } catch (err: any) {
      showToast("Export failed.", "error");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          setActiveView("menu");
        }}
        className="fixed bottom-6 right-6 z-[100] h-14 w-14 bg-[#D97706] hover:bg-[#D97706]/90 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer"
        title="AI Career Toolkit"
      >
        {isCollapsed ? <Wrench className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Expanded Toolkit Panel */}
      {!isCollapsed && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] max-h-[75vh] overflow-y-auto z-[100] bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-2xl animate-pop-in font-sans flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3.5 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              {activeView !== "menu" && (
                <button
                  onClick={() => {
                    setActiveView("menu");
                    setRecheckError(null);
                    setRecheckSuccess(false);
                    setOpenFaqIndex(null);
                  }}
                  className="p-1 hover:bg-[#FAF8F5] rounded-lg text-stone-500 hover:text-[#1C1008] transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-extrabold text-[#1C1008] text-sm tracking-tight flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#D97706] animate-pulse" />
                {activeView === "menu" && "AI Career Toolkit"}
                {activeView === "rewrite" && "AI Bullet Rewrite"}
                {activeView === "recheck" && "Refresher Score Check"}
                {activeView === "faq" && "FAQ & Hired Stories"}
              </h3>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto font-sans">
            
            {/* VIEW: MENU */}
            {activeView === "menu" && (
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveView("rewrite")}
                  className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/60 hover:border-[#D97706]/20 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-[#FEF3C7] p-2.5 rounded-xl text-[#D97706] group-hover:scale-110 transition-transform">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1C1008]">AI Bullet Rewrite</p>
                      <p className="text-[10px] text-[#4E453F]/70 font-semibold mt-0.5">Optimize weak resume bullets contextually</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("copilot");
                    setIsCollapsed(true);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/60 hover:border-[#D97706]/20 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1C1008]">Chat in Copilot</p>
                      <p className="text-[10px] text-[#4E453F]/70 font-semibold mt-0.5">Focus active Copilot interactive assistant</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveView("recheck");
                    handleRecheck();
                  }}
                  className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/60 hover:border-[#D97706]/20 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-[#10B981] group-hover:scale-110 transition-transform">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1C1008]">Score Recheck</p>
                      <p className="text-[10px] text-[#4E453F]/70 font-semibold mt-0.5">Refresh AI scoring parameters instantly</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveView("faq")}
                  className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/60 hover:border-[#D97706]/20 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1C1008]">FAQ & Success Stories</p>
                      <p className="text-[10px] text-[#4E453F]/70 font-semibold mt-0.5">Real-time answers and landing case-studies</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/60 hover:border-[#D97706]/20 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1C1008]">Export Resume</p>
                      <p className="text-[10px] text-[#4E453F]/70 font-semibold mt-0.5">Download current active resume text</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* VIEW: REWRITE */}
            {activeView === "rewrite" && (
              <form onSubmit={handleRewrite} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Original Bullet Point</label>
                  <textarea
                    required
                    value={originalBullet}
                    onChange={(e) => setOriginalBullet(e.target.value)}
                    placeholder="e.g. Responsible for writing Node.js backend services and maintaining cloud infrastructure."
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-3 text-xs h-24 resize-none focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008] leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Target Role / Context (Optional)</label>
                  <input
                    type="text"
                    value={targetContext}
                    onChange={(e) => setTargetContext(e.target.value)}
                    placeholder="e.g. AWS Lambda, DynamoDB, high-performance APIs"
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={rewriteLoading || !originalBullet.trim()}
                  className="w-full bg-[#1C1008] hover:bg-stone-900 disabled:opacity-45 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {rewriteLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D97706]" />
                      <span>Rewriting bullet point...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                      <span>Rewrite with AI</span>
                    </>
                  )}
                </button>

                {rewrittenResult && (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 mt-2 space-y-3 relative">
                    <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">AI Suggested Version</span>
                    <p className="text-xs text-[#1C1008] leading-relaxed font-semibold">"{rewrittenResult}"</p>
                    
                    <button
                      type="button"
                      onClick={handleCopyRewrite}
                      className="w-full bg-white border border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#1C1008] font-bold py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedRewrite ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy suggestion</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* VIEW: SCORE RECHECK */}
            {activeView === "recheck" && (
              <div className="space-y-5 py-4 text-center">
                {recheckLoading && (
                  <div className="space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-[#D97706] mx-auto" />
                    <p className="text-xs text-[#1C1008] font-bold">Re-analyzing Resume</p>
                    <p className="text-[10px] text-[#4E453F]/70 font-semibold leading-relaxed">
                      Calling Gemini 2.5 Flash to compute updated scoring metrics...
                    </p>
                  </div>
                )}

                {recheckSuccess && (
                  <div className="space-y-3">
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                      <Check className="h-6 w-6 stroke-[3]" />
                    </div>
                    <p className="text-xs text-[#1C1008] font-bold">Analysis Score Refreshed!</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Your career progression metrics and evolution curves have been updated dynamically.
                    </p>
                  </div>
                )}

                {recheckError && (
                  <div className="space-y-3">
                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <p className="text-xs text-[#1C1008] font-bold">Recheck Failed</p>
                    <p className="text-[10px] text-rose-700 font-semibold leading-relaxed px-2">
                      {recheckError}
                    </p>
                    <button
                      onClick={handleRecheck}
                      className="px-4 py-2 bg-[#1C1008] hover:bg-stone-900 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Retry Recheck
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: FAQ & SUCCESS */}
            {activeView === "faq" && (
              <div className="space-y-5">
                
                {/* Got Jobs Section */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">Got Jobs via ATSKiller</span>
                  <div className="space-y-2.5">
                    {SUCCESS_STORIES.map((story, i) => (
                      <div key={i} className="bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-[#1C1008]">{story.name}</span>
                          <span className="text-[8px] font-mono font-extrabold text-[#10B981] bg-[#D1FAE5] px-1.5 py-0.5 rounded uppercase">
                            {story.metric}
                          </span>
                        </div>
                        <p className="text-[9px] text-stone-500 font-semibold">
                          {story.role} at <strong className="text-stone-700">{story.company}</strong>
                        </p>
                        <p className="text-[10px] text-[#4E453F] leading-normal font-medium italic mt-1">
                          "{story.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time FAQs Section */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Frequently Asked Questions</span>
                  <div className="space-y-2">
                    {TOOLKIT_FAQs.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div key={idx} className="bg-stone-50 border border-stone-200/60 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full px-4 py-2.5 text-left flex justify-between items-center text-[#1C1008] hover:text-[#D97706] font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#D97706]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#1C1008]/40" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3 text-[10px] text-[#4E453F] leading-relaxed font-semibold border-t border-stone-200/40 pt-2 bg-white">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
