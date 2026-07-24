import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Coins,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  FileText,
  Check,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Settings,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  UserCheck,
} from "lucide-react";
import {
  AnalysisResult,
  ApplicationTrackerItem,
  ResumeVersionMetric,
  JobMatchResult,
  ApplicationChecklist,
  useGeminiAnalyzer,
} from "../../hooks/useGeminiAnalyzer";
import { useUser } from "../../shared/contexts/AuthContext";
import { useApplicationStore } from "../../shared/stores/applicationStore";
import { useToast } from "../../shared/contexts/ToastContext";
import { LoadingSequence, DiagnosticModal } from "../../components";

interface JobSearchWorkspaceProps {
  initialResult: AnalysisResult;
  resume: string;
}

export default function JobSearchWorkspace({ initialResult, resume }: JobSearchWorkspaceProps) {
  // -------------------------------------------------------------
  // STATE MANAGEMENT WITH LOCALSTORAGE PERSISTENCE
  // -------------------------------------------------------------

  const { user } = useUser();
  const { showToast } = useToast();
  const {
    applications,
    loadApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplicationStore();

  // Load applications from Supabase
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      if (user?.id) {
        console.log(`[SEEDING DEBUG] Initial load of applications started for user: ${user.id}`);
        try {
          await loadApplications(user.id);
          console.log(`[SEEDING DEBUG] Load finished. Database count: ${useApplicationStore.getState().applications.length}`);
        } catch (err: any) {
          console.error(`[SEEDING DEBUG] Load failed:`, err);
        } finally {
          setHasLoadedFromDb(true);
        }
      }
    };
    fetchApps();
  }, [user?.id, loadApplications]);

  // Seeding check (only once if database has 0 items and we haven't seeded yet)
  useEffect(() => {
    const performSeeding = async () => {
      if (!user?.id || !hasLoadedFromDb) {
        console.log("[SEEDING DEBUG] Seeding check skipped: user.id or hasLoadedFromDb is false", {
          userId: user?.id,
          hasLoadedFromDb
        });
        return;
      }

      const seedKey = `ats_killer_seeded_db_${user.id}`;
      const alreadySeeded = localStorage.getItem(seedKey);

      console.log("[SEEDING DEBUG] performSeeding started:", {
        applicationsLength: applications.length,
        alreadySeeded,
        initialTrackerLength: initialResult.application_tracker?.length,
        seedKey
      });

      if (applications.length === 0 && !alreadySeeded && initialResult.application_tracker?.length) {
        console.log("[SEEDING DEBUG] Conditions met. Setting seed key and initiating inserts...");
        localStorage.setItem(seedKey, "true");

        for (const app of initialResult.application_tracker) {
          const appData = {
            company: app.company,
            position: app.position,
            date_applied: app.date_applied || new Date().toISOString().split("T")[0],
            resume_version: app.resume_version || "V1_Core_Fullstack",
            ats_score: app.ats_score || 70,
            status: normalizeStatus(app.status),
            notes: app.notes || "",
            checklist: app.checklist || {
              resume_customized: false,
              cover_letter: false,
              linkedin_updated: false,
              portfolio_ready: false,
              github_updated: false,
              followup_sent: false,
              interview_scheduled: false,
            },
          };

          console.log(`[SEEDING DEBUG] Inserting application for: ${app.company} - ${app.position}...`);
          try {
            const result = await createApplication(user.id, appData);
            console.log(`[SEEDING DEBUG] Successfully created application:`, result);
          } catch (err: any) {
            console.error(`[SEEDING DEBUG] ERROR creating application for ${app.company}:`, err);
            // reset seedKey if we want to retry on subsequent loads
            localStorage.removeItem(seedKey);
          }
        }
      } else {
        console.log("[SEEDING DEBUG] Seeding conditions NOT met.");
      }
    };

    performSeeding();
  }, [user?.id, hasLoadedFromDb, applications.length, initialResult, createApplication]);

  // Stored Resume Versions
  const [resumeVersions, setResumeVersions] = useState<ResumeVersionMetric[]>(() => {
    const saved = localStorage.getItem("ats_killer_resume_versions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialResult.resume_versions || [];
  });

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<"tracker" | "analytics" | "matcher" | "checklist">("tracker");

  // Diagnostic Modal State
  const [activeDiagnosticDetail, setActiveDiagnosticDetail] = useState<{
    title: string;
    description: string;
    details: string[];
    actionItems: string[];
  } | null>(null);

  // Tracker Layout View (Kanban vs List)
  const [trackerLayout, setTrackerLayout] = useState<"kanban" | "list">("kanban");

  // Checklist selected application ID
  const [selectedChecklistAppId, setSelectedChecklistAppId] = useState<string>(() => {
    return applications[0]?.id || "";
  });

  // Add application modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({
    company: "",
    position: "",
    status: "Wishlist" as ApplicationTrackerItem["status"],
    notes: "",
    resume_version: "V1_Core_Fullstack",
    ats_score: 75,
  });

  const normalizeStatus = (status: unknown): ApplicationTrackerItem["status"] => {
    const allowed: ApplicationTrackerItem["status"][] = [
      "Wishlist",
      "Applied",
      "OA",
      "Interview",
      "Offer",
      "Rejected",
      "Accepted",
    ];
    return (allowed as string[]).includes(String(status))
      ? (status as ApplicationTrackerItem["status"])
      : "Wishlist";
  };

  // AI Job Match module state
  const { analyzeJobMatch, loading: matchingLoading, error: matchingError } = useGeminiAnalyzer();
  const [pastedJd, setPastedJd] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(() => {
    const saved = localStorage.getItem("ats_killer_active_job_match");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return initialResult.job_match || null;
  });

  // Update selected checklist application ID when list changes
  useEffect(() => {
    if (applications.length > 0 && !selectedChecklistAppId) {
      setSelectedChecklistAppId(applications[0].id);
    }
  }, [applications, selectedChecklistAppId]);

  // Persist resume versions
  useEffect(() => {
    localStorage.setItem("ats_killer_resume_versions", JSON.stringify(resumeVersions));
  }, [resumeVersions]);

  // Persist job match
  useEffect(() => {
    if (jobMatchResult) {
      localStorage.setItem("ats_killer_active_job_match", JSON.stringify(jobMatchResult));
    }
  }, [jobMatchResult]);

  // Reset job match details reactively when a new analysis result is loaded
  useEffect(() => {
    if (initialResult) {
      setJobMatchResult(initialResult.job_match || null);
    }
  }, [initialResult]);

  // Reset to initial AI analysis seed data
  const handleResetWorkspace = async () => {
    if (!user?.id) return;
    if (window.confirm("Are you sure you want to reset workspace data to the initial seeds?")) {
      try {
        for (const app of applications) {
          await deleteApplication(user.id, app.id);
        }
        if (initialResult.application_tracker?.length) {
          for (const app of initialResult.application_tracker) {
            const appData = {
              company: app.company,
              position: app.position,
              date_applied: app.date_applied || new Date().toISOString().split("T")[0],
              resume_version: app.resume_version || "V1_Core_Fullstack",
              ats_score: app.ats_score || 70,
              status: normalizeStatus(app.status),
              notes: app.notes || "",
              checklist: app.checklist || {
                resume_customized: false,
                cover_letter: false,
                linkedin_updated: false,
                portfolio_ready: false,
                github_updated: false,
                followup_sent: false,
                interview_scheduled: false,
              },
            };
            await createApplication(user.id, appData);
          }
        }
        setResumeVersions(initialResult.resume_versions || []);
        setJobMatchResult(initialResult.job_match || null);
        showToast("Workspace successfully reset to initial seeds.", "success");
      } catch (err: any) {
        showToast(`Failed to reset workspace: ${err.message}`, "error");
      }
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC APPLICATION ANALYTICS CALCULATIONS
  // -------------------------------------------------------------
  const derivedAnalytics = useMemo(() => {
    const total = applications.length;
    const callbacks = applications.filter(a => ["OA", "Interview", "Offer", "Accepted"].includes(a.status)).length;
    const interviews = applications.filter(a => ["Interview", "Offer", "Accepted"].includes(a.status)).length;
    const offers = applications.filter(a => ["Offer", "Accepted"].includes(a.status)).length;
    const rate = total > 0 ? Math.round((offers / total) * 100) : 0;

    // Calculate weekly activity baseline
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyMap = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<string, number>);

    // Calculate monthly activity baseline
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = months.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<string, number>);

    // Populate from actual data
    applications.forEach(a => {
      if (a.date_applied) {
        try {
          const date = new Date(a.date_applied);
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Convert 0-6 Sun-Sat to Mon-Sun
          const monthName = months[date.getMonth()];
          if (dayName) weeklyMap[dayName]++;
          if (monthName) monthlyMap[monthName]++;
        } catch (e) { }
      }
    });

    const weekly_activity = days.map(d => ({ day: d, count: weeklyMap[d] }));
    const activeMonths = months.filter(m => monthlyMap[m] > 0);
    const monthly_activity = (activeMonths.length ? activeMonths : ["Jun", "Jul"]).map(m => ({
      month: m,
      count: monthlyMap[m] || 0
    }));

    // Find most successful role (highest conversion to callbacks/interviews)
    const roleCounts: Record<string, { total: number; success: number }> = {};
    applications.forEach(a => {
      const role = a.position || "Developer";
      if (!roleCounts[role]) roleCounts[role] = { total: 0, success: 0 };
      roleCounts[role].total++;
      if (["OA", "Interview", "Offer", "Accepted"].includes(a.status)) {
        roleCounts[role].success++;
      }
    });

    let mostSuccessfulRole = "Software Engineer";
    let highestRatio = -1;
    Object.keys(roleCounts).forEach(role => {
      const ratio = roleCounts[role].success / roleCounts[role].total;
      if (ratio > highestRatio) {
        highestRatio = ratio;
        mostSuccessfulRole = role;
      }
    });

    return {
      total_applications: total,
      callbacks,
      interviews,
      offers,
      acceptance_rate: rate,
      weekly_activity,
      monthly_activity,
      most_successful_role: mostSuccessfulRole,
    };
  }, [applications]);

  // -------------------------------------------------------------
  // HANDLERS FOR KANBAN BOARD & APPLICATION MANAGEMENT
  // -------------------------------------------------------------
  const kanbanColumns: ApplicationTrackerItem["status"][] = [
    "Wishlist",
    "Applied",
    "OA",
    "Interview",
    "Offer",
    "Rejected",
    "Accepted",
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationTrackerItem["status"]) => {
    const id = e.dataTransfer.getData("text/plain");
    handleUpdateStatus(id, status);
  };

  const handleUpdateStatus = async (id: string, status: ApplicationTrackerItem["status"]) => {
    if (!user?.id) return;
    try {
      await updateApplication(user.id, id, { status });
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, "error");
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApp.company || !newApp.position || !user?.id) return;

    const addedChecklist = {
      resume_customized: newApp.status !== "Wishlist",
      cover_letter: false,
      linkedin_updated: false,
      portfolio_ready: false,
      github_updated: false,
      followup_sent: false,
      interview_scheduled: newApp.status === "Interview",
    };

    try {
      await createApplication(user.id, {
        company: newApp.company,
        position: newApp.position,
        date_applied: new Date().toISOString().split("T")[0],
        resume_version: newApp.resume_version,
        ats_score: newApp.ats_score,
        status: newApp.status,
        notes: newApp.notes,
        checklist: addedChecklist,
      });

      // Update versions counts
      setResumeVersions(prev => {
        const exists = prev.find(v => v.version_name === newApp.resume_version);
        if (exists) {
          return prev.map(v => v.version_name === newApp.resume_version
            ? { ...v, applications_sent: v.applications_sent + 1 }
            : v
          );
        } else {
          return [...prev, {
            version_name: newApp.resume_version,
            applications_sent: 1,
            interview_rate: 0,
            offer_rate: 0,
            avg_ats_score: newApp.ats_score
          }];
        }
      });

      setNewApp({
        company: "",
        position: "",
        status: "Wishlist",
        notes: "",
        resume_version: "V1_Core_Fullstack",
        ats_score: 75,
      });
      setShowAddModal(false);
      showToast("Application added successfully.", "success");
    } catch (err: any) {
      showToast(`Failed to add application: ${err.message}`, "error");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!user?.id) return;
    if (window.confirm("Delete this application?")) {
      try {
        await deleteApplication(user.id, id);
        if (selectedChecklistAppId === id) {
          setSelectedChecklistAppId("");
        }
        showToast("Application deleted.", "success");
      } catch (err: any) {
        showToast(`Failed to delete application: ${err.message}`, "error");
      }
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC CHECKLIST ACTIONS
  // -------------------------------------------------------------
  const activeChecklistApp = useMemo(() => {
    return applications.find(a => a.id === selectedChecklistAppId) || null;
  }, [applications, selectedChecklistAppId]);

  const handleToggleChecklistField = async (field: keyof ApplicationChecklist) => {
    if (!selectedChecklistAppId || !user?.id) return;
    const app = applications.find(a => a.id === selectedChecklistAppId);
    if (!app) return;

    const updatedChecklist = {
      ...app.checklist,
      [field]: !app.checklist[field],
    };

    try {
      await updateApplication(user.id, selectedChecklistAppId, {
        checklist: updatedChecklist
      });
    } catch (err: any) {
      showToast(`Failed to update checklist: ${err.message}`, "error");
    }
  };

  const activeChecklistProgress = useMemo(() => {
    if (!activeChecklistApp) return 0;
    const checks = activeChecklistApp.checklist;
    const total = 7;
    let completed = 0;
    if (checks.resume_customized) completed++;
    if (checks.cover_letter) completed++;
    if (checks.linkedin_updated) completed++;
    if (checks.portfolio_ready) completed++;
    if (checks.github_updated) completed++;
    if (checks.followup_sent) completed++;
    if (checks.interview_scheduled) completed++;

    return Math.round((completed / total) * 100);
  }, [activeChecklistApp]);

  // -------------------------------------------------------------
  // JOB MATCH DYNAMIC CALLS
  // -------------------------------------------------------------
  const handleAnalyzeJobMatch = async () => {
    if (!pastedJd.trim()) return;
    try {
      const match = await analyzeJobMatch(resume, pastedJd);
      setJobMatchResult(match);
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------------------
  // COLOR AND THEME ACCESSORS
  // -------------------------------------------------------------
  const getStatusColorClass = (status: ApplicationTrackerItem["status"]) => {
    switch (status) {
      case "Wishlist":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Applied":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "OA":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Interview":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Offer":
        return "bg-[#D1FAE5] text-[#065F46] border-[#10B981]/20";
      case "Rejected":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/20";
      case "Accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Find best performing version based on highest interview rate
  const bestPerformingVersion = useMemo(() => {
    if (resumeVersions.length === 0) return null;
    return [...resumeVersions].sort((a, b) => b.interview_rate - a.interview_rate)[0];
  }, [resumeVersions]);

  return (
    <section id="workspace" className="border-t border-[#E5E0D8] pt-12 mt-12 px-4 sm:px-6 space-y-8 animate-fade-in-up">

      {/* WORKSPACE HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E5E0D8]/60 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#D97706] uppercase bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#D97706]/20 inline-block mb-1.5">
            Job Search Workspace™
          </span>
          <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
            Job Search Workspace
          </h3>
          <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
            Track applications, monitor resume conversion metrics, check AI alignment, and checklist your checklist requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetWorkspace}
            className="px-4 py-2 border border-[#E5E0D8] bg-white rounded-xl text-xs font-bold text-[#1C1008] hover:bg-[#F5F0E8] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5" /> Reset to Seeds
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#1C1008] hover:bg-[#1C1008]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Application
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT CONTAINER */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">

        {/* WORKSPACE NAVIGATION SIDEBAR */}
        <div className="w-full md:w-16 lg:w-60 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-[#E5E0D8]/50 pb-4 md:pb-0 pr-0 md:pr-4 lg:pr-6 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center justify-center lg:justify-start gap-3 w-full py-3 px-3 lg:px-4 text-xs font-bold transition-all rounded-xl cursor-pointer border-l-4 ${activeTab === "tracker"
              ? "bg-[#F5F0E8] border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008] hover:bg-[#F5F0E8]/50"
              }`}
          >
            <span className="text-base shrink-0">📋</span>
            <span className="hidden lg:inline">Application Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center justify-center lg:justify-start gap-3 w-full py-3 px-3 lg:px-4 text-xs font-bold transition-all rounded-xl cursor-pointer border-l-4 ${activeTab === "analytics"
              ? "bg-[#F5F0E8] border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008] hover:bg-[#F5F0E8]/50"
              }`}
          >
            <span className="text-base shrink-0">📊</span>
            <span className="hidden lg:inline">Analytics & Versions</span>
          </button>

          <button
            onClick={() => setActiveTab("matcher")}
            className={`flex items-center justify-center lg:justify-start gap-3 w-full py-3 px-3 lg:px-4 text-xs font-bold transition-all rounded-xl cursor-pointer border-l-4 ${activeTab === "matcher"
              ? "bg-[#F5F0E8] border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008] hover:bg-[#F5F0E8]/50"
              }`}
          >
            <span className="text-base shrink-0">🧠</span>
            <span className="hidden lg:inline">AI Job Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`flex items-center justify-center lg:justify-start gap-3 w-full py-3 px-3 lg:px-4 text-xs font-bold transition-all rounded-xl cursor-pointer border-l-4 ${activeTab === "checklist"
              ? "bg-[#F5F0E8] border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008] hover:bg-[#F5F0E8]/50"
              }`}
          >
            <span className="text-base shrink-0">🎯</span>
            <span className="hidden lg:inline">Pre-Job Checklist</span>
          </button>
        </div>

        {/* WORKSPACE TAB CONTENT PANEL */}
        <div className="flex-1 min-h-[400px] w-full">
        <AnimatePresence mode="wait">

          {/* TAB 1: APPLICATION TRACKER */}
          {activeTab === "tracker" && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Tracker Subheader Controls */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">
                  Total Active Applications: {applications.length}
                </span>

                <div className="bg-[#F5F0E8] p-1 rounded-xl flex items-center border border-[#E5E0D8]">
                  <button
                    onClick={() => setTrackerLayout("kanban")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${trackerLayout === "kanban" ? "bg-white shadow-sm text-[#1C1008]" : "text-[#4E453F]/60"
                      }`}
                    title="Kanban Board View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTrackerLayout("list")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${trackerLayout === "list" ? "bg-white shadow-sm text-[#1C1008]" : "text-[#4E453F]/60"
                      }`}
                    title="Table List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* VIEW A: KANBAN LAYOUT */}
              {trackerLayout === "kanban" ? (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {kanbanColumns.map(status => {
                    const columnApps = applications.filter(a => a.status === status);
                    return (
                      <div
                        key={status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-72 shrink-0 flex flex-col p-4 space-y-3 min-h-[480px]"
                      >
                        <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-2">
                          <span className="text-xs font-bold text-[#1C1008] font-mono tracking-wide">
                            {status}
                          </span>
                          <span className="bg-[#E5E0D8] text-[#1C1008] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {columnApps.length}
                          </span>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] scrollbar-none pb-2">
                          {columnApps.map(app => (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              onClick={() => setActiveDiagnosticDetail({
                                title: `Tracked Application: ${app.company}`,
                                description: `Details for your ${app.position} role application.`,
                                details: [
                                  `Company: ${app.company}`,
                                  `Position: ${app.position}`,
                                  `Status: ${app.status}`,
                                  `Resume Version: ${app.resume_version}`,
                                  `ATS Match Score: ${app.ats_score ? `${app.ats_score}%` : "Not evaluated"}`,
                                  `Date Applied: ${app.date_applied}`
                                ],
                                actionItems: [
                                  `Notes: ${app.notes || "No notes logged yet."}`
                                ]
                              })}
                              className="bg-white border border-[#E5E0D8] hover:border-[#D97706]/50 rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all premium-shadow space-y-2.5 relative group"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApplication(app.id);
                                }}
                                className="absolute top-2.5 right-2.5 text-[#EF4444] opacity-0 group-hover:opacity-100 hover:bg-[#FEE2E2] p-1 rounded transition-all cursor-pointer"
                                title="Delete application"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>

                              <div>
                                <h5 className="text-[10px] font-mono font-bold text-[#4E453F]/60 tracking-wider">
                                  {app.company}
                                </h5>
                                <p className="text-xs font-extrabold text-[#1C1008] font-display pr-5 leading-snug mt-0.5">
                                  {app.position}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[8px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {app.resume_version}
                                </span>
                                {app.ats_score && (
                                  <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                                    {app.ats_score} ATS
                                  </span>
                                )}
                              </div>

                              {app.notes && (
                                <p className="text-[10px] text-[#4E453F] font-semibold italic border-t border-dashed border-[#E5E0D8] pt-2 line-clamp-2">
                                  "{app.notes}"
                                </p>
                              )}

                              <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono pt-1">
                                <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {app.date_applied}</span>
                              </div>
                            </div>
                          ))}

                          {columnApps.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-[#E5E0D8] rounded-xl flex items-center justify-center text-[10px] text-[#4E453F]/40 italic font-semibold">
                              Drag apps here
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (

                // VIEW B: LIST LAYOUT
                <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden premium-shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#E5E0D8]/60 text-left">
                      <thead className="bg-[#FAF8F5]">
                        <tr>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Company & Role</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Date Applied</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Version</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">ATS Score</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D8]/50 bg-white">
                        {applications.map((app) => (
                          <tr 
                            key={app.id} 
                            onClick={() => setActiveDiagnosticDetail({
                              title: `Tracked Application: ${app.company}`,
                              description: `Details for your ${app.position} role application.`,
                              details: [
                                `Company: ${app.company}`,
                                `Position: ${app.position}`,
                                `Status: ${app.status}`,
                                `Resume Version: ${app.resume_version}`,
                                `ATS Match Score: ${app.ats_score ? `${app.ats_score}%` : "Not evaluated"}`,
                                `Date Applied: ${app.date_applied}`
                              ],
                              actionItems: [
                                `Notes: ${app.notes || "No notes logged yet."}`
                              ]
                            })}
                            className="hover:bg-[#FAF8F5]/40 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs font-extrabold text-[#1C1008]">{app.position}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{app.company}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#4E453F]">
                              {app.date_applied}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                              {app.resume_version}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-extrabold text-[#D97706]">
                              {app.ats_score}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${getStatusColorClass(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#4E453F] max-w-xs truncate font-medium">
                              {app.notes || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={app.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                                  className="bg-[#FAF8F5] text-xs font-bold rounded-lg border border-[#E5E0D8] p-1 text-[#1C1008] focus:outline-none focus:ring-1 focus:ring-[#D97706]/40 cursor-pointer"
                                >
                                  {kanbanColumns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteApplication(app.id);
                                  }}
                                  className="text-[#EF4444] hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {applications.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-[#4E453F]/60 italic font-semibold">
                              No applications tracked yet. Click "Add Application" to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ANALYTICS & RESUME VERSIONS */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >

              {/* Application Analytics dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="cursor-pointer hover:-translate-y-[3px] transition-all" onClick={() => setActiveDiagnosticDetail({
                    title: "Total Applications",
                    description: `You have ${derivedAnalytics.total_applications} active applications.`,
                    details: [],
                    actionItems: []
                  })}>
                    <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Total Applications</span>
                    <p className="text-3xl font-display font-extrabold text-[#1C1008] mt-2">{derivedAnalytics.total_applications}</p>
                  </div>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="cursor-pointer hover:-translate-y-[3px] transition-all" onClick={() => setActiveDiagnosticDetail({
                    title: "Callbacks Received",
                    description: `You have received ${derivedAnalytics.callbacks} callbacks from employers.`,
                    details: [],
                    actionItems: []
                  })}>
                    <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Callbacks Received</span>
                    <p className="text-3xl font-display font-extrabold text-[#10B981] mt-2">{derivedAnalytics.callbacks}</p>
                  </div>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-[3px] transition-all" onClick={() => setActiveDiagnosticDetail({
                      title: "Interviews Landed",
                      description: `You have ${derivedAnalytics.interviews} interviews landed.`,
                      details: [],
                      actionItems: []
                    })}>
                  <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Interviews Landed</span>
                  <p className="text-3xl font-display font-extrabold text-purple-600 mt-2">{derivedAnalytics.interviews}</p>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-[3px] transition-all" onClick={() => setActiveDiagnosticDetail({
                      title: "Offers Obtained",
                      description: `You have obtained ${derivedAnalytics.offers} offers.`,
                      details: [],
                      actionItems: []
                    })}>
                  <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Offers Obtained</span>
                  <p className="text-3xl font-display font-extrabold text-emerald-600 mt-2">{derivedAnalytics.offers}</p>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1 cursor-pointer hover:-translate-y-[3px] transition-all" onClick={() => setActiveDiagnosticDetail({
                      title: "Acceptance Rate",
                      description: `Your acceptance rate is ${derivedAnalytics.acceptance_rate}%.`,
                      details: [],
                      actionItems: []
                    })}>
                  <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider">Acceptance Rate</span>
                  <p className="text-3xl font-display font-extrabold text-[#D97706] mt-2">{derivedAnalytics.acceptance_rate}%</p>
                </div>
              </div>

              {/* Row 2: Charts and Version Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Visual activity charts */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Activity Analytics</h4>
                    <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Visual representation of weekly application flow</p>
                  </div>

                  {/* Weekly Chart */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-bold text-[#4E453F]/65 uppercase tracking-wider">Weekly Activity (Daily Output)</p>
                    {applications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#E5E0D8] rounded-2xl space-y-3.5 bg-[#FAF8F5]/30">
                        <Activity className="h-8 w-8 text-[#D97706]/60 animate-pulse" />
                        <h5 className="text-xs font-extrabold text-[#1C1008]">No Weekly Activity Logged</h5>
                        <p className="text-[10px] text-[#4E453F] leading-relaxed max-w-[260px] font-semibold">
                          Your weekly application pipeline is currently empty. Run a match scan to populate.
                        </p>
                        <button
                          onClick={() => setActiveDiagnosticDetail({
                            title: "Start Optimization Scan",
                            description: "Run an analysis on your resume to populate the applications tracker and begin tracking your weekly pipeline.",
                            details: [],
                            actionItems: ["Navigate to the Analyzer tab to run a match scan."]
                          })}
                          className="px-4 py-2 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-xl text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Analyze Resume</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-gray-100">
                        {derivedAnalytics.weekly_activity.map(day => {
                          const max = Math.max(...derivedAnalytics.weekly_activity.map(d => d.count), 1);
                          const percent = (day.count / max) * 80 + 5; // offset bar height
                          return (
                            <div 
                              key={day.day} 
                              onClick={() => setActiveDiagnosticDetail({
                                title: `Daily Applications Count: ${day.day}`,
                                description: `You submitted ${day.count} applications on this day of the week.`,
                                details: [
                                  `Weekly peak: ${Math.max(...derivedAnalytics.weekly_activity.map(d => d.count))}`
                                ],
                                actionItems: [
                                  "Spacing your application submissions across weekdays helps manage callback review times.",
                                  "Check your Copilot schedule daily to complete follow-ups on time."
                                ]
                              })}
                              className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                            >
                              {/* tooltip */}
                              <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-[#1C1008] text-white text-[9px] font-mono px-1.5 py-0.5 rounded transition-all">
                                {day.count}
                              </span>
                              <div
                                className="w-full bg-[#D97706]/70 group-hover:bg-[#D97706] rounded-t-md transition-all duration-500"
                                style={{ height: `${percent}px` }}
                              />
                              <span className="text-[9px] font-mono text-[#4E453F]/60">{day.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Monthly Activity */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#4E453F]/65 uppercase tracking-wider">
                      <span>Monthly Breakdown</span>
                      <span className="text-[9px] font-mono text-gray-400">Trend Tracker</span>
                    </div>

                    <div className="space-y-2">
                      {derivedAnalytics.monthly_activity.map(month => {
                        const total = applications.length || 1;
                        const barWidth = Math.round((month.count / total) * 100);
                        return (
                          <div 
                            key={month.month} 
                            onClick={() => setActiveDiagnosticDetail({
                              title: `Monthly Applications Volume: ${month.month}`,
                              description: `You submitted ${month.count} applications in ${month.month}.`,
                              details: [
                                `Total active apps in pool: ${applications.length}`,
                                `Percentage of total: ${Math.round((month.count / total) * 100)}%`
                              ],
                              actionItems: [
                                "Maintain a steady pipeline of 3-5 applications per week.",
                                "Track your callback rate specifically for applications submitted in this month."
                              ]
                            })}
                            className="space-y-1 cursor-pointer hover:bg-[#FAF8F5]/80 p-1.5 rounded-xl transition-all"
                          >
                            <div className="flex justify-between text-[10px] font-bold text-[#1C1008]">
                              <span>{month.month}</span>
                              <span className="font-mono">{month.count} apps</span>
                            </div>
                            <div className="h-2 bg-[#F5F0E8] rounded-full overflow-hidden w-full">
                              <div className="h-full bg-gradient-to-r from-[#D97706] to-[#D97706]/60 rounded-full" style={{ width: `${barWidth || 5}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resume Version Analytics */}
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8]/60 pb-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Resume Version Analytics</h4>
                      <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Compare conversion efficiency across drafts</p>
                    </div>
                    {bestPerformingVersion && (
                      <span className="bg-emerald-50 border border-emerald-200 text-[#065F46] text-[8px] font-mono font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider self-start sm:self-auto shrink-0">
                        Best: {bestPerformingVersion.version_name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {resumeVersions.map((version) => {
                      const isBest = bestPerformingVersion?.version_name === version.version_name;
                      return (
                        <div
                          key={version.version_name}
                          onClick={() => setActiveDiagnosticDetail({
                            title: `Version Analytics: ${version.version_name}`,
                            description: `Conversion rates and metrics for resume version "${version.version_name}".`,
                            details: [
                              `Applications Sent: ${version.applications_sent}`,
                              `Average ATS Score: ${version.avg_ats_score}%`,
                              `Interview Rate: ${version.interview_rate}%`,
                              `Offer Rate: ${version.offer_rate}%`
                            ],
                            actionItems: [
                              "Compare performance with other versions in the AI Career Copilot tab.",
                              "Highlight achievements from this version in the Career Knowledge Graph."
                            ]
                          })}
                          className={`bg-[#FAF8F5] border rounded-2xl p-4 space-y-3 relative cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200 ${isBest ? "border-[#10B981]/50 bg-emerald-50/10" : "border-[#E5E0D8]/60"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#1C1008] flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-gray-500" /> {version.version_name}
                            </span>
                            <span className="text-[9px] font-mono text-[#4E453F] font-bold">
                              {version.applications_sent} Sent
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center pt-2">
                            <div className="bg-white/60 border border-[#E5E0D8]/40 p-2 rounded-xl">
                              <p className="text-[9px] font-mono text-[#4E453F]/60 uppercase tracking-wider">Avg ATS</p>
                              <p className="text-sm font-extrabold text-[#D97706] font-mono mt-0.5">{version.avg_ats_score}%</p>
                            </div>
                            <div className="bg-white/60 border border-[#E5E0D8]/40 p-2 rounded-xl">
                              <p className="text-[9px] font-mono text-[#4E453F]/60 uppercase tracking-wider">Interview</p>
                              <p className="text-sm font-extrabold text-purple-600 font-mono mt-0.5">{version.interview_rate}%</p>
                            </div>
                            <div className="bg-white/60 border border-[#E5E0D8]/40 p-2 rounded-xl">
                              <p className="text-[9px] font-mono text-[#4E453F]/60 uppercase tracking-wider">Offer</p>
                              <p className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">{version.offer_rate}%</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {resumeVersions.length === 0 && (
                      <p className="text-xs text-[#4E453F]/60 italic text-center py-6">
                        No version metrics generated yet. Add applications using different version tags.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: AI JOB MATCH */}
          {activeTab === "matcher" && (
            <motion.div
              key="matcher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Left Form Input */}
              <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Dynamic Alignment</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Analyze target JDs on the fly against active resume</p>
                </div>

                <textarea
                  value={pastedJd}
                  onChange={(e) => setPastedJd(e.target.value)}
                  placeholder="Paste the Job Description or requirements text here to check alignment..."
                  className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full h-64 p-4 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#D97706]/40 text-[#1C1008] font-sans leading-relaxed"
                />

                {matchingLoading ? (
                  <div className="w-full py-2">
                    <LoadingSequence steps={["Matching your profile...", "Parsing job description...", "Aligning profiles...", "Calculating score..."]} />
                  </div>
                ) : (
                  <button
                    onClick={handleAnalyzeJobMatch}
                    disabled={!pastedJd.trim()}
                    className="w-full bg-[#1C1008] hover:bg-[#1C1008]/90 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-[#D97706]" /> Run Matcher Analysis
                  </button>
                )}

                {matchingError && (
                  <div className="text-[10px] text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100 leading-relaxed font-semibold">
                    Error: {matchingError}
                  </div>
                )}
              </div>

              {/* Right Output Panel */}
              <div className="md:col-span-7 space-y-5">
                {matchingLoading ? (
                  <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6 animate-pulse">
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-stone-200 rounded" />
                        <div className="h-3 w-48 bg-stone-100 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-stone-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-stone-50 rounded-2xl" />
                      <div className="h-16 bg-stone-50 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-stone-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-stone-100 rounded" />
                        <div className="h-3 w-28 bg-stone-100 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-stone-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-stone-100 rounded" />
                        <div className="h-3 w-28 bg-stone-100 rounded" />
                      </div>
                    </div>
                    <div className="h-20 bg-stone-55 bg-stone-50 rounded-2xl animate-pulse" />
                  </div>
                ) : jobMatchResult ? (
                  <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8]/60 pb-3">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Evaluation Diagnostic</h4>
                        <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Resume vs target job comparative profile</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="text-xs font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#D97706]/20 animate-fade-in">
                          {jobMatchResult.compatibility_score}% Match
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Score display */}
                      <div 
                        onClick={() => setActiveDiagnosticDetail({
                          title: "Recommended Resume Version Optimization",
                          description: `We recommend using your "${jobMatchResult.recommended_version}" resume version for this position.`,
                          details: [
                            "This version has the highest density of matching keywords and historical success rates for similar roles.",
                            "Tailoring your headline to align with the job description keywords will increase recruiter visibility."
                          ],
                          actionItems: [
                            "Ensure the header of your resume matches the target job title exactly.",
                            "Highlight relevant projects first in the experience section.",
                            "Verify that the active resume version matches the recommended version."
                          ]
                        })}
                        className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 flex flex-col justify-between hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 transition-all cursor-pointer group"
                      >
                        <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider group-hover:text-[#D97706]">Recommended Resume version</span>
                        <p className="text-xs font-extrabold text-[#1C1008] mt-2 font-mono group-hover:text-[#D97706] flex items-center justify-between">
                          {jobMatchResult.recommended_version}
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#D97706] transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </div>

                      <div 
                        onClick={() => setActiveDiagnosticDetail({
                          title: "Preparation Action Plan",
                          description: `Estimated preparation time: ${jobMatchResult.est_prep_time}. Here is how to allocate your time:`,
                          details: [
                            "Review the key responsibilities highlighted in the job description.",
                            "Practice mock interviews targeting the specific core competencies of this company."
                          ],
                          actionItems: [
                            "First 25%: Deep dive into missing skills and technical stack differences.",
                            "Next 50%: Align past project narratives to match the company's product challenges.",
                            "Final 25%: Practice system design and behavioral stories (STAR method)."
                          ]
                        })}
                        className="bg-[#FAF8F5] border border-[#E5E0D8]/60 rounded-2xl p-4 flex flex-col justify-between hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 transition-all cursor-pointer group"
                      >
                        <span className="text-[9px] font-mono font-bold text-[#4E453F]/60 uppercase tracking-wider group-hover:text-[#D97706]">Preparation estimate</span>
                        <p className="text-xs font-extrabold text-[#1C1008] mt-2 group-hover:text-[#D97706] flex items-center justify-between">
                          {jobMatchResult.est_prep_time}
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#D97706] transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div 
                        onClick={() => setActiveDiagnosticDetail({
                          title: "Leveraging Core Strengths",
                          description: "These are the areas where your profile aligns exceptionally well with the target role requirements:",
                          details: jobMatchResult.strengths,
                          actionItems: [
                            "Inject these core strengths into your resume's summary/about section.",
                            "Prepare at least one interview story illustrating each of these strengths in action.",
                            "Reference these directly when answering 'Why are you a good fit for this role?'"
                          ]
                        })}
                        className="space-y-2 bg-[#FAF8F5]/30 hover:bg-[#F5F0E8]/40 border border-transparent hover:border-[#D97706]/20 p-3.5 rounded-2xl transition-all cursor-pointer group"
                      >
                        <span className="text-[9px] font-mono font-bold text-[#10B981] uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Core Strengths</span>
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#D97706] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                        </span>
                        <ul className="text-xs text-[#4E453F] pl-4 list-disc space-y-1 font-semibold leading-relaxed">
                          {jobMatchResult.strengths.map((str, i) => <li key={i}>{str}</li>)}
                        </ul>
                      </div>

                      {/* Missing */}
                      <div 
                        onClick={() => setActiveDiagnosticDetail({
                          title: "Bridging the Skill Gaps",
                          description: "We identified the following missing skills or areas that were not explicitly mentioned in your active resume:",
                          details: jobMatchResult.missing_skills,
                          actionItems: [
                            "Add these keywords to your resume if you have relevant exposure or personal projects.",
                            "Take a quick crash course or read documentation on these topics to pass initial screening.",
                            "Be prepared to explain how your transferrable skills compensate for these gaps."
                          ]
                        })}
                        className="space-y-2 bg-[#FAF8F5]/30 hover:bg-[#F5F0E8]/40 border border-transparent hover:border-[#D97706]/20 p-3.5 rounded-2xl transition-all cursor-pointer group"
                      >
                        <span className="text-[9px] font-mono font-bold text-[#EF4444] uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Missing Skills</span>
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#D97706] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                        </span>
                        <ul className="text-xs text-[#4E453F] pl-4 list-disc space-y-1 font-semibold leading-relaxed">
                          {jobMatchResult.missing_skills.map((mis, i) => <li key={i}>{mis}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div 
                      onClick={() => setActiveDiagnosticDetail({
                        title: "Pitch & Cover Letter Strategy",
                        description: "Use this strategic focus to structure your elevator pitch and cover letter intro:",
                        details: [jobMatchResult.cover_letter_focus],
                        actionItems: [
                          "Mention this specific focus area in the opening paragraph of your cover letter.",
                          "Draft a 30-second elevator pitch connecting your background directly to this theme.",
                          "Focus on quantifiable metrics related to this theme in your experience bullets."
                        ]
                      })}
                      className="border-t border-[#E5E0D8]/60 pt-4 bg-[#FAF8F5] border border-[#E5E0D8]/40 rounded-2xl p-4 hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 transition-all cursor-pointer group"
                    >
                      <span className="text-[9px] font-mono font-bold text-purple-600 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-purple-600" /> Pitch & Cover Letter Focus</span>
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#D97706] transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <p className="text-xs text-[#4E453F] mt-1.5 leading-relaxed font-semibold">
                        {jobMatchResult.cover_letter_focus}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8] border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#4E453F]/60">
                    <Briefcase className="h-10 w-10 text-[#E5E0D8] mb-3" />
                    <p className="font-semibold">No job matcher results loaded.</p>
                    <p className="text-[10px] mt-1 max-w-sm">Paste a new target job description on the left and run analysis to calculate match score and cover letter focus points.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PRE-JOB CHECKLIST */}
          {activeTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Left Selector Sidebar */}
              <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-4 max-h-[460px] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Choose Application</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Select a company to checklist actions</p>
                </div>

                <div className="space-y-2">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedChecklistAppId(app.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${selectedChecklistAppId === app.id
                        ? "bg-[#1C1008] border-[#1C1008] text-white"
                        : "bg-[#FAF8F5] border-[#E5E0D8]/60 text-[#1C1008] hover:bg-[#F5F0E8]"
                        }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-extrabold truncate">{app.position}</p>
                        <p className={`text-[9px] font-mono ${selectedChecklistAppId === app.id ? "text-white/60" : "text-gray-500"}`}>{app.company}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${selectedChecklistAppId === app.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                          {app.status}
                        </span>
                      </div>
                    </button>
                  ))}

                  {applications.length === 0 && (
                    <p className="text-xs text-[#4E453F]/60 italic text-center py-6">
                      No tracked applications. Add one to checklist tasks.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Checklist Details Panel */}
              <div className="md:col-span-7">
                {activeChecklistApp ? (
                  <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8]/60 pb-3">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">
                          Tasks for {activeChecklistApp.company}
                        </h4>
                        <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">
                          {activeChecklistApp.position}
                        </p>
                      </div>

                      {/* Progress Circle & Completion */}
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#1C1008] block font-mono">{activeChecklistProgress}%</span>
                          <span className="text-[8px] font-mono text-[#4E453F]/60 uppercase tracking-wider font-bold">Completed</span>
                        </div>

                        <div className="relative h-10 w-10">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" className="stroke-gray-100 fill-none" strokeWidth="3" />
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              className="stroke-[#D97706] fill-none transition-all duration-300"
                              strokeWidth="3"
                              strokeDasharray="94.2"
                              strokeDashoffset={94.2 * (1 - activeChecklistProgress / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Checklist Task Toggles */}
                    <div className="space-y-3.5">
                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.resume_customized}
                          onChange={() => handleToggleChecklistField("resume_customized")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">Resume Customized</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Integrated key job keywords and tailored experiences</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.cover_letter}
                          onChange={() => handleToggleChecklistField("cover_letter")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">Cover Letter Created</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Drafted customized cover letter matching JD specifications</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.linkedin_updated}
                          onChange={() => handleToggleChecklistField("linkedin_updated")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">LinkedIn Profile Updated</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Profile summary and header optimized for target role visibility</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.portfolio_ready}
                          onChange={() => handleToggleChecklistField("portfolio_ready")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">Portfolio Ready</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Projects page lists matching work showcasing relative tech stack</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.github_updated}
                          onChange={() => handleToggleChecklistField("github_updated")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">GitHub Optimized</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Pinned repositories have clean READMEs and working demos links</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.followup_sent}
                          onChange={() => handleToggleChecklistField("followup_sent")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">Follow-up Message Sent</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Sent short note to recruiter/hiring manager 3-5 days after applying</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E5E0D8]/60 p-3 rounded-2xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeChecklistApp.checklist.interview_scheduled}
                          onChange={() => handleToggleChecklistField("interview_scheduled")}
                          className="h-4.5 w-4.5 text-[#D97706] border-gray-300 rounded focus:ring-[#D97706]/40 cursor-pointer shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1C1008]">Interview Scheduled</p>
                          <p className="text-[9px] text-[#4E453F]/70 font-semibold leading-relaxed">Prep scheduled for technical coding and behavior interview loops</p>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8] border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#4E453F]/60">
                    <Target className="h-10 w-10 text-[#E5E0D8] mb-3" />
                    <p className="font-semibold">No applications selected.</p>
                    <p className="text-[10px] mt-1 max-w-sm">Select an active application from the left panel to review checklist progress.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>

      {/* MODAL WINDOW FOR ADDING NEW APPLICATIONS */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-[#1C1008]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-6 max-w-md w-full premium-shadow space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="text-sm font-extrabold text-[#1C1008] font-display">Add Application Record</h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-[#1C1008] text-xs font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddApplication} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newApp.company}
                    onChange={(e) => setNewApp(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Stripe, Linear, Vercel"
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    value={newApp.position}
                    onChange={(e) => setNewApp(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Status</label>
                    <select
                      value={newApp.status}
                      onChange={(e) => setNewApp(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:outline-none text-[#1C1008] cursor-pointer"
                    >
                      {kanbanColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">ATS Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newApp.ats_score}
                      onChange={(e) => setNewApp(prev => ({ ...prev, ats_score: parseInt(e.target.value) || 70 }))}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Resume Version</label>
                  <select
                    value={newApp.resume_version}
                    onChange={(e) => setNewApp(prev => ({ ...prev, resume_version: e.target.value }))}
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:outline-none text-[#1C1008] cursor-pointer"
                  >
                    {resumeVersions.map(v => (
                      <option key={v.version_name} value={v.version_name}>{v.version_name}</option>
                    ))}
                    <option value="V3_Tailored_React">V3_Tailored_React</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#4E453F] uppercase tracking-wider">Progress Notes</label>
                  <textarea
                    value={newApp.notes}
                    onChange={(e) => setNewApp(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Interview scheduler link received, call scheduled for next Tuesday..."
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#D97706]/40 focus:outline-none text-[#1C1008] h-16 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1C1008] hover:bg-[#1C1008]/90 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Save Application
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIAGNOSTIC DETAIL MODAL */}
      <DiagnosticModal
        isOpen={!!activeDiagnosticDetail}
        onClose={() => setActiveDiagnosticDetail(null)}
        title={activeDiagnosticDetail?.title || ""}
        description={activeDiagnosticDetail?.description || ""}
        details={activeDiagnosticDetail?.details}
        actionItems={activeDiagnosticDetail?.actionItems}
      />

    </section>
  );
}
