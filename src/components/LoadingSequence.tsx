import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-[#FAF8F5]/80 border border-[#E5E0D8]/60 rounded-2xl max-w-sm mx-auto shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4.5 w-4.5 animate-spin text-[#D97706]" />
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
