import { supabase } from "./supabase/client";

export class CopilotService {
  static async sendMessage(
    query: string,
    history: { sender: "user" | "copilot"; text: string }[],
    resumeText: string,
    knowledgeGraph: any,
    resumeMemory: any[],
    applicationMemory: any[],
    interviewMemory: any[],
    apiKey: string
  ): Promise<string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        history,
        resumeText,
        knowledgeGraph,
        resumeMemory,
        applicationMemory,
        interviewMemory,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Copilot Chat request failed.");
    }

    const data = await response.json();
    return data.reply || "No reply returned from assistant.";
  }
}
