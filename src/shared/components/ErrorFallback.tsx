import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export function ErrorFallback() {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 max-w-md w-full shadow-lg space-y-6">
        <div className="mx-auto bg-rose-50 border border-rose-100 p-3 rounded-full text-rose-600 w-fit">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold font-display text-[#1C1008]">Something went wrong</h3>
          <p className="text-xs text-[#4E453F] leading-relaxed">
            An unexpected error occurred. Sentry error tracking has captured this exception. You can refresh the view to restore stability.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reload Application</span>
        </button>
      </div>
    </div>
  );
}

export default ErrorFallback;
