import { getCopilotChatPrompt } from "../prompts/copilot-chat";
import { getJobMatchingPrompt } from "../prompts/job-matching";
import { getResumeAnalysisPrompt } from "../prompts/resume-analysis";
import { getCopilotChatPrompt as getCopilotChatPromptImpl } from "../prompts/copilot-chat";

type ChatHistoryItem = { sender: "user" | "copilot"; text: string };
type ChatPromptParams = {
    userQuery: string;
    chatHistory: ChatHistoryItem[];
    resume: string;
    knowledgeGraph: any;
    resumeMemory: any[];
    applicationMemory: any[];
    interviewMemory: any[];
};

export class PromptRegistry {
    static getGeminiModel() {
        return "gemini-2.5-flash";
    }

    static buildRewritePrompt(originalText: string, contextDescription: string) {
        return `You are an expert resume optimizer and hiring consultant.
Optimize this specific text/bullet point from a resume:
"${originalText}"

To address the following suggestion/feedback:
"${contextDescription}"

Return ONLY the rewritten, optimized bullet point or text. Do not include markdown formatting, backticks, bullet point prefixes like "-", quotes, or conversational explanations. Just return the clean rewritten string.`;
    }

    static buildResumeAnalysisPrompt(resume: string, jd: string, strict: boolean) {
        return getResumeAnalysisPrompt(resume, jd, strict);
    }

    static buildJobMatchPrompt(resume: string, jd: string) {
        return getJobMatchingPrompt(resume, jd);
    }

    static buildCopilotChatPrompt(params: ChatPromptParams) {
        const {
            userQuery,
            chatHistory,
            resume,
            knowledgeGraph,
            resumeMemory,
            applicationMemory,
            interviewMemory,
        } = params;

        return getCopilotChatPromptImpl(
            userQuery,
            chatHistory,
            resume,
            knowledgeGraph,
            resumeMemory,
            applicationMemory,
            interviewMemory
        );
    }
}
