import { ArrowRight, AlertTriangle, CheckCircle, Sparkles, Trophy, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const [score, setScore] = useState(73);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [keywordCount, setKeywordCount] = useState(8);

  const handleScrollToDemo = () => {
    const demoElement = document.getElementById("analyzer");
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const startHeroOptimization = () => {
    if (optimized || isOptimizing) return;
    setIsOptimizing(true);
    
    // Animate score from 73 to 96
    let currentScore = 73;
    const interval = setInterval(() => {
      currentScore += 1;
      setScore(currentScore);
      if (currentScore >= 96) {
        clearInterval(interval);
        setIsOptimizing(false);
        setOptimized(true);
        setKeywordCount(17);
      }
    }, 45);
  };

  const resetHeroWidget = () => {
    setScore(73);
    setOptimized(false);
    setKeywordCount(8);
  };

  // SVG parameters for circular meter
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#FAF8F5]">
      
      {/* Decorative Warm Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#F5F0E8] blur-3xl opacity-60 -z-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] rounded-full bg-[#D97706]/5 blur-3xl opacity-40 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Confident Headline & Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Social Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#D97706] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-[#D97706] tracking-wide uppercase">
                Now Powered by AI 1.5 Pro
              </span>
            </div>

            {/* Display Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-[#1C1008] leading-[1.05]">
                Beat the bots. <br />
                <span className="text-[#D97706] relative inline-block">
                  Land the job.
                  <span className="absolute left-0 bottom-1.5 w-full h-1 bg-[#D97706]/20 rounded-full" />
                </span>
              </h1>
              
              <div className="space-y-3 max-w-xl pt-2">
                <h2 className="text-xl font-display font-extrabold text-[#1C1008] leading-snug">
                  Ever wonder why you never hear back?
                </h2>
                <p className="text-sm md:text-base text-[#1C1008]/75 font-sans leading-relaxed">
                  Your resume isn't bad — it's invisible. 75% of resumes never even reach a human, filtered out by ATS (Applicant Tracking System) bots that are supposed to help hiring. ATS Killer shows you exactly why: your real compatibility score, the line-by-line reasons you're getting ghosted, and the fastest fixes to flip it — before you hit submit again.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleScrollToDemo}
                className="px-8 py-4 bg-[#1C1008] text-[#FAF8F5] font-bold rounded-full hover:bg-[#1C1008]/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3.5 cursor-pointer group text-base"
              >
                Start Free Analysis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  const pricingElement = document.getElementById("pricing");
                  if (pricingElement) pricingElement.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-transparent text-[#1C1008] border border-[#1C1008]/20 font-semibold rounded-full hover:bg-[#F5F0E8] transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                View Plans
              </button>
            </div>

            {/* Simple stats strip */}
            <div className="pt-6 border-t border-[#F5F0E8] grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="text-3xl font-display font-bold text-[#1C1008]">98.2%</p>
                <p className="text-xs font-medium text-[#1C1008]/60 mt-1 uppercase tracking-wider">ATS Pass Rate</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-[#1C1008]">3.4x</p>
                <p className="text-xs font-medium text-[#1C1008]/60 mt-1 uppercase tracking-wider">More Interviews</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-[#1C1008]">120k+</p>
                <p className="text-xs font-medium text-[#1C1008]/60 mt-1 uppercase tracking-wider">Jobs Landed</p>
              </div>
            </div>

          </div>

          {/* Right Side: High-fidelity ATS Score Card Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[400px] bg-[#F5F0E8] p-6 rounded-3xl border border-[#EBE3D5] shadow-xl hover:shadow-2xl transition-all duration-300 relative group">
              
              {/* Badge Overlay */}
              <div className="absolute top-4 right-4 z-10">
                {optimized ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-xs animate-bounce">
                    ATS PASSED (96%) ✅
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 shadow-xs">
                    ATS REJECTED (73%) ❌
                  </span>
                )}
              </div>

              {/* Header inside Card */}
              <div className="border-b border-[#E5DEC9] pb-4 mb-5">
                <span className="text-[11px] font-mono font-bold text-[#1C1008]/50 uppercase tracking-widest">Live ATS Assessment</span>
                <h3 className="font-display font-bold text-[#1C1008] text-lg mt-0.5">Senior Frontend Engineer</h3>
                <p className="text-xs text-[#1C1008]/60 font-medium">Target Company: Stripe, Inc.</p>
              </div>

              {/* Circular Meter Area */}
              <div className="flex flex-col items-center justify-center py-4 bg-[#FAF8F5]/80 rounded-2xl border border-[#E5DEC9]/50 mb-5 relative overflow-hidden">
                
                {/* Micro Ambient Background Lines inside Meter */}
                <div className="absolute inset-0 bg-[radial-gradient(#1C1008_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

                <div className="relative h-32 w-32 flex items-center justify-center">
                  
                  {/* Gauge SVG */}
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="stroke-[#EBE3D5]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke={optimized ? "#10B981" : (score > 85 ? "#D97706" : "#EF4444")}
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  
                  {/* Text score overlay */}
                  <div className="absolute text-center">
                    <span className="text-4xl font-display font-extrabold text-[#1C1008]">
                      {score}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1C1008]/50 block">/100</span>
                  </div>

                </div>

                {/* Score Tagline */}
                <p className="text-xs font-semibold mt-4 text-[#1C1008]/80 flex items-center gap-1.5">
                  {score < 80 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-[#EF4444] stroke-[2.5]" />
                      <span>Scores below <strong className="text-[#EF4444]">85%</strong> rarely get reviewed</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-[#10B981] stroke-[2.5]" />
                      <span className="text-[#10B981] font-bold">Outstanding match score!</span>
                    </>
                  )}
                </p>

              </div>

              {/* Keyword Matcher Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#1C1008]/70">Matched High-Priority Keywords</span>
                  <span className="font-mono text-[#1C1008]">{keywordCount} of 18</span>
                </div>
                
                {/* Progress Bar Container */}
                <div className="h-2.5 w-full bg-[#E5DEC9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D97706] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(keywordCount / 18) * 100}%` }}
                  />
                </div>

                {/* Micro keyword bubbles */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    TypeScript ✓
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    React ✓
                  </span>
                  
                  {!optimized ? (
                    <>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 animate-pulse">
                        CI/CD Pipelines ✗
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 animate-pulse">
                        Unit Testing ✗
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        CI/CD Pipelines ✓
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        Unit Testing ✓
                      </span>
                    </>
                  )}
                </div>

              </div>

              {/* Action Button inside widget */}
              {!optimized ? (
                <button
                  onClick={startHeroOptimization}
                  disabled={isOptimizing}
                  className="w-full py-3.5 bg-[#1C1008] text-[#FAF8F5] text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1C1008]/90 active:scale-98 transition-all shadow-md group cursor-pointer"
                >
                  {isOptimizing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#FAF8F5] border-t-transparent" />
                      <span>Optimizing resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4.5 w-4.5 text-[#D97706] animate-pulse" />
                      <span>Instant 1-Click Optimize</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={resetHeroWidget}
                    className="flex-1 py-3 bg-transparent border border-[#1C1008]/20 text-[#1C1008]/70 text-xs font-semibold rounded-2xl hover:bg-[#FAF8F5] transition-all cursor-pointer text-center"
                  >
                    Reset Widget
                  </button>
                  <button
                    onClick={handleScrollToDemo}
                    className="flex-2 py-3 bg-[#10B981] text-[#FAF8F5] text-xs font-bold rounded-2xl hover:bg-[#10B981]/90 transition-all shadow-sm text-center cursor-pointer"
                  >
                    View Interactive Demo
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
