import { Shield, Key, Sparkles, ArrowRight, X } from "lucide-react";
import { ReactNode, useState } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  badge?: string;
  description: string;
  bullets: string[];
  onClick: () => void;
}

function FeatureCard({ icon, title, badge, description, bullets, onClick }: FeatureCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#F5F0E8] border border-[#EBE3D5] p-5 sm:p-8 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Icon & Badge Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 bg-[#FAF8F5] text-[#1C1008] rounded-2xl shadow-xs border border-[#E5DEC9] group-hover:bg-[#1C1008] group-hover:text-[#FAF8F5] group-hover:border-transparent transition-all duration-300">
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D97706]/15 text-[#D97706] rounded-full border border-[#D97706]/20">
              {badge}
            </span>
          )}
        </div>

        {/* Feature Title */}
        <h3 className="text-xl font-display font-bold text-[#1C1008] mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#1C1008]/75 mb-6 leading-relaxed font-sans">
          {description}
        </p>

        {/* Feature Details List */}
        <ul className="space-y-2.5 mb-8">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-[#1C1008]/80 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Learn More link */}
      <div className="pt-4 border-t border-[#E5DEC9]/50 flex items-center justify-between text-xs font-bold text-[#1C1008] hover:text-[#D97706] transition-colors group/link">
        <span>See details</span>
        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const featuresData = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "ATS Score Analysis",
      badge: "Diagnostic",
      tagline: "Ensure your layout is machine-readable and highly optimized.",
      description: "Our advanced parser mimics popular Enterprise ATS algorithms (Workday, Taleo, Greenhouse) to extract and grade your resume structure, layouts, and density.",
      bullets: [
        "Calculates precise multi-factor match percentage",
        "Audits resume document format & parseability",
        "Checks font sizes, tables, and column structure rules",
        "Identifies passive action verbs and weak wording"
      ],
      narrative: "Most Enterprise ATS systems (Workday, Taleo, Greenhouse, iCIMS) do not look at your resume like a human. They strip layout elements and convert the file to raw text. If you have nested columns, tables, headers, footers, or non-standard fonts, the parser fails to read your experience. Our simulator analyzes these structural barriers to guarantee readability.",
      mockUi: (
        <div className="bg-[#1C1008] text-white p-4.5 rounded-2xl font-mono text-[11px] space-y-3 shadow-md">
          <div className="flex justify-between border-b border-white/10 pb-1.5 text-stone-400 font-bold">
            <span>ATS PARSER CRITERIA</span>
            <span className="text-[#D97706]">98/100 EXCELLENT</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>File Format Compatibility:</span>
              <span className="text-emerald-400 font-bold">PDF (Clean)</span>
            </div>
            <div className="flex justify-between">
              <span>Columns & Layout Readability:</span>
              <span className="text-emerald-400 font-bold">Single-Column (Pass)</span>
            </div>
            <div className="flex justify-between">
              <span>Font Readability Scan:</span>
              <span className="text-emerald-400 font-bold">Inter / Sans-Serif (Pass)</span>
            </div>
            <div className="flex justify-between">
              <span>Weak Action Verbs Flagged:</span>
              <span className="text-amber-400 font-bold">2 Found (Needs Action)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Keyword Matcher",
      badge: "Real-time",
      tagline: "Detect priority gaps between your profile and job description.",
      description: "Extracts high-priority keywords directly from the target job description and highlights exactly which keywords are present or missing from your file.",
      bullets: [
        "Highlights matched keywords in green, missing in red",
        "Classifies items by Technical, Tools, and Soft Skills",
        "Measures match density to prevent keyword stuffing penalties",
        "Provides precise reasons why each keyword is demanded"
      ],
      narrative: "Recruiters define target checklists of required tools, technical certifications, and core competencies. If your resume does not hit the minimum keyword density threshold, it gets automatically flagged as incompatible. Our Keyword Matcher runs a real-time semantic analysis to identify matching and missing entities.",
      mockUi: (
        <div className="bg-white border border-[#E5E0D8] p-4.5 rounded-2xl space-y-3 shadow-xs">
          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold tracking-wider">Semantic Gaps Checklist</span>
          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">✓ React (Matched)</span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">✓ TypeScript (Matched)</span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">✓ Node.js (Matched)</span>
            <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">✗ AWS Cloud (Missing)</span>
            <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">✗ Docker (Missing)</span>
          </div>
        </div>
      )
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Resume Rewriter",
      badge: "AI Powered",
      tagline: "Convert abstract descriptions into metrics-driven achievements.",
      description: "No more staring at a blank screen. Our contextual AI instantly rewrites your bullet points to naturally weave in missing keywords while preserving your actual experiences.",
      bullets: [
        "Weaves missing keywords naturally into experience bullets",
        "Replaces weak verbs with high-impact action vocabulary",
        "Formulates achievement-focused bullet points with metric templates",
        "Maintains professional formatting and grammatical excellence"
      ],
      narrative: "Do not just list keywords. Simply writing 'AWS Cloud' in your skills list is not enough to pass recruiter screens. The rewriter weaves keywords naturally into your bullet points, demonstrating how you used that skill to drive business impact, scale platforms, or optimize efficiency.",
      mockUi: (
        <div className="space-y-2.5">
          <div className="p-3 bg-white border border-[#E5E0D8]/60 rounded-xl">
            <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold mb-1">Original Bullet</span>
            <p className="text-xs text-[#1C1008] italic">"Managed backend hosting and cloud infrastructure."</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#D97706] text-white text-[8px] font-mono px-2 py-0.5 rounded-bl uppercase font-bold tracking-wider">Suggested Rewrite</div>
            <span className="text-[9px] font-mono text-[#D97706] block uppercase font-bold mb-1">Optimized Bullet</span>
            <p className="text-xs text-[#1C1008] font-semibold">"Architected and deployed scalable backend cloud solutions on <strong className="text-[#D97706]">AWS Cloud</strong> using <strong className="text-[#D97706]">Docker</strong>, improving server infrastructure resilience by 35%."</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#FAF8F5] border-t border-b border-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
            Designed for results
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Beating ATS algorithms shouldn't be a full-time job.
          </h2>
          <p className="text-sm text-[#1C1008]/70 font-medium">
            ATS Killer automates complex resume tailoring in three simple pillars, keeping your presentation professional and clean.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((f, index) => (
            <FeatureCard
              key={index}
              icon={f.icon}
              title={f.title}
              badge={f.badge}
              description={f.description}
              bullets={f.bullets}
              onClick={() => setActiveFeature(index)}
            />
          ))}
        </div>

      </div>

      {/* DETAILED DIALOG MODAL */}
      {activeFeature !== null && (
        <div className="fixed inset-0 bg-[#1C1008]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#EBE3D5] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleIn select-none">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveFeature(null)}
              className="absolute top-5 right-5 p-1.5 bg-white hover:bg-stone-100 border border-[#E5E0D8] rounded-full text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-[#1C1008] text-[#FAF8F5] rounded-2xl shadow-md">
                {featuresData[activeFeature].icon}
              </div>
              <div className="space-y-1 pr-6">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D97706] bg-[#D97706]/10 px-2.5 py-0.5 rounded">
                  {featuresData[activeFeature].badge}
                </span>
                <h4 className="text-xl font-display font-extrabold text-[#1C1008]">
                  {featuresData[activeFeature].title}
                </h4>
                <p className="text-[11px] font-semibold text-stone-400 italic">
                  {featuresData[activeFeature].tagline}
                </p>
              </div>
            </div>

            {/* Narrative */}
            <p className="text-xs text-[#1C1008]/80 leading-relaxed font-medium">
              {featuresData[activeFeature].narrative}
            </p>

            {/* Visual Mock Showcase */}
            <div className="pt-2">
              {featuresData[activeFeature].mockUi}
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setActiveFeature(null);
                setTimeout(() => {
                  const element = document.getElementById("demo");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              className="w-full py-3.5 bg-[#1C1008] text-white hover:bg-[#1C1008]/90 transition-colors rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Try this tool in the Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
