import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import AuthScreen from "./components/AuthScreen";
import { useAuth } from "./shared/contexts/AuthContext";
import { useToast } from "./shared/contexts/ToastContext";
import LoadingSequence from "./components/LoadingSequence";

const Analyzer = lazy(() => import("./components/Analyzer"));
const Pricing = lazy(() => import("./components/Pricing"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const FloatingToolkit = lazy(() => import("./components/FloatingToolkit"));

const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md mx-auto">
        <LoadingSequence steps={["Loading..."]} />
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inDashboard, setInDashboard] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const prevUserRef = useRef<typeof user>(undefined);

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

  // Restore dashboard view if user is logged in; detect session expiry
  useEffect(() => {
    const wasLoggedIn = prevUserRef.current !== undefined && prevUserRef.current !== null;
    const isNowLoggedOut = !user;

    if (user) {
      setInDashboard(true);
    } else {
      // If user was previously logged in but now is null, it's a session expiry
      if (wasLoggedIn && isNowLoggedOut) {
        showToast("Session expired, please log in again", "error");
        setIsAuthOpen(true);
      }
      setInDashboard(false);
    }

    prevUserRef.current = user;
  }, [user, showToast]);

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
        <Suspense fallback={<div className="py-12 text-center max-w-md mx-auto"><LoadingSequence steps={["Loading..."]} /></div>}>
          <Analyzer onAuthRequired={() => setIsAuthOpen(true)} />
        </Suspense>

        <Testimonials />
        <Suspense fallback={<div className="py-12 text-center max-w-md mx-auto"><LoadingSequence steps={["Loading..."]} /></div>}>
          <Pricing />
        </Suspense>
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