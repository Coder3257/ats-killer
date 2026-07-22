import React, { createContext, useContext, useState, useEffect } from "react";
import { X, WifiOff, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Monitor offline/online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast("Network connection restored.", "success");
    };

    const handleOffline = () => {
      setIsOffline(true);
      showToast("You are currently offline. Check your internet connection.", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}

      {/* OFFLINE FLOATING WARNING BANNER */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
          <WifiOff className="h-4 w-4 text-amber-600 animate-pulse" />
          <span>Offline Mode Enabled</span>
        </div>
      )}

      {/* TOAST LIST RENDER CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start justify-between gap-3 text-xs font-semibold transform translate-y-0 transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-stone-50 border-stone-200 text-stone-950"
            }`}
          >
            <div className="flex gap-2">
              {toast.type === "error" && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
