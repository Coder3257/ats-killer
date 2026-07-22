import type {
    AnalysisResult,
    JobMatchResult,
    CareerKnowledgeGraph,
    ResumeMemoryItem,
    ApplicationMemoryItem,
    InterviewMemoryItem,
    AnalysisResult as _AnalysisResult,
    JobMatchResult as _JobMatchResult,
} from "../../types/geminiAnalyzerTypes";
import { TokenEstimator } from "./TokenEstimator";
import { PromptRegistry } from "./PromptRegistry";
import { ResponseParser } from "./ResponseParser";
import { AnalysisMapper } from "./AnalysisMapper";
import { RetryHandler } from "./RetryHandler";
import { GeminiProvider } from "./GeminiProvider";

export class AIService {
    static async rewriteBullet(
        originalText: string,
        contextDescription: string,
        apiKey: string
    ): Promise<string> {
        const cleanKey = apiKey?.trim() || "";
        if (!cleanKey) throw new Error("Gemini API key is required.");

        const promptText = PromptRegistry.buildRewritePrompt(originalText, contextDescription);

        // Optional: estimator only, must not affect behavior.
        TokenEstimator.estimatePromptSize(promptText);

        const response = await GeminiProvider.generateContent({
            apiKey: cleanKey,
            model: PromptRegistry.getGeminiModel(),
            contents: promptText,
        });

        return ResponseParser.normalizeText(response.text);
    }

    static async analyze(resume: string, jd: string, apiKey: string): Promise<AnalysisResult> {
        const cleanKey = apiKey?.trim() || "";
        if (!resume || resume.trim().length < 50) {
            throw new Error("Please enter a valid resume (at least 50 characters).");
        }
        if (!jd || jd.trim().length < 50) {
            throw new Error("Please enter a valid job description (at least 50 characters).");
        }
        if (!cleanKey) throw new Error("Gemini API key is required.");

        const call = async (strict: boolean): Promise<AnalysisResult> => {
            const promptText = PromptRegistry.buildResumeAnalysisPrompt(resume, jd, strict);

            TokenEstimator.estimatePromptSize(promptText);

            const response = await GeminiProvider.generateContent({
                apiKey: cleanKey,
                model: PromptRegistry.getGeminiModel(),
                contents: promptText,
            });

            return AnalysisMapper.mapAnalysisResult(response.text);
        };

        try {
            return await call(false);
        } catch (err) {
            if (!RetryHandler.shouldRetryOnce(err)) throw err;
            // Retry once with stricter prompt
            return await call(true);
        }
    }

    static async analyzeJobMatch(resume: string, targetJd: string, apiKey: string): Promise<JobMatchResult> {
        const cleanKey = apiKey?.trim() || "";
        if (!cleanKey) throw new Error("Gemini API key is required.");

        const call = async (): Promise<JobMatchResult> => {
            const promptText = PromptRegistry.buildJobMatchPrompt(resume, targetJd);

            TokenEstimator.estimatePromptSize(promptText);

            const response = await GeminiProvider.generateContent({
                apiKey: cleanKey,
                model: PromptRegistry.getGeminiModel(),
                contents: promptText,
            });

            // Preserve prior behavior: hook returned fallback values on validation failure.
            // Here we mirror that: catch mapping/validation failure and return fallback.
            try {
                return AnalysisMapper.mapJobMatchResult(response.text);
            } catch {
                return {
                    compatibility_score: 50,
                    missing_skills: [],
                    strengths: [],
                    est_prep_time: "Unknown",
                    recommended_version: "V1_Core",
                    cover_letter_focus: "Pitch standard background achievements."
                };
            }
        };

        return call();
    }

    static async chatWithCopilot(
        userQuery: string,
        chatHistory: { sender: "user" | "copilot"; text: string }[],
        resume: string,
        knowledgeGraph: CareerKnowledgeGraph,
        resumeMemory: ResumeMemoryItem[],
        applicationMemory: ApplicationMemoryItem[],
        interviewMemory: InterviewMemoryItem[],
        apiKey: string
    ): Promise<string> {
        const cleanKey = apiKey?.trim() || "";
        if (!cleanKey) throw new Error("Gemini API key is required.");

        const promptText = PromptRegistry.buildCopilotChatPrompt({
            userQuery,
            chatHistory,
            resume,
            knowledgeGraph,
            resumeMemory,
            applicationMemory,
            interviewMemory,
        });

        TokenEstimator.estimatePromptSize(promptText);

        const response = await GeminiProvider.generateContent({
            apiKey: cleanKey,
            model: PromptRegistry.getGeminiModel(),
            contents: promptText,
        });

        return response.text || "I was unable to retrieve a response from Gemini.";
    }
}
