import React, { useEffect, useState } from "react";

interface LoadingSequenceProps {
  steps: string[];
  intervalMs?: number;
  loop?: boolean;
}

export default function LoadingSequence({
  steps,
  intervalMs = 1200,
  loop = true,
}: LoadingSequenceProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (steps.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex + 1 >= steps.length) {
            return loop ? 0 : prevIndex;
          }
          return prevIndex + 1;
        });
        setFade(true);
      }, 200); // Wait for fade-out to complete before changing text
    }, intervalMs);

    return () => clearInterval(interval);
  }, [steps, intervalMs, loop]);

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-[#FAF8F5]/85 border border-[#E5E0D8]/60 rounded-2xl max-w-sm mx-auto shadow-sm backdrop-blur-sm relative overflow-hidden">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 12%; opacity: 0.3; }
          50% { top: 80%; opacity: 1; }
        }
      `}</style>

      {/* Sweeping Document Scanner Icon */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-[#1C1008] transition-colors duration-300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div 
          className="absolute left-1 right-1 h-0.5 bg-[#D97706] shadow-[0_0_6px_#D97706] rounded-full" 
          style={{ animation: 'scan 2.2s ease-in-out infinite' }} 
        />
      </div>

      <div className="flex items-center gap-2">
        <p
          className={`text-xs font-mono font-bold uppercase tracking-wider text-[#1C1008] transition-opacity duration-200 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {steps[currentStepIndex]}
        </p>
      </div>
      <div className="flex gap-1">
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentStepIndex ? "w-4 bg-[#D97706]" : "w-1 bg-[#E5E0D8]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
