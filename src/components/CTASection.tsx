import { ArrowRight, Sparkles, Check } from "lucide-react";
import { useState, FormEvent } from "react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Container with warm premium gradient */}
        <div className="bg-gradient-to-br from-[#1C1008] via-[#2E1608] to-[#1C1008] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl border border-[#3A2211]">

          {/* Decorative Warm glowing orbs */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#D97706]/20 blur-3xl opacity-50 pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-[#10B981]/10 blur-3xl opacity-30 pointer-events-none -translate-x-1/3 translate-y-1/3" />

          {/* Micro Grid Overlay inside CTA */}
          <div className="absolute inset-0 bg-[radial-gradient(#FAF8F5_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">

            {/* Sparkle Icon Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/20 border border-[#D97706]/30">
              <Sparkles className="h-4 w-4 text-[#D97706] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#FAF8F5]/90 tracking-widest uppercase">
                Ready to accelerate your career?
              </span>
            </div>

            {/* Bold Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[#FAF8F5] leading-tight">
              Beat the bots today. <br className="hidden sm:inline" />
              Land your interview tomorrow.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#FAF8F5]/75 max-w-xl mx-auto font-sans leading-relaxed">
              Stop throwing resumes into the black hole of online applications. Scan your file against our AI, optimize it in seconds, and force hiring managers to take notice.
            </p>

            {/* Email Form / CTA Actions */}
            <div className="max-w-md mx-auto">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for a free ATS audit"
                    required
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-[#FAF8F5] placeholder-white/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] font-medium"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-[#FAF8F5] text-[#1C1008] hover:bg-[#FAF8F5]/90 active:scale-98 text-sm font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Get Free Audit</span>
                    <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-emerald-100 text-xs font-semibold flex items-center justify-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-[#10B981]/25 flex items-center justify-center text-[#10B981] shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                  </div>
                  <span>Awesome! Check your inbox for your customized ATS cheat sheet & free template.</span>
                </div>
              )}
            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-semibold text-[#FAF8F5]/60 font-mono tracking-wide">
              <span className="flex items-center gap-1.5">✓ No credit card required</span>
              <span className="flex items-center gap-1.5">✓ Scans standard PDF & Docx</span>
              <span className="flex items-center gap-1.5">✓ 100% private and GDPR compliant</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
