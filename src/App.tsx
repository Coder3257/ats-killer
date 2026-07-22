import React, { useState, useEffect, Suspense, lazy } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Analyzer from "./components/Analyzer";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import { useAuth } from "./shared/contexts/AuthContext";

const AuthScreen = lazy(() => import("./components/AuthScreen"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const FloatingToolkit = lazy(() => import("./components/FloatingToolkit"));

const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="space-y-4">
        <div className="h-8 w-8 border-4 border-[#D97706]/40 border-t-[#D97706] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#4E453F] font-mono font-bold uppercase tracking-wider animate-pulse">
          Loading Premium Workspace...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inDashboard, setInDashboard] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Restore dashboard view if user is logged in
  useEffect(() => {
    if (user) {
      setInDashboard(true);
    } else {
      setInDashboard(false);
    }
  }, [user]);

  if (authLoading) {
    return <LoadingFallback />;
  }

  // Handle routing to legal pages
  if (currentPath === "/terms") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <TermsOfService onNavigate={navigateTo} />
      </Suspense>
    );
  }
  if (currentPath === "/privacy") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PrivacyPolicy onNavigate={navigateTo} />
      </Suspense>
    );
  }
  if (currentPath === "/refund") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <RefundPolicy onNavigate={navigateTo} />
      </Suspense>
    );
  }

  if (inDashboard) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <DashboardLayout onLogout={() => setInDashboard(false)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1008] font-sans antialiased selection:bg-[#D97706]/20 selection:text-[#1C1008]">

      <Header 
        onAuthClick={() => setIsAuthOpen(true)}
        inDashboard={!!user}
        onDashboardClick={() => setInDashboard(true)}
        onNavigate={navigateTo}
        currentPath={currentPath}
      />

      <main className="pt-16 sm:pt-20">
        <Hero />
        <Features />

        {/* REAL AI Analyzer — replaces fake LiveDemo */}
        <Analyzer onAuthRequired={() => setIsAuthOpen(true)} />

        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>

      <Footer onNavigate={navigateTo} />

      {isAuthOpen && (
        <Suspense fallback={null}>
          <AuthScreen 
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => {
              setIsAuthOpen(false);
              setInDashboard(true);
            }}
          />
        </Suspense>
      )}

      {/* Show FloatingToolkit on landing page as well so users can try the AI tools directly */}
      <Suspense fallback={null}>
        <FloatingToolkit 
          onAnalysisSuccess={() => {
            window.location.reload();
          }} 
          setActiveTab={() => {
            setIsAuthOpen(true);
          }} 
        />
      </Suspense>
    </div>
  );
}