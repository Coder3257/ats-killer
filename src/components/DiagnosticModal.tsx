import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface DiagnosticSection {
  title: string;
  items: string[];
  type?: "bullet" | "check" | "warning" | "info";
}

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string | React.ReactNode;
  details?: string[];
  actionItems?: string[];
  sections?: DiagnosticSection[];
}

export default function DiagnosticModal({
  isOpen,
  onClose,
  title,
  description,
  details,
  actionItems,
  sections,
}: DiagnosticModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#1C1008]/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white border border-[#E5E0D8] rounded-3xl p-6 max-w-lg w-full premium-shadow space-y-5 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <h4 className="text-sm font-extrabold text-[#1C1008] font-display">{title}</h4>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#1C1008] text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-[#4E453F] font-semibold leading-relaxed whitespace-pre-wrap">
                {description}
              </div>

              {details && details.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                    Diagnostic Metrics / Details
                  </span>
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 space-y-2">
                    {details.map((detail, idx) => (
                      <div key={idx} className="text-xs text-[#1C1008] leading-relaxed font-medium flex items-start gap-2">
                        <span className="text-[#D97706]">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionItems && actionItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#10B981] uppercase tracking-wider block">
                    Recommended Action Items
                  </span>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                    {actionItems.map((item, idx) => (
                      <div key={idx} className="text-xs text-stone-700 leading-relaxed font-semibold flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sections && sections.map((section, sIdx) => {
                let colorClass = "text-[#D97706]";
                let bgClass = "bg-[#FAF8F5] border-[#E5E0D8]/60";
                let icon = "•";

                if (section.type === "check") {
                  colorClass = "text-[#10B981]";
                  bgClass = "bg-emerald-50/50 border-emerald-100";
                  icon = "✓";
                } else if (section.type === "warning") {
                  colorClass = "text-[#EF4444]";
                  bgClass = "bg-red-50/50 border-red-100";
                  icon = "⚠";
                } else if (section.type === "info") {
                  colorClass = "text-[#3B82F6]";
                  bgClass = "bg-blue-50/50 border-blue-100";
                  icon = "ℹ";
                }

                return (
                  <div key={sIdx} className="space-y-2">
                    <span className={`text-[9px] font-mono font-bold ${colorClass} uppercase tracking-wider block`}>
                      {section.title}
                    </span>
                    <div className={`border rounded-2xl p-4 space-y-2 ${bgClass}`}>
                      {section.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-[#1C1008] leading-relaxed font-medium flex items-start gap-2">
                          <span className={colorClass}>{icon}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#1C1008] hover:bg-[#1C1008]/90 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
