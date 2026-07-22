import { ShieldCheck, Heart, Github, Linkedin, Twitter } from "lucide-react";

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#1C1008] text-[#FAF8F5]/80 py-16 border-t border-[#3A2211]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12 mb-10">
          
          {/* Brand block */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#FAF8F5] text-[#1C1008] p-1.5 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                ATS<span className="text-[#D97706]">Killer</span>
              </span>
            </div>
            
            <p className="text-xs text-[#FAF8F5]/60 leading-relaxed font-sans font-medium">
              Empowering job seekers to beat automated Applicant Tracking Systems, land interviews, and command maximum salaries. Crafted with modern AI.
            </p>

            <div className="flex gap-4 pt-1">
              <a href="#" className="text-[#FAF8F5]/50 hover:text-[#D97706] transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="text-[#FAF8F5]/50 hover:text-[#D97706] transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="text-[#FAF8F5]/50 hover:text-[#D97706] transition-colors"><Github className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => handleScroll("features")} className="hover:text-white transition-colors cursor-pointer text-left">
                  ATS Scoring Engine
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll("demo")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Keyword Tailor Tool
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll("demo")} className="hover:text-white transition-colors cursor-pointer text-left">
                  AI Bullets Rewriter
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll("pricing")} className="hover:text-white transition-colors cursor-pointer text-left">
                  SaaS Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#" className="hover:text-white transition-colors">ATS-Friendly PDF Templates</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Action Verbs Dictionary</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">System Design Resume Guide</a>
              </li>
              <li>
                <button onClick={() => handleScroll("faq")} className="hover:text-white transition-colors cursor-pointer text-left">
                  F.A.Q
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Localized */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
              Localised in India
            </h4>
            <p className="text-xs text-[#FAF8F5]/60 leading-relaxed font-sans font-medium">
              Secure payments powered by Stripe, accepting UPI, net banking, and Indian credit cards. Standard Pro and Lifetime tiers localized in INR.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 text-[#FAF8F5]/80 border border-white/10">
              🇮🇳 India Server Region
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-[#FAF8F5]/40 border-t border-white/5 pt-6">
          <p>© 2026 ATS Killer. All rights reserved.</p>
          <div className="flex gap-6">
            <button 
              onClick={() => onNavigate?.("/privacy")} 
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate?.("/terms")} 
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onNavigate?.("/refund")} 
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
            >
              Refund Guidelines
            </button>
          </div>
          <p className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>for job seekers worldwide</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
