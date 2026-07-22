import type { AnalysisResult, JobMatchResult } from "../../types/geminiAnalyzerTypes";
import { AnalysisResultSchema } from "../schemas/analysisSchema";
import { JobMatchResultSchema } from "../schemas/jobMatchSchema";
import { ResponseParser } from "./ResponseParser";

export class AnalysisMapper {
    static mapAnalysisResult(rawText: string): AnalysisResult {
        const parsed = ResponseParser.parseJson(rawText);
        const validated = AnalysisResultSchema.safeParse(parsed);
        if (!validated.success) {
            throw new Error("AI output failed validation schema.");
        }
        return validated.data;
    }

    static mapJobMatchResult(rawText: string): JobMatchResult {
        const parsed = ResponseParser.parseJson(rawText);
        const validated = JobMatchResultSchema.safeParse(parsed);

        if (!validated.success) {
            // Preserve existing behavior: return safe fallback values at the caller level.
            throw new Error("AI output failed validation schema.");
        }
        return validated.data;
    }
}
