import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Award,
  ShieldCheck,
  UserCheck,
  Activity,
  Coins,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Target,
  Share2,
} from "lucide-react";
import { AnalysisResult } from "../../hooks/useGeminiAnalyzer";
import DiagnosticModal from "../../components/DiagnosticModal";
import { useToast } from "../../shared/contexts/ToastContext";
import { SKILL_RESOURCE_MAP } from "../../../api/_data/resource-links";


interface CareerIntelligenceProps {
  result: AnalysisResult;
  animate: boolean;
}

export default function CareerIntelligence({ result, animate }: CareerIntelligenceProps) {
  const { showToast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://ats-killer.vercel.app");
    showToast("Link copied to clipboard!", "success");
    setShowShareMenu(false);
  };
  const {
    hiring_probability,
    salary_intelligence,
    skill_gap,
    career_roadmap,
    resume_competitiveness,
  } = result;

  // Fallbacks if for some reason the JSON structure parsing has missing properties
  const probabilityData = hiring_probability || {
    ats_pass: { percentage: 70, confidence: 85, explanation: "Good resume structure and keyword density." },
    recruiter_callback: { percentage: 50, confidence: 75, explanation: "Solid experience but missing a few core keywords." },
    interview: { percentage: 35, confidence: 70, explanation: "Probability is decent assuming callback requirements are met." },
    offer: { percentage: 15, confidence: 65, explanation: "Standard industry offer conversion based on competitiveness." },
  };

  const salaryData = salary_intelligence || {
    current_market: "$100,000 - $115,000",
    expected: "$110,000",
    potential: "$125,000 - $140,000",
    percentile: 60,
    reasoning: "Salary is calculated based on current market trends for this skill level.",
  };

  const skillGapData = skill_gap || [];

  const roadmapData = career_roadmap || {
    steps: [],
  };

  const competitivenessData = resume_competitiveness || {
    technical_skills: 70,
    leadership: 60,
    communication: 65,
    problem_solving: 70,
    business_understanding: 55,
    ats_friendliness: 75,
    recruiter_appeal: 68,
    overall: 66,
  };

  const [activeDiagnosticDetail, setActiveDiagnosticDetail] = useState<any>(null);


  // State to filter skill gap categories - now we just show all skills since categorization is removed
  const [activeSkillTab, setActiveSkillTab] = useState<"All">("All");

  const skillCategories = [
    { label: "All", count: skillGapData.length },
  ];

  const filteredSkills = skillGapData;

  return (
    <div className="border-t border-[#E5E0D8] pt-12 mt-12 px-4 sm:px-6 space-y-12">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-8 relative">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#D97706]/20 inline-block">
          Career Intelligence™
        </span>
        <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
          Career Intelligence Report
        </h3>
        <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
          Five premium AI modules estimating your career growth trajectory, salary potential, skills matching, and long-term competitiveness.
        </p>
        
        {/* Share Button container */}
        <div className="flex justify-center relative pt-2">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="px-3.5 py-1.5 bg-white border border-[#E5E0D8] hover:bg-[#F5F0E8] text-[#1C1008] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Report</span>
          </button>

          {showShareMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowShareMenu(false)}
              />
              <div className="absolute top-12 bg-white border border-[#E5E0D8] rounded-xl shadow-lg p-2.5 w-44 space-y-1 z-50 animate-pop-in text-left">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://ats-killer.vercel.app")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="w-full text-[10px] font-bold text-[#4E453F] hover:text-[#D97706] hover:bg-[#FAF8F5] p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>🔗</span> Share on LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just optimized my resume competitiveness index using ATS Killer! Try it for yourself:")}&url=${encodeURIComponent("https://ats-killer.vercel.app")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="w-full text-[10px] font-bold text-[#4E453F] hover:text-[#D97706] hover:bg-[#FAF8F5] p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>🐦</span> Share on X / Twitter
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left text-[10px] font-bold text-[#4E453F] hover:text-[#D97706] hover:bg-[#FAF8F5] p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all border-none bg-transparent"
                >
                  <span>📋</span> Copy Referral Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODULE 1: Hiring Probability™ */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#D97706] hover:-translate-y-[3px] transition-transform duration-200 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8]/60 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FEF3C7] p-2 rounded-xl text-[#D97706]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wider font-display">Hiring Probability™</h4>
              <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Simulated success metrics through the funnel stages</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
            Pipeline Prediction
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: ATS Pass */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onClick={() => setActiveDiagnosticDetail({
              title: "Funnel Stage 1: ATS Pass Calibration",
              description: probabilityData.ats_pass.explanation,
              details: [
                `Success Probability: ${probabilityData.ats_pass.percentage}%`,
                `Confidence Level: ${probabilityData.ats_pass.confidence}%`
              ],
              actionItems: [
                "Address layout warnings and formatting bugs in the Analyzer tab.",
                "Ensure keyword density matches the target job description closely."
              ]
            })}
            className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-5 hover:shadow-md hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#4E453F] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-[#10B981]" /> ATS Pass
                </span>
                <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#D1FAE5] px-1.5 py-0.5 rounded">
                  Stage 1
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-display font-extrabold text-[#1C1008]">
                  {animate ? probabilityData.ats_pass.percentage : 0}%
                </span>
                <span className="text-[10px] font-medium text-[#4E453F]/60">Probability</span>
              </div>
              <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                {probabilityData.ats_pass.explanation}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8]/40">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#4E453F]">
                <span>Confidence Score</span>
                <span className="font-mono text-[#D97706]">{probabilityData.ats_pass.confidence}%</span>
              </div>
              <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full mt-1.5">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all duration-1000"
                  style={{ width: animate ? `${probabilityData.ats_pass.confidence}%` : "0%" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Callback */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => setActiveDiagnosticDetail({
              title: "Funnel Stage 2: Recruiter Callback Estimation",
              description: probabilityData.recruiter_callback.explanation,
              details: [
                `Success Probability: ${probabilityData.recruiter_callback.percentage}%`,
                `Confidence Level: ${probabilityData.recruiter_callback.confidence}%`
              ],
              actionItems: [
                "Tailor experience descriptions to showcase active ownership rather than tasks.",
                "Optimize summary phrasing to highlight high-impact action verbs."
              ]
            })}
            className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-5 hover:shadow-md hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#4E453F] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <UserCheck className="h-4 w-4 text-[#D97706]" /> Callback
                </span>
                <span className="text-[10px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                  Stage 2
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-display font-extrabold text-[#1C1008]">
                  {animate ? probabilityData.recruiter_callback.percentage : 0}%
                </span>
                <span className="text-[10px] font-medium text-[#4E453F]/60">Probability</span>
              </div>
              <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                {probabilityData.recruiter_callback.explanation}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8]/40">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#4E453F]">
                <span>Confidence Score</span>
                <span className="font-mono text-[#D97706]">{probabilityData.recruiter_callback.confidence}%</span>
              </div>
              <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full mt-1.5">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all duration-1000"
                  style={{ width: animate ? `${probabilityData.recruiter_callback.confidence}%` : "0%" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Interview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setActiveDiagnosticDetail({
              title: "Funnel Stage 3: Interview Pass Prediction",
              description: probabilityData.interview.explanation,
              details: [
                `Success Probability: ${probabilityData.interview.percentage}%`,
                `Confidence Level: ${probabilityData.interview.confidence}%`
              ],
              actionItems: [
                "Prepare core coding patterns (caching, partition structures) from your tech tags.",
                "Practice STAR method behavioral stories for achievements listed in your graph."
              ]
            })}
            className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-5 hover:shadow-md hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#4E453F] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Activity className="h-4 w-4 text-purple-600" /> Interview
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                  Stage 3
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-display font-extrabold text-[#1C1008]">
                  {animate ? probabilityData.interview.percentage : 0}%
                </span>
                <span className="text-[10px] font-medium text-[#4E453F]/60">Probability</span>
              </div>
              <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                {probabilityData.interview.explanation}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8]/40">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#4E453F]">
                <span>Confidence Score</span>
                <span className="font-mono text-[#D97706]">{probabilityData.interview.confidence}%</span>
              </div>
              <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full mt-1.5">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all duration-1000"
                  style={{ width: animate ? `${probabilityData.interview.confidence}%` : "0%" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Offer */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => setActiveDiagnosticDetail({
              title: "Funnel Stage 4: Salary Offer Conversion",
              description: probabilityData.offer.explanation,
              details: [
                `Success Probability: ${probabilityData.offer.percentage}%`,
                `Confidence Level: ${probabilityData.offer.confidence}%`
              ],
              actionItems: [
                "Study market pricing models in the Salary Intelligence section to optimize negotiation.",
                "Highlight business-value indicators in your project discussions."
              ]
            })}
            className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-5 hover:shadow-md hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#4E453F] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Award className="h-4 w-4 text-emerald-600" /> Offer
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Stage 4
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-display font-extrabold text-[#1C1008]">
                  {animate ? probabilityData.offer.percentage : 0}%
                </span>
                <span className="text-[10px] font-medium text-[#4E453F]/60">Probability</span>
              </div>
              <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                {probabilityData.offer.explanation}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8]/40">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#4E453F]">
                <span>Confidence Score</span>
                <span className="font-mono text-[#D97706]">{probabilityData.offer.confidence}%</span>
              </div>
              <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full mt-1.5">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all duration-1000"
                  style={{ width: animate ? `${probabilityData.offer.confidence}%` : "0%" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* MODULE 2: Salary Intelligence™ */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#10B981] hover:-translate-y-[3px] transition-transform duration-200 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8]/60 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#D1FAE5] p-2 rounded-xl text-[#10B981]">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wider font-display">Salary Intelligence™</h4>
              <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Estimated market pricing and optimization payoff</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
            compensation model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Percentile Arc/Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-5">
            <p className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider text-center">
              Market Percentile
            </p>
            
            <div className="relative h-[90px] w-[180px] overflow-hidden flex items-end justify-center">
              <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 180 90">
                {/* Arc Track */}
                <path
                  d="M 15 80 A 65 65 0 0 1 165 80"
                  fill="none"
                  stroke="#F5F0E8"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Arc Fill */}
                <motion.path
                  d="M 15 80 A 65 65 0 0 1 165 80"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="235.6"
                  initial={{ strokeDashoffset: 235.6 }}
                  animate={{ strokeDashoffset: animate ? 235.6 * (1 - salaryData.percentile / 100) : 235.6 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              
              <div className="text-center z-10 space-y-0.5 mb-1">
                <span className="text-2xl font-display font-extrabold text-[#1C1008]">
                  {animate ? salaryData.percentile : 0}th
                </span>
                <span className="text-[9px] font-mono text-[#4E453F]/60 block font-bold">Percentile</span>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-[#4E453F] font-semibold">
              Your resume out-competes {salaryData.percentile}% of matching resumes in market keywords.
            </p>
          </div>

          {/* Salary Figures */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Current Market Value Analysis",
                description: "Based on the skills, scale keywords, and tools extracted from your active resume draft.",
                details: [
                  `Estimated Current Value: ${salaryData.current_market}`,
                  `Market Percentile: ${salaryData.percentile}th percentile`
                ],
                actionItems: [
                  "Include higher-value design patterns (e.g., Redis clustering, partition schemes) to push into higher bands.",
                  "Add core metrics-focused bullets showing cost reduction or efficiency optimization."
                ]
              })}
              className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-[#10B981]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <span className="text-[9px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Current Market</span>
              <p className="text-lg font-extrabold text-[#1C1008] mt-2">{salaryData.current_market}</p>
              <span className="text-[9px] text-[#4E453F]/75 font-semibold mt-1">Based on current resume draft</span>
            </div>

            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Expected Target Value",
                description: "The standard hiring compensation median for candidates who fulfill 100% of the target job description requirements.",
                details: [
                  `Expected Target: ${salaryData.expected}`
                ],
                actionItems: [
                  "Align missing technical skills to match the target JD checklist.",
                  "Verify your resume has at least 80% keyword alignment with target requirements."
                ]
              })}
              className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-[#10B981]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <span className="text-[9px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Expected Value</span>
              <p className="text-lg font-extrabold text-[#1C1008] mt-2">{salaryData.expected}</p>
              <span className="text-[9px] text-[#4E453F]/75 font-semibold mt-1">Hiring target standard</span>
            </div>

            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Potential Salary payoff",
                description: "Estimated market value after integrating all recommended optimizations, achievements, and keywords.",
                details: [
                  `Potential Payoff: ${salaryData.potential}`
                ],
                actionItems: [
                  "Complete the recommended projects in the career coach suggestions.",
                  "Implement XYZ achievements formulas for all major experience nodes."
                ]
              })}
              className="bg-[#FAF8F5] border-2 border-[#10B981]/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-[#10B981]/70 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="absolute top-0 right-0 bg-[#10B981] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-bl uppercase">
                Optimized
              </div>
              <span className="text-[9px] font-mono font-bold text-[#10B981] uppercase tracking-wider">Potential Salary</span>
              <p className="text-lg font-extrabold text-[#10B981] mt-2">{salaryData.potential}</p>
              <span className="text-[9px] text-[#10B981] font-semibold mt-1">Payoff after resume updates</span>
            </div>
          </div>
        </div>

        {/* Reasoning Commentary */}
        <div className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 mt-5">
          <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
            <strong className="text-[#1C1008] font-bold">Pay Scale Analyst Notes:</strong> {salaryData.reasoning}
          </p>
        </div>
      </div>

      {/* MODULE 3: Skill Gap AI™ */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-purple-600 hover:-translate-y-[3px] transition-transform duration-200 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8]/60 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wider font-display">Skill Gap AI™</h4>
              <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Comparing resume skills against job requirements</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
            Keyword Delta Mapping
          </span>
        </div>

        {/* Skill comparison cards list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              // For now, all skills are treated as strings since we removed categorization
              const skillName = typeof skill === 'string' ? skill : skill.name || '';
              const resource = SKILL_RESOURCE_MAP[skillName];

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={skillName}
                  onClick={() => setActiveDiagnosticDetail({
                    title: `Skill Gap Diagnostic: ${skillName}`,
                    description: resource
                      ? `Learn ${skillName} with this recommended resource`
                      : `This skill is identified as a gap based on the job requirements.`,
                    details: [
                      `Skill: ${skillName}`,
                      resource ? `Resource: ${resource.title}` : `Status: Identified as missing from resume`,
                      resource ? `URL: ${resource.url}` : ''
                    ],
                    actionItems: [
                      resource
                        ? `Learn ${skillName} using: ${resource.title}`
                        : `Learn and practice ${skillName} to match job requirements.`,
                      "Consider adding relevant projects or certifications to your resume."
                    ]
                  })}
                  className="border rounded-2xl p-4 flex flex-col justify-between bg-[#FAF8F5] bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/20 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-65">
                        Skill Gap
                      </span>
                      <p className="text-sm font-extrabold text-[#1C1008] leading-tight">
                        {skillName}
                      </p>
                    </div>
                    <XCircle className="h-3.5 w-3.5 text-[#EF4444] shrink-0" />
                  </div>

                  {resource && (
                    <div className="mt-3 pt-2 border-t border-black/5">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        Learn: {resource.title}
                      </a>
                    </div>
                  )}

                  {!resource && (
                    <div className="mt-4 pt-2 border-t border-black/5 flex items-center gap-1 text-[10px] font-mono font-bold">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Learn Time: Variable</span>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredSkills.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-8 text-center text-xs text-[#4E453F]/60 italic font-semibold"
              >
                No skill gaps identified.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODULE 4: Career Roadmap™ */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-rose-500 hover:-translate-y-[3px] transition-transform duration-200 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8]/60 pb-4 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-50 p-2 rounded-xl text-rose-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wider font-display">Career Roadmap™</h4>
              <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Chronologically sequenced steps to land the role</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
            Milestone Sequence
          </span>
        </div>

        {/* Timeline container */}
        <div className="relative pl-6 sm:pl-8 border-l border-[#E5E0D8]/80 space-y-8 my-2 max-w-2xl mx-auto">
          
          {/* Animated vertical gradient bar */}
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-rose-500 via-purple-500 to-[#10B981]" />

          {roadmapData.steps.map((step, idx) => {
            let badgeColor = "";
            let bulletColor = "";
            
            switch (step.timeframe) {
              case "Immediate Fixes":
                badgeColor = "bg-[#FEE2E2] text-[#991B1B]";
                bulletColor = "border-rose-500 bg-rose-500";
                break;
              case "This Week":
                badgeColor = "bg-[#FEF3C7] text-[#92400E]";
                bulletColor = "border-[#D97706] bg-[#D97706]";
                break;
              case "This Month":
                badgeColor = "bg-[#EDE9FE] text-[#7C3AED]";
                bulletColor = "border-purple-600 bg-purple-600";
                break;
              case "Next 90 Days":
                badgeColor = "bg-[#E0F2FE] text-[#0369A1]";
                bulletColor = "border-sky-600 bg-sky-600";
                break;
              case "Long-term":
                badgeColor = "bg-[#D1FAE5] text-[#065F46]";
                bulletColor = "border-[#10B981] bg-[#10B981]";
                break;
              default:
                badgeColor = "bg-[#F5F0E8] text-[#1C1008]";
                bulletColor = "border-[#1C1008] bg-[#1C1008]";
            }

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative space-y-2"
              >
                {/* Timeline Gaze Node Dot */}
                <span className={`absolute -left-[32px] sm:-left-[36px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 ${bulletColor} shadow-sm z-10`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}>
                    {step.timeframe}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#1C1008]/40">
                    Step {idx + 1}
                  </span>
                </div>
                
                <div 
                  onClick={() => setActiveDiagnosticDetail({
                    title: `Career Roadmap: ${step.title}`,
                    description: `Action items scheduled for: ${step.timeframe}`,
                    details: [
                      `Objective: ${step.title}`,
                      `Sequence step: ${idx + 1}`
                    ],
                    actionItems: [
                      step.description,
                      "Mark as in progress when complete."
                    ]
                  })}
                  className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 transition-all duration-200"
                >
                  <p className="text-sm font-extrabold text-[#1C1008] font-display">
                    {step.title}
                  </p>
                  <p className="text-xs text-[#4E453F] mt-1 leading-relaxed font-semibold">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODULE 5: Resume Competitiveness™ */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 premium-shadow border-l-4 border-l-[#1C1008] hover:-translate-y-[3px] transition-transform duration-200 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8]/60 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#F5F0E8] p-2 rounded-xl text-[#1C1008]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1C1008] uppercase tracking-wider font-display">Resume Competitiveness™</h4>
              <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Competency mapping against the ideal persona</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#1C1008]/60 bg-[#F5F0E8] px-2.5 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
            Radar Diagnostic
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Highlight Card: Overall Competitiveness */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 bg-[#1C1008] text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <p className="text-[10px] font-mono font-bold text-white/55 uppercase tracking-wider">
              Overall Index
            </p>
            
            <div className="relative h-[110px] w-[110px]">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Track circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="stroke-white/10 fill-none"
                  strokeWidth="8"
                />
                {/* Animated Fill circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="fill-none transition-all duration-[1500ms] ease-out stroke-[#D97706]"
                  strokeWidth="8"
                  strokeDasharray="326.7"
                  strokeDashoffset={animate ? (1 - competitivenessData.overall / 100) * 326.7 : 326.7}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-extrabold text-white">
                  {animate ? competitivenessData.overall : 0}
                </span>
                <span className="text-[9px] font-mono text-white/55 block font-bold">/100</span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Overall Competency
            </span>
          </div>

          {/* Detailed competencies progress list */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Competency Item 1: Technical */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Technical Skills Alignment Diagnostic",
                description: "Comparison of your technical stack keywords (languages, frameworks, tools) against the ideal target job description candidate profile.",
                details: [
                  `Competency Score: ${competitivenessData.technical_skills}%`
                ],
                actionItems: [
                  "Include more direct keyword references for missing skills in project details.",
                  "Practice mock coding drills for listed tech tags to prepare for technical screenings."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Technical Skills alignment</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.technical_skills}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.technical_skills}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 2: Leadership */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Leadership Presence Diagnostic",
                description: "How well your past project bullet points convey ownership, decision-making scale, and execution leadership.",
                details: [
                  `Competency Score: ${competitivenessData.leadership}%`
                ],
                actionItems: [
                  "Re-phrase passive descriptions to highlight leading cross-functional teams.",
                  "Add metrics-driven accomplishments showing scale and team growth."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Leadership Presence</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.leadership}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.leadership}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 3: Communication */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Communication Metrics Diagnostic",
                description: "Assesses the vocabulary clarity, grammatical elegance, and sentence flow of your resume description blocks.",
                details: [
                  `Competency Score: ${competitivenessData.communication}%`
                ],
                actionItems: [
                  "Simplify complex run-on sentences in your experience bullets.",
                  "Verify formatting alignment and clean presentation margins."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Communication metrics</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.communication}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.communication}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 4: Problem Solving */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Problem Solving Depth Diagnostic",
                description: "Audits your achievements to see if you explicitly define the complex challenges, engineering scale, and resolutions you deployed.",
                details: [
                  `Competency Score: ${competitivenessData.problem_solving}%`
                ],
                actionItems: [
                  "Use the STAR methodology to describe resolution actions in detail.",
                  "Highlight database bottlenecks or platform architectural optimizations."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Problem Solving depth</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.problem_solving}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.problem_solving}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 5: Business Understanding */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Business & Domain Acumen Diagnostic",
                description: "How well your experience bullets showcase alignment with business goals, cost optimization, or user monetization metrics.",
                details: [
                  `Competency Score: ${competitivenessData.business_understanding}%`
                ],
                actionItems: [
                  "Quantify business value impact (e.g. reduced infrastructure costs, increased click-through rate).",
                  "Explain the 'why' behind technical choices relative to product scale."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Business & Domain acumen</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.business_understanding}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.business_understanding}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 6: ATS Friendliness */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "ATS Parsing Friendliness Diagnostic",
                description: "Simulates parser parsing checks for non-standard fonts, nested columns, and layout tables.",
                details: [
                  `Competency Score: ${competitivenessData.ats_friendliness}%`
                ],
                actionItems: [
                  "Ensure layout uses single-column presentation.",
                  "Test document parsing compatibility in the ATS Sandbox Engine."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>ATS Parsing Friendliness</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.ats_friendliness}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.ats_friendliness}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

            {/* Competency Item 7: Recruiter Appeal */}
            <div 
              onClick={() => setActiveDiagnosticDetail({
                title: "Recruiter Visual Appeal Diagnostic",
                description: "Measures visual layout density, reading clarity, and first-fold structure highlights.",
                details: [
                  `Competency Score: ${competitivenessData.recruiter_appeal}%`
                ],
                actionItems: [
                  "Check attention scores in the Recruiter Intelligence Report.",
                  "Position high-impact achievements to be visible in the top fold."
                ]
              })}
              className="space-y-1.5 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3.5 rounded-xl cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              <div className="flex justify-between items-baseline text-xs font-bold text-[#1C1008]">
                <span>Recruiter Visual Appeal</span>
                <span className="font-mono text-[#D97706]">{competitivenessData.recruiter_appeal}%</span>
              </div>
              <div className="h-2.5 bg-[#F5F0E8] rounded-full overflow-hidden w-full border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animate ? `${competitivenessData.recruiter_appeal}%` : "0%" }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-[#1C1008] rounded-full"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <DiagnosticModal
        isOpen={!!activeDiagnosticDetail}
        onClose={() => setActiveDiagnosticDetail(null)}
        title={activeDiagnosticDetail?.title || ""}
        description={activeDiagnosticDetail?.description || ""}
        details={activeDiagnosticDetail?.details}
        actionItems={activeDiagnosticDetail?.actionItems}
      />
    </div>
  );
}
