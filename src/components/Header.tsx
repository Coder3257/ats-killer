import { ShieldCheck, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import posthog from 'posthog-js';

interface HeaderProps {
  onAuthClick?: () => void;
  inDashboard?: boolean;
  onDashboardClick?: () => void;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export default function Header({ onAuthClick, inDashboard, onDashboardClick, onNavigate, currentPath }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-[#F5F0E8] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              if (onNavigate && currentPath !== "/") {
                onNavigate("/");
                // Track home tab
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'home' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for home:', err);
                }
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="bg-[#1C1008] text-[#FAF8F5] p-2 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-[#1C1008]">
                ATS<span className="text-[#D97706]">Killer</span>
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-mono bg-[#D97706]/10 text-[#D97706] rounded-full font-bold">
                AI Beta
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1C1008]/80">
            <button
              onClick={() => {
                handleScroll("features");
                // Track features tab
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'features' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for features:', err);
                }
              }}
              className="hover:text-[#D97706] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                handleScroll("demo");
                // Track demo tab
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'demo' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for demo:', err);
                }
              }}
              className="hover:text-[#D97706] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Interactive Demo
              <span className="bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 text-[9px] font-mono rounded font-bold">Try Now</span>
            </button>
            <button
              onClick={() => {
                handleScroll("pricing");
                // Track pricing tab
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'pricing' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for pricing:', err);
                }
              }}
              className="hover:text-[#D97706] transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                handleScroll("faq");
                // Track faq tab
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'faq' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for faq:', err);
                }
              }}
              className="hover:text-[#D97706] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                if (inDashboard) {
                  if (onDashboardClick) onDashboardClick();
                  // Track dashboard tab
                  try {
                    if (typeof window !== 'undefined') {
                      posthog.capture('tab_switched', { tab: 'dashboard' });
                    }
                  } catch (err) {
                    console.warn('Failed to track tab_switched event for dashboard:', err);
                  }
                } else {
                  if (onAuthClick) onAuthClick();
                  // Track login tab
                  try {
                    if (typeof window !== 'undefined') {
                      posthog.capture('tab_switched', { tab: 'login' });
                    }
                  } catch (err) {
                    console.warn('Failed to track tab_switched event for login:', err);
                  }
                }
              }}
              className="text-xs font-bold text-[#1C1008] hover:text-[#D97706] cursor-pointer transition-colors"
            >
              {inDashboard ? "Go to Dashboard" : "Sign In"}
            </button>
            <button
              onClick={() => {
                handleScroll("demo");
                // Track demo tab (from CTA)
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'demo_cta' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for demo_cta:', err);
                }
              }}
              className="px-5 py-2.5 bg-[#1C1008] text-[#FAF8F5] text-xs font-bold rounded-full hover:bg-[#1C1008]/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer group"
            >
              Scan Your Resume
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1008] hover:text-[#D97706] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen ? (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#FAF8F5] border-b border-[#F5F0E8] py-4 px-6 shadow-lg animate-fadeIn max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-4 text-base font-semibold text-[#1C1008]">
            <button
              onClick={() => {
                handleScroll("features");
                // Track features tab from mobile
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'features_mobile' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for features_mobile:', err);
                }
              }}
              className="text-left py-2 hover:text-[#D97706] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                handleScroll("demo");
                // Track demo tab from mobile
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'demo_mobile' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for demo_mobile:', err);
                }
              }}
              className="text-left py-2 hover:text-[#D97706] transition-colors"
            >
              <span>Interactive Demo</span>
              <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 text-[10px] font-mono rounded font-bold">Try Now</span>
            </button>
            <button
              onClick={() => {
                handleScroll("pricing");
                // Track pricing tab from mobile
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'pricing_mobile' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for pricing_mobile:', err);
                }
              }}
              className="text-left py-2 hover:text-[#D97706] transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                handleScroll("faq");
                // Track faq tab from mobile
                try {
                  if (typeof window !== 'undefined') {
                    posthog.capture('tab_switched', { tab: 'faq_mobile' });
                  }
                } catch (err) {
                  console.warn('Failed to track tab_switched event for faq_mobile:', err);
                }
              }}
              className="text-left py-2 hover:text-[#D97706] transition-colors"
            >
              FAQ
            </button>
            <div className="pt-4 border-t border-[#F5F0E8] mt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (inDashboard) {
                    if (onDashboardClick) onDashboardClick();
                    // Track dashboard tab from mobile menu
                    try {
                      if (typeof window !== 'undefined') {
                        posthog.capture('tab_switched', { tab: 'dashboard_mobile' });
                      }
                    } catch (err) {
                      console.warn('Failed to track tab_switched event for dashboard_mobile:', err);
                    }
                  } else {
                    if (onAuthClick) onAuthClick();
                    // Track login tab from mobile menu
                    try {
                      if (typeof window !== 'undefined') {
                        posthog.capture('tab_switched', { tab: 'login_middle' });
                      }
                    } catch (err) {
                      console.warn('Failed to track tab_switched event for login_mobile:', err);
                    }
                  }
                }}
                className="w-full py-2.5 text-center font-bold text-sm text-[#1C1008] border border-[#1C1008]/10 rounded-xl hover:bg-[#1C1008]/5 transition-colors cursor-pointer"
              >
                {inDashboard ? "Go to Dashboard" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleScroll("demo");
                  // Track demo tab from mobile menu
                  try {
                    if (typeof window !== 'undefined') {
                      posthog.capture('tab_switched', { tab: 'demo_mobile' });
                    }
                  } catch (err) {
                    console.warn('Failed to track tab_switched event for demo_mobile (from menu):', err);
                  }
                }}
                className="w-full py-3 bg-[#1C1008] text-[#FAF8F5] text-center font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                Scan Your Resume
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}