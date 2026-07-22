// src/shared/services/prompts/copilot-chat.ts

export function getCopilotChatPrompt(
  userQuery: string,
  chatHistory: { sender: "user" | "copilot"; text: string }[],
  resume: string,
  knowledgeGraph: any,
  resumeMemory: any[],
  applicationMemory: any[],
  interviewMemory: any[]
): string {
  return `You are the AI Career Copilot for ATS Killer. You have access to the user's complete career history, resume, applications, and interview logs. Use this context to answer their query in a highly customized, helpful, and personal manner. Avoid generic resume advice. Answer directly to their context.

RESUME CONTENT:
${resume}

CAREER KNOWLEDGE GRAPH:
${JSON.stringify(knowledgeGraph, null, 2)}

RESUME MEMORY:
${JSON.stringify(resumeMemory, null, 2)}

APPLICATION MEMORY:
${JSON.stringify(applicationMemory, null, 2)}

INTERVIEW MEMORY:
${JSON.stringify(interviewMemory, null, 2)}

CHAT HISTORY:
${chatHistory.map(m => `${m.sender === "user" ? "User" : "Copilot"}: ${m.text}`).join("\n")}

User Query: "${userQuery}"

Provide a detailed markdown response. Use bold text, lists, and tables where appropriate. If they ask to compare versions, analyze applications, prepare for interviews, or general career advice, pull directly from the supplied history datasets. Do not mention that you have JSON datasets; address them naturally as their career assistant.`;
}
