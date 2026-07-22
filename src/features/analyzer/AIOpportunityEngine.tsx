import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Sliders,
  TrendingUp,
  Cpu,
  Target,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Building,
  DollarSign,
  MapPin,
  TrendingDown,
  Info,
  Layers,
  Compass,
} from "lucide-react";
import {
  AnalysisResult,
  JobMatchRecommendation,
  OpportunityScoreDetails,
  SmartResumeSelectorItem,
  PreApplicationOptimizerDetails,
  WeeklyOpportunityFeedDetails,
} from "../../hooks/useGeminiAnalyzer";

interface AIOpportunityEngineProps {
  result: AnalysisResult;
  animate: boolean;
}

export default function AIOpportunityEngine({ result, animate }: AIOpportunityEngineProps) {
  const {
    opportunity_engine,
    job_matches,
    resume_selector,
    pre_application_optimizer,
    weekly_feed,
  } = result;

  // Fallbacks in case properties are missing
  const scoreData = opportunity_engine || {
    overall_match: 84,
    ats_compatibility: 78,
    recruiter_appeal: 82,
    skill_match: 88,
    experience_match: 85,
    competition_level: "Medium",
    estimated_interview_chance: 65,
  };

  const matchesList = job_matches || [];
  const selectorsList = resume_selector || [];
  const optimizersList = pre_application_optimizer || [];
  const feedData = weekly_feed || {
    trending_companies: [],
    best_matches: [],
    recommended_applications: [],
    weekly_application_target: 5,
    personalized_strategy: "Submit optimized V2 draft to Airbnb.",
  };

  // State
  const [activeTab, setActiveTab] = useState<"matcher" | "scores" | "feed">("matcher");
  const [focusedJobId, setFocusedJobId] = useState<string>(() => matchesList[0]?.id || "");

  // Focused sub-components derived state
  const focusedJob = useMemo(() => {
    return matchesList.find(j => j.id === focusedJobId) || matchesList[0] || null;
  }, [matchesList, focusedJobId]);

  const focusedSelector = useMemo(() => {
    if (!focusedJob) return null;
    return selectorsList.find(s => s.job_id === focusedJob.id) || selectorsList[0] || null;
  }, [selectorsList, focusedJob]);

  const focusedOptimizer = useMemo(() => {
    if (!focusedJob) return null;
    return optimizersList.find(o => o.job_id === focusedJob.id) || optimizersList[0] || null;
  }, [optimizersList, focusedJob]);

  return (
    <div className="border-t border-[#E5E0D8] pt-12 mt-12 px-4 sm:px-6 space-y-12">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#D97706]/20 inline-block">
          Opportunity Engine™
        </span>
        <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
          AI Opportunity Engine
        </h3>
        <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
          Five premium modules mapping matching scores, smart resume selector logic, pre-application optimizers, and weekly opportunity feeds.
        </p>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="flex border-b border-[#E5E0D8]/50 pb-px overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("matcher")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "matcher"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          🔍 Job Matcher & Optimizer
        </button>

        <button
          onClick={() => setActiveTab("scores")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "scores"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          📊 Opportunity Score
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "feed"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          📅 Weekly Target Feed
        </button>
      </div>

      {/* ACTIVE VIEW AREA */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: JOB DISCOVERY + SELECTOR + OPTIMIZER */}
          {activeTab === "matcher" && (
            <motion.div
              key="matcher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Left Column: Job Discovery List */}
              <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-4 max-h-[500px] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">AI Job Discovery</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Recommendations mapped to your skill profile</p>
                </div>

                <div className="space-y-2.5">
                  {matchesList.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setFocusedJobId(job.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs space-y-2.5 cursor-pointer ${
                        focusedJobId === job.id
                          ? "bg-[#1C1008] border-[#1C1008] text-white"
                          : "bg-[#FAF8F5] border-[#E5E0D8]/60 text-[#1C1008] hover:bg-[#F5F0E8]"
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-[13px]">{job.company}</span>
                        <span className={`text-[10px] font-mono font-extrabold ${focusedJobId === job.id ? "text-[#D97706]" : "text-purple-600"}`}>
                          {job.match_percent}% Match
                        </span>
                      </div>

                      <p className={`text-[11px] font-bold ${focusedJobId === job.id ? "text-stone-300" : "text-[#4E453F]"}`}>
                        {job.role}
                      </p>

                      <div className="flex gap-3 text-[9px] font-mono font-bold text-stone-400">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {job.location}</span>
                        <span className="flex items-center gap-0.5"><Building className="h-3 w-3" /> {job.workplace_type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Optimizer & Resume Selector details */}
              <div className="md:col-span-7 space-y-6">
                {focusedJob ? (
                  <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                    
                    {/* Header info */}
                    <div className="border-b border-[#E5E0D8]/60 pb-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-extrabold text-[#1C1008] font-display">{focusedJob.company}</h4>
                        <span className="bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/20 px-2 py-0.5 rounded text-[9px] font-mono font-extrabold">
                          {focusedJob.salary_range} Est. Pay
                        </span>
                      </div>
                      <p className="text-xs text-[#4E453F] font-semibold italic">"{focusedJob.recommendation_reason}"</p>
                    </div>

                    {/* Resume Selector */}
                    {focusedSelector && (
                      <div className="bg-[#FAF8F5] border border-gray-100 p-4.5 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1C1008] uppercase">
                          <Layers className="h-4 w-4 text-[#D97706]" /> Smart Resume Selector
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">Best Version</span>
                            <span className="text-xs font-extrabold text-[#1C1008]">{focusedSelector.best_version}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">ATS Increase</span>
                            <span className="text-xs font-extrabold text-emerald-600">+{focusedSelector.expected_ats_improvement}%</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">Confidence</span>
                            <span className="text-xs font-extrabold text-purple-600">{focusedSelector.confidence_score}%</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#4E453F] leading-relaxed font-semibold italic">
                          <strong>Selector Rationale:</strong> {focusedSelector.selection_reason}
                        </p>
                      </div>
                    )}

                    {/* Pre-Application Optimizer */}
                    {focusedOptimizer && (
                      <div className="bg-stone-50 border border-stone-100 p-4.5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1C1008] uppercase">
                          <Sliders className="h-4 w-4 text-purple-600" /> Pre-Application Optimizer
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold">Missing Keywords</span>
                            <div className="flex flex-wrap gap-1">
                              {focusedOptimizer.missing_keywords.map((kw, i) => (
                                <span key={i} className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded text-[8px] font-extrabold">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold">Missing Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {focusedOptimizer.missing_skills.map((sk, i) => (
                                <span key={i} className="bg-stone-100 border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-[8px] font-extrabold">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-[#E5E0D8]/40 pt-3">
                          <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold block">Optimizer Plan Guidelines</span>
                          <ul className="list-disc list-inside text-[10px] text-stone-600 leading-relaxed font-semibold space-y-1 pl-1">
                            {focusedOptimizer.resume_improvements.map((imp, idx) => (
                              <li key={idx}>{imp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-[10px] text-gray-500 font-mono bg-[#FAF8F5] p-3 rounded-xl flex justify-between border border-[#E5E0D8]/30">
                          <span>Prep Time: <strong>{focusedOptimizer.time_to_improve}</strong></span>
                          <span>ATS Gain: <strong className="text-emerald-600">+{focusedOptimizer.ats_gain}%</strong></span>
                          <span>Callback Lift: <strong className="text-purple-600">+{focusedOptimizer.interview_probability_increase}%</strong></span>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8] border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center text-xs text-gray-400">
                    <Compass className="h-10 w-10 text-[#E5E0D8] mb-3" />
                    <p className="font-semibold">Select a recommended job to optimize your application.</p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 2: OPPORTUNITY SCORE CARDS */}
          {activeTab === "scores" && (
            <motion.div
              key="scores"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              
              {/* Radial overall match gauge + counters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Overall Opportunity Score card */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow border-t-4 border-t-[#D97706]">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">Opportunity Index</span>
                    <h4 className="text-sm font-extrabold text-[#1C1008] font-display mt-0.5">Overall Fit Match</h4>
                  </div>

                  {/* SVG Circle Gauge */}
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-gray-100" strokeWidth="8" fill="none" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-[#D97706]"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * scoreData.overall_match) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute font-display font-extrabold text-2xl text-[#1C1008]">
                      {scoreData.overall_match}%
                    </span>
                  </div>

                  <p className="text-[10px] text-[#4E453F] font-semibold">Match score aggregates skills and draft competitiveness</p>
                </div>

                {/* ATS & Recruiter Appeal Scores */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-purple-600 uppercase tracking-wider">Screener Calibration</span>
                    <h4 className="text-sm font-extrabold text-[#1C1008] font-display mt-0.5">Funnel Appeal Scores</h4>
                  </div>

                  <div className="space-y-4.5 my-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-[#1C1008]">
                        <span>ATS Compatibility</span>
                        <span className="font-mono text-emerald-600">{scoreData.ats_compatibility}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scoreData.ats_compatibility}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-[#1C1008]">
                        <span>Recruiter Appeal</span>
                        <span className="font-mono text-purple-600">{scoreData.recruiter_appeal}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${scoreData.recruiter_appeal}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-[#4E453F]/75 font-semibold pt-1 border-t border-[#E5E0D8]/40">Calibrated to work screeners and manual recruiter parameters</p>
                </div>

                {/* Additional metrics and limits */}
                <div className="bg-[#1C1008] text-white rounded-3xl p-6 premium-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">Opportunity Analytics</span>
                    <h4 className="text-sm font-extrabold font-display">Competition & Interviews</h4>
                  </div>

                  <div className="space-y-4 my-4">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-white/60 font-semibold">Competition Level</span>
                      <span className="font-extrabold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-md text-[10px] font-mono">
                        {scoreData.competition_level}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>Interview Chance</span>
                        <span className="font-mono text-[#D97706]">{scoreData.estimated_interview_chance}%</span>
                      </div>
                      <div className="h-2 bg-white/15 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${scoreData.estimated_interview_chance}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-white/50 font-semibold pt-1 border-t border-white/10">Estimated Interview Chance increases after optimizer completions</p>
                </div>

              </div>

              {/* Line charts or linear scales for Skill/Experience match */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Detailed Competency Match</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Matching parameters mapped to resume keywords and bullet scores</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between font-bold text-[#1C1008]">
                      <span>Skill Match</span>
                      <span className="font-mono text-[#D97706]">{scoreData.skill_match}%</span>
                    </div>
                    <div className="h-2 bg-[#FAF8F5] rounded-full overflow-hidden w-full border border-black/5">
                      <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${scoreData.skill_match}%` }} />
                    </div>
                    <p className="text-[9px] text-[#4E453F]/70 leading-normal pt-1">Checks direct match indices for required framework keywords.</p>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between font-bold text-[#1C1008]">
                      <span>Experience Match</span>
                      <span className="font-mono text-purple-600">{scoreData.experience_match}%</span>
                    </div>
                    <div className="h-2 bg-[#FAF8F5] rounded-full overflow-hidden w-full border border-black/5">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${scoreData.experience_match}%` }} />
                    </div>
                    <p className="text-[9px] text-[#4E453F]/70 leading-normal pt-1">Checks candidate seniority levels and metrics match indices.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: WEEKLYtarget FEED */}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Left Column: Trending companies & Target stats */}
              <div className="md:col-span-7 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Weekly target Feed</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Market opportunities trending in your skill bracket</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold block">Trending Hiring Companies</span>
                    <div className="space-y-2">
                      {feedData.trending_companies.map((company, i) => (
                        <div key={i} className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                          <div>
                            <p className="text-[#1C1008]">{company.name}</p>
                            <p className="text-[9px] text-stone-400 mt-0.5">{company.open_roles} Open Roles</p>
                          </div>
                          <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            {company.trend}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold block">Recommended for Application</span>
                    <div className="space-y-2">
                      {feedData.recommended_applications.map((app, i) => (
                        <div key={i} className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-xl text-xs font-semibold space-y-1">
                          <p className="text-[#1C1008]">{app.company}</p>
                          <p className="text-[9px] text-[#4E453F] flex justify-between font-mono font-bold">
                            <span>{app.role}</span>
                            <span className="text-[#D97706]">{app.difficulty} Prep</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target progress */}
                <div className="border-t border-[#E5E0D8]/50 pt-4 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-baseline font-bold text-[#1C1008]">
                    <span>Weekly Target Applications Goal</span>
                    <span className="font-mono text-[#D97706]">3 / {feedData.weekly_application_target} Completed</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${(3 / feedData.weekly_application_target) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Right Column: AI Target Strategy */}
              <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E5E0D8]/60 pb-3">
                  <div className="bg-[#FEF3C7] p-1.5 rounded-xl text-[#D97706]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">AI Target Strategy</h4>
                    <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Goal strategies mapping draft metrics to targets</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8]/50 p-4 rounded-2xl">
                    <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">Hiring Pitch Strategy</span>
                    <p className="text-xs text-[#1C1008] leading-relaxed font-semibold mt-2">{feedData.personalized_strategy}</p>
                  </div>

                  <div className="space-y-2 text-xs leading-normal font-semibold text-stone-600">
                    <p className="text-[#1C1008] font-bold">Recommended steps for this week:</p>
                    <div className="space-y-1.5 pl-2">
                      <p className="flex items-start gap-1.5"><span className="text-[#D97706]">1.</span> Review Airbnb JD optimization missing keywords.</p>
                      <p className="flex items-start gap-1.5"><span className="text-[#D97706]">2.</span> Re-run V1 draft compatibility matching review for Vercel.</p>
                      <p className="flex items-start gap-1.5"><span className="text-[#D97706]">3.</span> Draft cover letter addressing Next.js layout SPA designs.</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
