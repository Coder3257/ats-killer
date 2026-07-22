import { useState, useEffect } from "react";
import { RESUME_TEMPLATES } from "../data/templates";
import { Keyword, FeedbackCardType, ResumeTemplate } from "../types";
import { Sparkles, RefreshCw, Check, AlertCircle, FileText, Plus, HelpCircle, Info, CheckCircle2, User, ChevronRight } from "lucide-react";

export default function LiveDemo() {
  const [activeTab, setActiveTab] = useState<string>("swe");
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  
  // Active template state
  const template = RESUME_TEMPLATES.find((t) => t.id === activeTab) || RESUME_TEMPLATES[0];

  // Reset optimization state when changing templates
  useEffect(() => {
    setIsOptimized(false);
  }, [activeTab]);

  // Handle auto-optimization trigger
  const handleOptimizeAll = () => {
    if (isOptimized || isRewriting) return;
    setIsRewriting(true);
    setTimeout(() => {
      setIsOptimized(true);
      setIsRewriting(false);
    }, 1200);
  };

  // Toggle single missing keyword
  const handleToggleKeyword = (keywordWord: string) => {
    if (isOptimized) return;
    // For single keyword toggle, let's just optimize the whole thing as a simpler, clean user feedback loop
    handleOptimizeAll();
  };

  const handleReset = () => {
    setIsOptimized(false);
  };

  // Calculate dynamic current score based on state
  const currentScore = isOptimized ? 95 : template.originalScore;

  // Render original or optimized resume bullets
  const getBullets = (expIndex: number) => {
    const originalBullets = template.experience[expIndex].bullets;
    
    if (!isOptimized) {
      return originalBullets.map((bullet, idx) => {
        // Let's highlight present keywords in original text if any
        let highlighted = bullet;
        return (
          <span key={idx} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            {bullet}
          </span>
        );
      });
    }

    // Return optimized bullets with keywords integrated and highlighted
    if (activeTab === "swe") {
      if (expIndex === 0) {
        return [
          <span key={0} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Engineered robust web interfaces using React, Tailwind CSS, and <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">TypeScript</span>, incorporating <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Performance Optimization</span> patterns to slash page load times by 20%.
          </span>,
          <span key={1} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Integrated secure billing systems using Redux <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">State Management</span> and automated <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">CI/CD Pipelines</span> via GitHub Actions.
          </span>,
          <span key={2} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Developed automated release scripts and implemented robust Jest <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Unit Testing (Jest)</span> protocols in high-volume, modern browser applications.
          </span>
        ];
      } else {
        return [
          <span key={0} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Maintained high-availability customer-facing dashboard matching complex telemetry metrics in mock <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Distributed Systems</span> environments.
          </span>,
          <span key={1} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Fixed core styling bugs and improved layout stability based on high-fidelity designs.
          </span>
        ];
      }
    } else if (activeTab === "pm") {
      if (expIndex === 0) {
        return [
          <span key={0} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Synthesized requirements from 20+ corporate clients to define product specs and a long-term <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Product Strategy</span>.
          </span>,
          <span key={1} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Directed <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Agile Roadmaps</span>, sprints, and retrospectives, boosting team shipping velocity by 15%.
          </span>,
          <span key={2} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Spearheaded high-impact <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">A/B Testing</span> on comment widgets, satisfying creator <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">User Personas</span> and improving post-signup retention.
          </span>
        ];
      } else {
        return [
          <span key={0} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Analyzed user traffic and click events, optimizing monetization funnels and analyzing key SaaS metrics like <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">CAC/LTV Metrics</span>.
          </span>,
          <span key={1} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Delivered data-driven strategic reports for quarterly executive leadership meetings.
          </span>
        ];
      }
    } else { // Marketing
      if (expIndex === 0) {
        return [
          <span key={0} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Created and optimized high-intent ad campaign sequences on Meta and Instagram, significantly reducing <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">CAC (Customer Acquisition Cost)</span>.
          </span>,
          <span key={1} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Engineered scalable organic search content using modern <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">SEO Optimization</span> strategies, gaining 5,000+ targeted organic leads.
          </span>,
          <span key={2} className="block text-[#1C1008]/85 text-xs font-sans leading-relaxed">
            Managed influencer partnerships and scaled marketing spend across <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Paid Ads (Meta/Google)</span> and organic handles with <span className="bg-[#10B981]/15 text-[#047857] px-1 py-0.5 rounded font-bold border border-[#10B981]/30">Google Analytics</span> monitoring.
          </span>
        ];
      }
    }
    return originalBullets.map((b, i) => <span key={i}>{b}</span>);
  };

  return (
    <section id="demo" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      
      {/* Visual Accent Gradients */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-[#1C1008]/5 blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#D97706]/5 blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#D97706]/10 px-3 py-1 rounded-full border border-[#D97706]/20 inline-block">
            Interactive Simulator
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Test drive the AI. See the match live.
          </h2>
          <p className="text-sm sm:text-base text-[#1C1008]/70 max-w-xl mx-auto font-sans font-medium">
            Select a target profile below, examine the original resume gaps on the left, and click <strong className="text-[#D97706]">Optimize Resume</strong> to see how ATS Killer injects high-priority keywords.
          </p>
        </div>

        {/* Role Selectors Slider */}
        <div className="flex items-center justify-center gap-3.5 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "swe", label: "Software Engineer", company: "Stripe" },
            { id: "pm", label: "Product Manager", company: "Notion" },
            { id: "marketing", label: "Growth Marketer", company: "Airbnb" },
          ].map((roleTab) => (
            <button
              key={roleTab.id}
              onClick={() => setActiveTab(roleTab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                activeTab === roleTab.id
                  ? "bg-[#1C1008] text-[#FAF8F5] border-[#1C1008] shadow-md"
                  : "bg-[#F5F0E8] text-[#1C1008]/80 border-[#EBE3D5] hover:bg-[#EBE3D5]"
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>{roleTab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeTab === roleTab.id
                  ? "bg-[#D97706]/20 text-[#D97706]"
                  : "bg-[#1C1008]/10 text-[#1C1008]/60"
              }`}>
                @{roleTab.company}
              </span>
            </button>
          ))}
        </div>

        {/* Core Live Demo Simulator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Resume Sheet (Visual Simulation of Paper) */}
          <div className="lg:col-span-7 bg-white border border-[#EBE3D5] p-6 sm:p-10 rounded-3xl shadow-lg relative min-h-[580px] flex flex-col justify-between overflow-hidden">
            
            {/* Watermark/Grid Lines for premium feel */}
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-[#D97706] via-[#1C1008] to-[#10B981] opacity-80" />
            
            <div>
              {/* Paper Header */}
              <div className="flex justify-between items-start border-b border-[#F5F0E8] pb-6 mb-6 mt-2">
                <div>
                  <h4 className="text-xl sm:text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
                    {template.candidateName}
                  </h4>
                  <p className="text-xs font-medium text-[#1C1008]/60 mt-1 flex items-center gap-1.5 font-mono">
                    <span>Targeting:</span>
                    <span className="text-[#1C1008] font-bold">{template.targetJob}</span>
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE3D5] text-[10px] font-mono font-bold text-[#1C1008]/70 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-[#D97706]" />
                    <span>A4_Format.pdf</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1C1008]/40 mt-1">Edited live</span>
                </div>
              </div>

              {/* Summary Block */}
              <div className="mb-6 space-y-2">
                <h5 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#D97706]">
                  Professional Summary
                </h5>
                <p className="text-xs text-[#1C1008]/75 leading-relaxed font-sans">
                  {template.summary}
                </p>
              </div>

              {/* Experience Entries */}
              <div className="space-y-6">
                <h5 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#D97706] border-b border-[#F5F0E8] pb-1">
                  Professional Experience
                </h5>
                
                {template.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <h6 className="text-xs font-bold text-[#1C1008]">
                        {exp.role} <span className="text-[#1C1008]/50 font-normal">at</span> {exp.company}
                      </h6>
                      <span className="text-[10px] font-mono text-[#1C1008]/50 font-semibold">{exp.period}</span>
                    </div>

                    {/* Bullet list of experiences with tailored matching */}
                    <div className="space-y-2 pl-4 border-l-2 border-[#F5F0E8]">
                      {getBullets(expIdx)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Area */}
              <div className="mt-6 space-y-2">
                <h5 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#D97706] border-b border-[#F5F0E8] pb-1">
                  Core Skills & Frameworks
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {template.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-mono font-semibold bg-[#F5F0E8] text-[#1C1008]/80 px-2 py-1 rounded-md border border-[#EBE3D5]">
                      {skill}
                    </span>
                  ))}
                  {isOptimized && (
                    <>
                      {template.keywords.filter(kw => !kw.matched).map((kw, kwIdx) => (
                        <span key={kwIdx} className="text-[10px] font-mono font-bold bg-[#10B981]/10 text-[#047857] px-2 py-1 rounded-md border border-[#10B981]/30 animate-fadeIn">
                          {kw.word} +
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Resume optimization status bar */}
            <div className="mt-8 pt-4 border-t border-[#F5F0E8] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE3D5]/60">
              <div className="flex items-center gap-2.5">
                {isOptimized ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10B981] animate-ping" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                )}
                <span className="text-xs font-semibold text-[#1C1008]">
                  Status: {isOptimized ? (
                    <span className="text-[#10B981] font-bold">Matched with 100% of high-priority filters!</span>
                  ) : (
                    <span className="text-[#EF4444] font-bold">Failing 3 high-priority recruiter filters</span>
                  )}
                </span>
              </div>
              
              {isOptimized && (
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-[#1C1008]/50 hover:text-[#1C1008] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Demo
                </button>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: AI Gaps and Optimisation Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-time Score Diagnostic Card */}
            <div className="bg-[#F5F0E8] border border-[#EBE3D5] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-[#1C1008]/50 uppercase tracking-widest">Live Diagnostic Grade</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                  isOptimized ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30" : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                }`}>
                  {isOptimized ? "Excellent" : "Needs Optimization"}
                </span>
              </div>

              <div className="flex items-center gap-6 pb-4 border-b border-[#E5DEC9]">
                <div className="relative h-20 w-20 shrink-0 flex items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#E5DEC9] shadow-inner">
                  <div className="text-center">
                    <span className={`text-3xl font-display font-extrabold ${isOptimized ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {currentScore}
                    </span>
                    <span className="text-[10px] font-mono text-[#1C1008]/50 block">/100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1C1008]">
                    {isOptimized ? "ATS Optimised Resume" : "Original Resume Score"}
                  </p>
                  <p className="text-xs text-[#1C1008]/70 leading-relaxed">
                    {isOptimized 
                      ? "Your score easily clears the standard 85-point HR automatic sorting gate." 
                      : "Warning: Automatic ATS screening systems will likely dump this draft into archive lists."
                    }
                  </p>
                </div>
              </div>

              {/* Progress & CTAs */}
              <div className="pt-4 space-y-4">
                {!isOptimized ? (
                  <button
                    onClick={handleOptimizeAll}
                    disabled={isRewriting}
                    className="w-full py-3.5 bg-[#1C1008] hover:bg-[#1C1008]/90 text-[#FAF8F5] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {isRewriting ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Weaving Keywords via Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5 text-[#D97706]" />
                        <span>Rewrite bullets & match all ({template.keywords.filter(k => !k.matched).length} missing)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-[#10B981]/10 text-[#047857] p-3 rounded-xl border border-[#10B981]/25 text-xs font-semibold flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#10B981]" />
                    <div>
                      <p className="font-bold">Resume fully tailored!</p>
                      <p className="text-[#10B981]/80 mt-0.5 font-medium">Keywords are smoothly blended into active metrics bullets. Ready to submit.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Live Keywords Strip Panel */}
            <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-3xl p-6 shadow-sm space-y-4">
              <h5 className="text-sm font-bold text-[#1C1008] flex items-center justify-between">
                <span>Tailoring Keywords Index</span>
                <span className="text-[10px] font-mono text-[#1C1008]/50">Target: {template.targetJob.split("at")[1]}</span>
              </h5>

              {/* Keywords Checklist */}
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {template.keywords.map((kw, kwIdx) => {
                  const matchedState = kw.matched || isOptimized;
                  return (
                    <div
                      key={kwIdx}
                      onClick={() => handleToggleKeyword(kw.word)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        matchedState
                          ? "bg-[#10B981]/5 border-[#10B981]/20 text-[#047857]"
                          : "bg-[#EF4444]/5 border-[#EF4444]/20 text-[#B91C1C] hover:bg-[#EF4444]/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {matchedState ? (
                          <div className="h-5 w-5 rounded-md bg-[#10B981]/15 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-[#10B981] stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-md bg-[#EF4444]/15 flex items-center justify-center shrink-0">
                            <Plus className="h-3.5 w-3.5 text-[#EF4444] stroke-[3] animate-pulse" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{kw.word}</p>
                          <p className={`text-[10px] font-medium opacity-80`}>
                            {kw.category} • Importance: {kw.importance}
                          </p>
                        </div>
                      </div>
                      
                      {!matchedState && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono bg-[#EF4444]/10 text-[#EF4444]">
                          Click to inject
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic AI Suggestions Feedback Cards */}
            <div className="space-y-3">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1008]/50">
                AI Assistant Checklist ({isOptimized ? "0" : template.feedback.length} warnings)
              </h5>

              {!isOptimized ? (
                template.feedback.map((fb, fbIdx) => (
                  <div
                    key={fbIdx}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      fb.type === "critical"
                        ? "bg-red-50 border-[#EF4444]/30 text-red-950"
                        : fb.type === "warning"
                        ? "bg-amber-50 border-amber-600/20 text-amber-950"
                        : "bg-blue-50 border-blue-600/20 text-blue-950"
                    }`}
                  >
                    <div className="flex gap-2.5 items-start">
                      <AlertCircle className={`h-5 w-5 shrink-0 ${
                        fb.type === "critical" ? "text-[#EF4444]" : "text-[#D97706]"
                      }`} />
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold">{fb.title}</p>
                        <p className="text-[11px] opacity-80 leading-relaxed font-medium">{fb.description}</p>
                        
                        <div className="pt-2">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1C1008]/60">Suggested Fix:</p>
                          <p className="text-[11px] bg-white/60 p-2 rounded-lg border border-black/5 mt-1 font-mono italic font-medium leading-relaxed">
                            "{fb.fixSuggestion}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#10B981]/5 border border-[#10B981]/25 p-5 rounded-2xl text-center flex flex-col items-center justify-center space-y-2 py-8 animate-fadeIn">
                  <div className="h-10 w-10 rounded-full bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <h6 className="text-sm font-bold text-[#047857]">All Gaps Resolved!</h6>
                  <p className="text-xs text-[#047857]/80 max-w-xs leading-relaxed font-medium">
                    Your resume aligns beautifully with modern enterprise search indexes. Your candidacy is fully optimized.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
