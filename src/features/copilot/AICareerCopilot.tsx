import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  History,
  Briefcase,
  Compass,
  Network,
  Send,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Sliders,
  ChevronRight,
  TrendingUp,
  Cpu,
  BookOpen,
  HelpCircle,
  FileText,
  UserCheck,
  Award,
  Layers,
  ArrowUpRight,
  PlusCircle,
} from "lucide-react";
import {
  AnalysisResult,
  ResumeMemoryItem,
  ApplicationMemoryItem,
  InterviewMemoryItem,
  CareerKnowledgeGraph,
  useGeminiAnalyzer,
} from "../../hooks/useGeminiAnalyzer";
import DiagnosticModal from "../../components/DiagnosticModal";
import { useAuth } from "../../shared/contexts/AuthContext";


interface AICareerCopilotProps {
  result: AnalysisResult;
  resume: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
}

export default function AICareerCopilot({ result, resume }: AICareerCopilotProps) {
  const { chatWithCopilot } = useGeminiAnalyzer();
  const { profile } = useAuth();
  const userName = profile?.full_name || "Premium Guest";

  const welcomeMessage = useMemo(() => {
    let msg = result.career_chat?.welcome_message || "Welcome back! I am your AI Career Copilot. How can I guide you today?";
    msg = msg.replace(/\bJohn Doe\b/gi, userName).replace(/\bJohn\b/gi, userName);
    return msg;
  }, [result.career_chat?.welcome_message, userName]);

  // Active sub-section tab
  const [activeTab, setActiveTab] = useState<"chat" | "resumes" | "applications" | "interviews" | "knowledge">("chat");
  const [activeDiagnosticDetail, setActiveDiagnosticDetail] = useState<any>(null);


  // -------------------------------------------------------------
  // STATE DEFINITIONS WITH LOCALSTORAGE SYNCHRONIZATION
  // -------------------------------------------------------------
  
  // Knowledge Graph State
  const [knowledgeGraph, setKnowledgeGraph] = useState<CareerKnowledgeGraph>(() => {
    const saved = localStorage.getItem("ats_killer_knowledge_graph");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return result.knowledge_graph || {
      skills: [],
      projects: [],
      experience_summary: "",
      career_goals: [],
      target_companies: [],
      applications_count: 0,
      achievements: [],
      preferred_roles: [],
    };
  });

  // Resume Memory State
  const [resumeMemory, setResumeMemory] = useState<ResumeMemoryItem[]>(() => {
    const saved = localStorage.getItem("ats_killer_resume_memory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return result.resume_memory || [];
  });

  // Application Memory State
  const [applicationMemory, setApplicationMemory] = useState<ApplicationMemoryItem[]>(() => {
    const saved = localStorage.getItem("ats_killer_application_memory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return result.application_memory || [];
  });

  // Interview Memory State
  const [interviewMemory, setInterviewMemory] = useState<InterviewMemoryItem[]>(() => {
    const saved = localStorage.getItem("ats_killer_interview_memory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return result.interview_memory || [];
  });

  // Chat History state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("ats_killer_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "msg-1",
        sender: "copilot",
        text: welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("ats_killer_knowledge_graph", JSON.stringify(knowledgeGraph));
  }, [knowledgeGraph]);

  useEffect(() => {
    localStorage.setItem("ats_killer_resume_memory", JSON.stringify(resumeMemory));
  }, [resumeMemory]);

  useEffect(() => {
    localStorage.setItem("ats_killer_application_memory", JSON.stringify(applicationMemory));
  }, [applicationMemory]);

  useEffect(() => {
    localStorage.setItem("ats_killer_interview_memory", JSON.stringify(interviewMemory));
  }, [interviewMemory]);

  useEffect(() => {
    localStorage.setItem("ats_killer_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Reset memory states reactively when a new analysis result is loaded
  useEffect(() => {
    if (result) {
      setKnowledgeGraph(result.knowledge_graph || {
        skills: [],
        projects: [],
        experience_summary: "",
        career_goals: [],
        target_companies: [],
        applications_count: 0,
        achievements: [],
        preferred_roles: [],
      });
      setResumeMemory(result.resume_memory || []);
      setApplicationMemory(result.application_memory || []);
      setInterviewMemory(result.interview_memory || []);
      setChatHistory([
        {
          id: "msg-1",
          sender: "copilot",
          text: welcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [result]);

  // Chat Inputs & status
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resume Comparison selection states
  const [compareVersionA, setCompareVersionA] = useState("");
  const [compareVersionB, setCompareVersionB] = useState("");
  const [comparisonResult, setComparisonResult] = useState<{
    scoreDiff: number;
    metrics: string[];
    summary: string;
  } | null>(null);

  // Manual addition inputs
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("Applied");
  const [newNotes, setNewNotes] = useState("");
  const [showAddApplication, setShowAddApplication] = useState(false);

  // Auto-scroll chat window
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  // Handle Dynamic chat query with API
  const handleSendChat = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Format chat history to raw object formats expected by Gemini
      const apiHistory = chatHistory.map(m => ({
        sender: m.sender,
        text: m.text,
      }));

      const reply = await chatWithCopilot(
        text,
        apiHistory,
        resume,
        {
          skills: knowledgeGraph.skills || [],
          projects: knowledgeGraph.projects || [],
          experience_summary: knowledgeGraph.experience_summary || "",
          career_goals: knowledgeGraph.career_goals || [],
          target_companies: knowledgeGraph.target_companies || [],
          applications_count: knowledgeGraph.applications_count ?? 0,
          achievements: knowledgeGraph.achievements || [],
          preferred_roles: knowledgeGraph.preferred_roles || [],
        },
        resumeMemory,
        applicationMemory,
        interviewMemory
      );

      const copilotMsg: ChatMessage = {
        id: `msg-copilot-${Date.now()}`,
        sender: "copilot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory(prev => [...prev, copilotMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        sender: "copilot",
        text: `Error connecting to the service: ${e?.message || "Verify server configuration and network connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Compare two resume versions side-by-side
  const handleCompareVersions = () => {
    const versionA = resumeMemory.find(v => v.version_name === compareVersionA);
    const versionB = resumeMemory.find(v => v.version_name === compareVersionB);

    if (!versionA || !versionB) return;

    const diff = versionB.ats_score - versionA.ats_score;
    const addedKeywords = versionB.improvements.filter(x => !versionA.improvements.includes(x));

    setComparisonResult({
      scoreDiff: diff,
      metrics: addedKeywords.length > 0 ? addedKeywords : ["No additions found"],
      summary: `Comparing ${versionA.version_name} (${versionA.ats_score} score) with ${versionB.version_name} (${versionB.ats_score} score). This shows a score deviation of ${diff >= 0 ? "+" : ""}${diff} points after optimization.`,
    });
  };

  // Add new custom Application Memory log
  const handleAddApplication = () => {
    if (!newCompany || !newRole) return;
    const newItem: ApplicationMemoryItem = {
      id: `app-custom-${Date.now()}`,
      company: newCompany,
      role: newRole,
      resume_version: resumeMemory[0]?.version_name || "V1_Core",
      status: newStatus,
      interview_notes: newNotes,
    };
    setApplicationMemory(prev => [newItem, ...prev]);
    setNewCompany("");
    setNewRole("");
    setNewNotes("");
    setShowAddApplication(false);
  };

  // Delete application record
  const handleDeleteApplication = (id: string) => {
    setApplicationMemory(prev => prev.filter(a => a.id !== id));
  };

  // Custom Markdown renderer function
  const renderMarkdown = (text: string) => {
    // Process code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```[a-zA-Z]*/, "").replace(/```$/, "").trim();
        return (
          <pre key={index} className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] overflow-x-auto my-2 border border-stone-800 leading-normal">
            <code>{code}</code>
          </pre>
        );
      }

      // Format bullet points, bolding, and headers line by line
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-1">
          {lines.map((line, lIdx) => {
            let processedLine = line;

            // Handle headers e.g. ### Header
            if (processedLine.startsWith("###")) {
              return (
                <h5 key={lIdx} className="text-xs font-extrabold text-[#1C1008] font-display mt-3 mb-1">
                  {processedLine.replace(/^###\s*/, "")}
                </h5>
              );
            }
            if (processedLine.startsWith("##")) {
              return (
                <h4 key={lIdx} className="text-sm font-extrabold text-[#1C1008] font-display mt-4 mb-2">
                  {processedLine.replace(/^##\s*/, "")}
                </h4>
              );
            }

            // Handle bullet items
            if (processedLine.trim().startsWith("- ") || processedLine.trim().startsWith("* ")) {
              const cleanLine = processedLine.trim().replace(/^[-*]\s*/, "");
              return (
                <ul key={lIdx} className="list-disc list-inside text-xs pl-2 text-stone-700 leading-relaxed font-semibold">
                  <li>{cleanLine.split("**").map((chunk, cIdx) => cIdx % 2 === 1 ? <strong key={cIdx} className="text-[#1C1008]">{chunk}</strong> : chunk)}</li>
                </ul>
              );
            }

            // Normal text with bold handling
            const chunks = processedLine.split("**");
            return (
              <p key={lIdx} className="text-xs text-[#4E453F] leading-relaxed font-semibold">
                {chunks.map((chunk, cIdx) => cIdx % 2 === 1 ? <strong key={cIdx} className="text-[#1C1008]">{chunk}</strong> : chunk)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="border-t border-[#E5E0D8] pt-12 mt-12 px-4 sm:px-6 space-y-12">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase bg-purple-100 px-3 py-1 rounded-full border border-purple-600/20 inline-block">
          AI Career Copilot™
        </span>
        <h3 className="text-2xl font-display font-extrabold text-[#1C1008] tracking-tight">
          AI Copilot Hub
        </h3>
        <p className="text-xs text-[#4E453F] leading-relaxed font-semibold">
          An interactive, highly personalized companion that aggregates your applications, interview notes, and skill portfolios to assist you contextually.
        </p>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-[#E5E0D8]/50 pb-px overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("chat")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "chat"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> AI Chat
        </button>

        <button
          onClick={() => setActiveTab("resumes")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "resumes"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          <History className="h-4 w-4" /> Resume Memory
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "applications"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Application Memory
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "interviews"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          <Compass className="h-4 w-4" /> Interview Memory
        </button>

        <button
          onClick={() => setActiveTab("knowledge")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "knowledge"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-[#4E453F] hover:text-[#1C1008]"
          }`}
        >
          <Network className="h-4 w-4" /> Knowledge Graph
        </button>
      </div>

      {/* ACTIVE WINDOW AREA */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: COPILOT CHAT WORKSPACE */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-[#E5E0D8] rounded-3xl premium-shadow overflow-hidden flex flex-col h-[500px]"
            >
              
              {/* Messages feed */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F5]/30">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%] space-y-1">
                      <div
                        className={`rounded-2xl p-4 text-xs font-semibold ${
                          msg.sender === "user"
                            ? "bg-[#1C1008] text-white rounded-tr-none"
                            : "bg-[#FAF8F5] border border-[#E5E0D8] text-[#1C1008] rounded-tl-none"
                        }`}
                      >
                        {msg.sender === "copilot" ? (
                          <div className="space-y-1.5">{renderMarkdown(msg.text)}</div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                      </div>
                      <span className="text-[8px] text-stone-400 block px-1 text-right">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions row */}
              <div className="border-t border-[#E5E0D8]/60 p-3 bg-[#FAF8F5]/50 flex gap-2 overflow-x-auto">
                {[
                  "Improve Resume",
                  "Compare Resume Versions",
                  "Analyze Job Description",
                  "Generate Cover Letter",
                  "Prepare Interview",
                  "Career Advice",
                  "Salary Advice",
                  "Skill Roadmap"
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleSendChat(`I'd like to trigger task: ${action}`)}
                    className="bg-white border border-[#E5E0D8] rounded-full px-3 py-1.5 text-[10px] font-bold text-[#1C1008] hover:bg-[#F5F0E8] transition-all cursor-pointer shrink-0"
                  >
                    🚀 {action}
                  </button>
                ))}
              </div>

              {/* Chat Input panel */}
              <div className="border-t border-[#E5E0D8] p-4 bg-white flex gap-3 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat(chatInput)}
                  placeholder="Ask your Copilot about your applications, weak skills, or test comparisons..."
                  disabled={chatLoading}
                  className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#D97706] text-[#1C1008]"
                />
                
                <button
                  onClick={() => handleSendChat(chatInput)}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-[#1C1008] hover:bg-[#1C1008]/80 text-white rounded-2xl p-3 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

            </motion.div>
          )}

          {/* TAB 2: RESUME VERSION MEMORY */}
          {activeTab === "resumes" && (
            <motion.div
              key="resumes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Resume Version list */}
              <div className="md:col-span-6 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Version History Memory</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Logs of drafts analyzed and optimized</p>
                </div>

                <div className="space-y-3">
                  {resumeMemory.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveDiagnosticDetail({
                        title: `Resume Version Memory: ${item.version_name}`,
                        description: `This version was analyzed on ${item.date}.`,
                        details: [
                          `ATS compatibility score: ${item.ats_score}/100`,
                          `Notes: ${item.notes || "None"}`
                        ],
                        actionItems: item.improvements.map(imp => `Completed improvement: ${imp}`)
                      })}
                      className="bg-[#FAF8F5] border border-[#E5E0D8]/60 p-4 rounded-2xl space-y-3 cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-extrabold text-[#1C1008]">{item.version_name}</span>
                        <span className="text-[9px] font-mono font-extrabold text-stone-400">{item.date}</span>
                      </div>

                      <div className="flex gap-4 items-baseline">
                        <div>
                          <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">ATS Score</p>
                          <p className="text-lg font-display font-extrabold text-[#1C1008]">{item.ats_score}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-bold">Modifications</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.improvements.map((imp, i) => (
                              <span key={i} className="bg-white border border-gray-100 px-2 py-0.5 rounded text-[8px] font-semibold text-stone-600">
                                {imp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-[9px] text-[#4E453F] italic leading-relaxed border-t border-[#E5E0D8]/40 pt-2 font-semibold">
                        Notes: {item.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Comparison tool */}
              <div className="md:col-span-6 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Version Comparison Engine</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Compare any two resume versions side-by-side</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-bold block mb-1">Version A</label>
                    <select
                      value={compareVersionA}
                      onChange={(e) => setCompareVersionA(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1008] focus:outline-none"
                    >
                      <option value="">Select version...</option>
                      {resumeMemory.map(v => (
                        <option key={v.version_name} value={v.version_name}>{v.version_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-bold block mb-1">Version B</label>
                    <select
                      value={compareVersionB}
                      onChange={(e) => setCompareVersionB(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1008] focus:outline-none"
                    >
                      <option value="">Select version...</option>
                      {resumeMemory.map(v => (
                        <option key={v.version_name} value={v.version_name}>{v.version_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCompareVersions}
                  disabled={!compareVersionA || !compareVersionB}
                  className="w-full bg-[#1C1008] text-white text-xs font-bold rounded-2xl py-3 cursor-pointer hover:bg-[#1C1008]/80 transition-all disabled:opacity-50"
                >
                  Analyze Score Difference
                </button>

                {comparisonResult && (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8]/60 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-baseline border-b border-[#E5E0D8]/40 pb-2">
                      <span className="text-xs font-extrabold text-[#1C1008]">Score Delta</span>
                      <span className={`text-sm font-mono font-extrabold ${comparisonResult.scoreDiff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {comparisonResult.scoreDiff >= 0 ? "+" : ""}{comparisonResult.scoreDiff}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#4E453F] leading-relaxed font-semibold">
                      {comparisonResult.summary}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider font-bold">Added Keywords in B</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {comparisonResult.metrics.map((k, i) => (
                          <span key={i} className="bg-[#D1FAE5] text-[#065F46] border border-[#10B981]/20 px-2 py-0.5 rounded text-[8px] font-extrabold">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          )}

          {/* TAB 3: APPLICATION MEMORY */}
          {activeTab === "applications" && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Application Memory History</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Structured cache logs referencing resume drafts sent</p>
                </div>

                <button
                  onClick={() => setShowAddApplication(!showAddApplication)}
                  className="bg-[#1C1008] hover:bg-[#1C1008]/80 text-white text-[10px] font-bold rounded-xl px-3.5 py-2 cursor-pointer flex items-center gap-1 transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Log Application
                </button>
              </div>

              {/* Add Application dropdown pane */}
              {showAddApplication && (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block mb-1">Company</label>
                    <input
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Stripe"
                      className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none w-full text-[#1C1008]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block mb-1">Role</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Backend Developer"
                      className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none w-full text-[#1C1008]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1008] focus:outline-none w-full"
                    >
                      <option value="Applied">Applied</option>
                      <option value="OA">OA</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddApplication}
                    className="bg-[#1C1008] text-white text-xs font-bold rounded-xl py-2 cursor-pointer hover:bg-[#1C1008]/80 transition-all w-full"
                  >
                    Confirm Log
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applicationMemory.map((app) => (
                  <div 
                    key={app.id} 
                    onClick={() => setActiveDiagnosticDetail({
                      title: `Application Memory: ${app.company}`,
                      description: `Tracked application for ${app.role}.`,
                      details: [
                        `Status: ${app.status}`,
                        `Resume version sent: ${app.resume_version || "Not specified"}`
                      ],
                      actionItems: [
                        `Notes: ${app.interview_notes || "No notes logged yet."}`
                      ]
                    })}
                    className="bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow flex justify-between relative hover:shadow-md hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/10 hover:-translate-y-[2px] transition-all cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div>
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          app.status === "Interview"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : app.status === "Offer"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-[#FAF8F5] text-stone-600 border-stone-200"
                        }`}>
                          {app.status}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#1C1008] font-display mt-2">{app.company}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold">{app.role}</p>
                      </div>

                      <div className="text-[10px] space-y-1 leading-normal font-semibold">
                        <p className="text-stone-700"><strong className="text-[#1C1008]">Version Used:</strong> {app.resume_version}</p>
                        <p className="text-stone-500 italic"><strong className="text-[#1C1008] not-italic">Notes:</strong> {app.interview_notes}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteApplication(app.id);
                      }}
                      className="text-stone-300 hover:text-rose-600 shrink-0 cursor-pointer self-start p-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* TAB 4: INTERVIEW MEMORY & PLANNER */}
          {activeTab === "interviews" && (
            <motion.div
              key="interviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Left: Interview logs list */}
              <div className="md:col-span-7 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Interview Memory logs</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Historical logs of technical and behavioral questions asked</p>
                </div>

                <div className="space-y-4">
                  {interviewMemory.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveDiagnosticDetail({
                        title: `Interview Memory: ${item.company}`,
                        description: `Interview rounds: ${item.rounds.join(" → ")}. Date: ${item.date}`,
                        details: [
                          ...item.technical_questions.map(q => `Technical: "${q}"`),
                          ...item.behavioral_questions.map(q => `Behavioral: "${q}"`)
                        ],
                        actionItems: [
                          `Copilot Feedback: ${item.feedback}`,
                          `Weak areas to target: ${item.weak_areas.join(", ")}`
                        ]
                      })}
                      className="bg-[#FAF8F5] border border-[#E5E0D8]/60 p-5 rounded-2xl space-y-4 cursor-pointer hover:border-[#D97706]/40 hover:bg-[#F5F0E8]/40 hover:-translate-y-[2px] transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#E5E0D8]/40 pb-2">
                        <div>
                          <span className="text-xs font-extrabold text-[#1C1008]">{item.company}</span>
                          <span className="text-[9px] text-[#4E453F] font-semibold block mt-0.5">{item.rounds.join(" → ")}</span>
                        </div>
                        <span className="text-[9px] font-mono text-stone-400 font-bold uppercase self-start sm:self-auto shrink-0">{item.date}</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed font-semibold">
                        <div className="space-y-1">
                          <p className="text-[9px] font-mono text-[#D97706] uppercase tracking-wider font-extrabold">Technical Questions</p>
                          {item.technical_questions.map((q, i) => (
                            <p key={i} className="text-stone-700 pl-2 border-l border-amber-200">"{q}"</p>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[9px] font-mono text-purple-600 uppercase tracking-wider font-extrabold">Behavioral Questions</p>
                          {item.behavioral_questions.map((q, i) => (
                            <p key={i} className="text-stone-700 pl-2 border-l border-purple-200">"{q}"</p>
                          ))}
                        </div>

                        <div className="border-t border-[#E5E0D8]/40 pt-3">
                          <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold">Copilot Feedback</p>
                          <p className="text-[#4E453F] mt-1">{item.feedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: AI Planner based on weak areas */}
              <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-5 premium-shadow space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">AI Interview Planner</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Personalized preparation schedules based on weak areas</p>
                </div>

                <div className="bg-[#FAF8F5] border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">Identified Weak Areas</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {interviewMemory.flatMap(m => m.weak_areas).map((area, idx) => (
                        <span key={idx} className="bg-white border border-gray-100 text-[#1C1008] text-[8px] font-mono font-bold px-2 py-1 rounded">
                          ⚠️ {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-[#E5E0D8]/40">
                    <div className="space-y-1 text-xs">
                      <p className="font-extrabold text-[#1C1008]">Plan Priority 1: Coding Drill</p>
                      <p className="text-[10px] text-[#4E453F] leading-relaxed font-semibold">Review Redis connection pooling configurations and practice distributed locking code drills.</p>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <p className="font-extrabold text-[#1C1008]">Plan Priority 2: System Design Case</p>
                      <p className="text-[10px] text-[#4E453F] leading-relaxed font-semibold">Study database indexing sharding schemes to counter database bottlenecks during interview loops.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendChat("Generate an interview prep plan for my upcoming Stripe rounds focusing on Redis caching and database partitioning.")}
                    className="w-full bg-[#1C1008] hover:bg-[#1C1008]/80 text-white text-xs font-bold rounded-xl py-3.5 mt-2 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" /> Trigger Prep Plan Chat
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 5: CAREER KNOWLEDGE GRAPH */}
          {activeTab === "knowledge" && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-6 premium-shadow space-y-6"
            >
              
              <div className="border-b border-[#E5E0D8]/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#1C1008] uppercase tracking-wider">Career Knowledge Graph Summary</h4>
                  <p className="text-[10px] text-[#4E453F] font-semibold mt-0.5">Your structured profile index that personalizes Copilot responses</p>
                </div>
                
                <span className="text-[10px] font-mono font-extrabold text-[#D97706] bg-[#FEF3C7] border border-[#D97706]/20 px-2.5 py-0.5 rounded self-start sm:self-auto shrink-0">
                  Status: Synchronized
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                 {/* Profile attributes */}
                 <div className="space-y-5 text-xs font-semibold">
                   <div 
                     onClick={() => setActiveDiagnosticDetail({
                       title: "Professional Summary Gaps",
                       description: "AI feedback on your professional summary's impact metrics and tone alignment.",
                       details: [
                         `Summary content: "${knowledgeGraph.experience_summary}"`
                       ],
                       actionItems: [
                         "Include more quantifiable metrics like efficiency gains, revenue increases, or scale dimensions.",
                         "Ensure all target role keywords are organically woven into the text."
                       ]
                     })}
                     className="space-y-1 cursor-pointer group"
                   >
                     <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold group-hover:text-[#D97706]">Professional Summary</p>
                     <p className="text-[#1C1008] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-gray-50 group-hover:border-[#D97706]/40 group-hover:bg-[#F5F0E8]/40 transition-all">{knowledgeGraph.experience_summary}</p>
                   </div>
 
                   <div className="grid grid-cols-2 gap-4">
                     <div 
                       onClick={() => setActiveDiagnosticDetail({
                         title: "Target Companies Strategy",
                         description: "How your resume compares to target employer engineering standards.",
                         details: knowledgeGraph.target_companies.map(c => `Target Employer: ${c}`),
                         actionItems: [
                           "Analyze employee profiles at these companies to match design pattern keywords.",
                           "Tailor projects to match the scale used by these target engineering organizations."
                         ]
                       })}
                       className="space-y-2 cursor-pointer group p-2 rounded-2xl hover:bg-[#F5F0E8]/40 transition-all"
                     >
                       <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold group-hover:text-[#D97706]">Target Companies</p>
                       <div className="flex flex-wrap gap-1">
                         {knowledgeGraph.target_companies.map((c, i) => (
                           <span key={i} className="bg-[#FAF8F5] border border-[#E5E0D8]/60 text-[#1C1008] text-[8px] font-mono font-bold px-2 py-1 rounded">
                             {c}
                           </span>
                         ))}
                       </div>
                     </div>
 
                     <div 
                       onClick={() => setActiveDiagnosticDetail({
                         title: "Career Goals & Milestones",
                         description: "Roadmap progression parameters based on your target positions.",
                         details: knowledgeGraph.career_goals.map(g => `Target Objective: ${g}`),
                         actionItems: [
                           "Review skills index gaps to identify missing seniority competencies.",
                           "Optimize bullet points to reflect higher levels of ownership and leadership."
                         ]
                       })}
                       className="space-y-2 cursor-pointer group p-2 rounded-2xl hover:bg-[#F5F0E8]/40 transition-all"
                     >
                       <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold group-hover:text-purple-600">Career Goals</p>
                       <div className="flex flex-wrap gap-1">
                         {knowledgeGraph.career_goals.map((g, i) => (
                           <span key={i} className="bg-purple-50 border border-purple-100 text-purple-700 text-[8px] font-mono font-bold px-2 py-1 rounded">
                             {g}
                           </span>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
 
                 {/* Skills tags and Core achievements */}
                 <div className="space-y-5 text-xs font-semibold">
                   <div 
                     onClick={() => setActiveDiagnosticDetail({
                       title: "Skills Index Calibration",
                       description: "Your compiled core keywords matched from historical scans.",
                       details: knowledgeGraph.skills.map(s => `Indexed Skill: ${s}`),
                       actionItems: [
                         "Add missing critical skills flagged in the Career Intelligence tab.",
                         "Practice mock interview coding drills for each technical tag listed."
                       ]
                     })}
                     className="space-y-2 cursor-pointer group p-2 rounded-2xl hover:bg-[#F5F0E8]/40 transition-all"
                   >
                     <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold group-hover:text-[#D97706]">Skills Index Tags</p>
                     <div className="flex flex-wrap gap-1">
                       {knowledgeGraph.skills.map((s, i) => (
                         <span key={i} className="bg-white border border-[#E5E0D8] text-[#1C1008] text-[8px] font-mono font-bold px-2.5 py-1 rounded-lg">
                           {s}
                         </span>
                       ))}
                     </div>
                   </div>
 
                   <div 
                     onClick={() => setActiveDiagnosticDetail({
                       title: "Achievements Veracity Check",
                       description: "How well your key achievements stand out to hiring managers.",
                       details: knowledgeGraph.achievements,
                       actionItems: [
                         "Re-phrase achievements using the XYZ formula (Accomplished X, measured by Y, by doing Z).",
                         "Make sure to highlight actual business impact, not just completed tasks."
                       ]
                     })}
                     className="space-y-2 cursor-pointer group p-2 rounded-2xl hover:bg-[#F5F0E8]/40 transition-all"
                   >
                     <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider font-extrabold group-hover:text-[#D97706]">Key Achievements Logged</p>
                     <div className="space-y-2">
                       {knowledgeGraph.achievements.map((ach, i) => (
                         <div key={i} className="bg-[#FAF8F5] border border-gray-100 p-2.5 rounded-xl flex items-center gap-2 text-stone-700 font-semibold text-[10px]">
                           <Award className="h-4 w-4 text-[#D97706] shrink-0" />
                           <span>{ach}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
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
