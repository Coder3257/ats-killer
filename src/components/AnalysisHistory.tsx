import React, { useState, useEffect } from "react";
import { 
  History, 
  FileText, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Loader2, 
  Eye,
  CornerDownLeft
} from "lucide-react";
import { AnalysisRepository } from "../shared/repositories/AnalysisRepository";
import { useAuth } from "../shared/contexts/AuthContext";
import { useToast } from "../shared/contexts/ToastContext";
import DiagnosticModal from "./DiagnosticModal";


interface AnalysisHistoryProps {
  onLoadAnalysis: (analysisResult: any, resumeText: string, jdText: string) => void;
  setActiveTab: (tab: any) => void;
}

export default function AnalysisHistory({ onLoadAnalysis, setActiveTab }: AnalysisHistoryProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeDiagnosticDetail, setActiveDiagnosticDetail] = useState<any>(null);


  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await AnalysisRepository.listAnalysesWithResume(user.id);
        setHistory(data);
        if (data.length > 0) {
          setSelectedRecord(data[0]);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load analysis history", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  const handleLoad = (record: any) => {
    // Reconstruct the full AnalysisResult expected by the app state
    const resultPayload = {
      score: record.ats_score,
      recruiter_eyes: record.recruiter_intelligence,
      career_roadmap: record.career_intelligence,
      opportunity_engine: record.opportunity_engine,
      career_dashboard: record.career_dashboard
    };

    const resumeText = record.resume_versions?.raw_text || "";
    const jdText = record.job_description || "";

    onLoadAnalysis(resultPayload, resumeText, jdText);
    showToast("Historical analysis successfully loaded into workspace!", "success");
    setActiveTab("dashboard"); // Redirect to dashboard to view results
  };

  const handleReanalyze = (record: any) => {
    const resultPayload = {
      score: record.ats_score,
      recruiter_eyes: record.recruiter_intelligence,
      career_roadmap: record.career_intelligence,
      opportunity_engine: record.opportunity_engine,
      career_dashboard: record.career_dashboard
    };

    const resumeText = record.resume_versions?.raw_text || "";
    const jdText = record.job_description || "";

    onLoadAnalysis(resultPayload, resumeText, jdText);
    showToast("Re-running analysis on active workspace...", "success");
    setActiveTab("analyzer");
  };

  const handleExport = (record: any) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `analysis_report_${record.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Analysis report JSON exported successfully!", "success");
    } catch (err: any) {
      showToast("Failed to export JSON report", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AnalysisRepository.deleteAnalysis(id);
      showToast("Historical record deleted successfully", "success");
      const updated = history.filter(item => item.id !== id);
      setHistory(updated);
      if (updated.length > 0) {
        setSelectedRecord(updated[0]);
      } else {
        setSelectedRecord(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete record", "error");
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
        <p className="text-xs text-[#4E453F] font-mono font-bold uppercase tracking-wider">
          Retrieving historical scans...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 my-12 premium-shadow">
        <History className="h-12 w-12 text-stone-300 mx-auto" />
        <h4 className="text-sm font-extrabold text-[#1C1008]">No Scanning History Found</h4>
        <p className="text-xs text-[#4E453F] leading-relaxed">
          You haven't analyzed any resumes yet. Optimize your resume compatibility against job targets to build your history log.
        </p>
        <button
          onClick={() => setActiveTab("analyzer")}
          className="px-5 py-2.5 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Run First Analysis</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-[#1C1008]">Analysis & Scan History</h2>
        <p className="text-xs text-[#4E453F] font-semibold mt-0.5">
          Browse previously analyzed job profiles, uploaded resumes, and generated intelligence reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIST */}
        <div className="lg:col-span-5 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {history.map((record) => {
            const isSelected = selectedRecord?.id === record.id;
            const dateStr = new Date(record.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-[#FAF8F5] border-[#D97706] shadow-sm shadow-[#D97706]/5" 
                    : "bg-white border-[#E5E0D8] hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateStr}
                  </span>
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 border rounded-full ${getScoreColor(record.ats_score)}`}>
                    Score: {record.ats_score}%
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-[#1C1008] truncate mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-stone-500" />
                  {record.resume_versions?.version_name || "Resume Version"}
                </h4>

                <p className="text-[10px] text-[#4E453F]/80 font-medium line-clamp-2 leading-relaxed">
                  {record.job_description || "No job description text provided."}
                </p>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DETAIL DETAIL */}
        <div className="lg:col-span-7">
          {selectedRecord && (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E0D8]/60 pb-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[#1C1008] flex items-center gap-1.5">
                    <History className="h-4 w-4 text-[#D97706]" />
                    Historical Record Details
                  </h3>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Scanned on {new Date(selectedRecord.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleLoad(selectedRecord)}
                    className="px-3 py-1.5 bg-[#D97706] hover:bg-[#D97706]/95 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-[#D97706]/10 active:scale-95 transition-all"
                  >
                    <CornerDownLeft className="h-3 w-3" />
                    <span>Load</span>
                  </button>
                  <button
                    onClick={() => handleReanalyze(selectedRecord)}
                    className="px-3 py-1.5 bg-[#1C1008] hover:bg-stone-900 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <ChevronRight className="h-3 w-3" />
                    <span>Re-Analyze</span>
                  </button>
                  <button
                    onClick={() => handleExport(selectedRecord)}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E5E0D8]/80 text-[#1C1008] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedRecord.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Score and Verdict */}
              <div 
                onClick={() => setActiveDiagnosticDetail({
                  title: `Historical Score Analysis: ${selectedRecord.ats_score}%`,
                  description: selectedRecord.recruiter_intelligence?.verdict || "This analysis matches your resume parameters and lists key recommendations to improve compatibility.",
                  details: [
                    `Overall ATS Score: ${selectedRecord.ats_score}%`,
                    `Analyzed: ${new Date(selectedRecord.created_at).toLocaleString()}`
                  ],
                  actionItems: [
                    "To view the full interactive dashboard for this scan, click 'Load Into Active Workspace' at the top right."
                  ]
                })}
                className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 transition-all duration-200"
              >
                <div className={`h-16 w-16 shrink-0 rounded-full flex items-center justify-center border font-display font-black text-lg ${getScoreColor(selectedRecord.ats_score)}`}>
                  {selectedRecord.ats_score}%
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1C1008]">Score Verdict</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold leading-relaxed mt-0.5">
                    {selectedRecord.recruiter_intelligence?.verdict || 
                     "This analysis matches your resume parameters and lists key recommendations to improve compatibility."}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">
                  Target Job Description Analyzed
                </label>
                <div className="bg-stone-50 border border-[#E5E0D8]/60 rounded-xl p-4 max-h-[140px] overflow-y-auto text-[11px] text-[#1C1008] font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.job_description}
                </div>
              </div>

              {/* Resume Text */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">
                  Resume Copy Analyzed
                </label>
                <div className="bg-stone-50 border border-[#E5E0D8]/60 rounded-xl p-4 max-h-[140px] overflow-y-auto text-[11px] text-[#1C1008] font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.resume_versions?.raw_text || "No resume text found."}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <DiagnosticModal
        isOpen={!!activeDiagnosticDetail}
        onClose={() => setActiveDiagnosticDetail(null)}
        title={activeDiagnosticDetail?.title || ""}
        description={activeDiagnosticDetail?.description || ""}
        details={activeDiagnosticDetail?.details}
        actionItems={activeDiagnosticDetail?.actionItems}
      />
    </div>
  );
}
