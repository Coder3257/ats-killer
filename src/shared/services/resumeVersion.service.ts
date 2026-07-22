import type {
    ResumeId,
    ResumeVersionId,
    ResumeVersionListQuery,
    ResumeVersionRecord,
    ResumeVersionComparison,
} from "../types/resumeVersionManagement";
import { ResumeVersionRepository } from "../repositories/ResumeVersionRepository";

export class ResumeVersionService {
    static extractKeywordsFromTextForMock(text: string): string[] {
        const cleaned = text.toLowerCase();
        const candidates = [
            "typescript",
            "react",
            "node",
            "express",
            "postgres",
            "sql",
            "api",
            "authentication",
            "authorization",
            "testing",
            "jest",
            "vitest",
            "kubernetes",
            "docker",
            "aws",
            "gcp",
            "redis",
            "graphql",
            "next.js",
            "tailwind",
            "supabase",
            "oauth",
            "microservices",
            "system design",
        ];

        return candidates
            .filter(c => cleaned.includes(c))
            .slice(0, 12)
            .map(c => c.replace(/\s+/g, " "));
    }

    static extractSkillsFromTextForMock(text: string): string[] {
        const cleaned = text.toLowerCase();
        const skills = [
            "leadership",
            "communication",
            "ownership",
            "problem solving",
            "system design",
            "data modeling",
            "distributed systems",
            "performance optimization",
            "agile",
            "scrum",
            "mentoring",
            "api design",
            "security",
            "authentication",
            "authorization",
            "testing",
            "unit testing",
            "integration testing",
            "frontend engineering",
            "backend engineering",
        ];

        return skills.filter(s => cleaned.includes(s)).slice(0, 10);
    }

    static extractSectionsFromTextForMock(text: string): string[] {
        const cleaned = text.toLowerCase();
        const sections = [
            "summary",
            "experience",
            "projects",
            "skills",
            "education",
            "certifications",
            "work experience",
            "professional experience",
            "publications",
        ];

        return sections.filter(s => cleaned.includes(s)).slice(0, 8);
    }

    static async listVersions(
        userId: string,
        resumeId: ResumeId,
        query: ResumeVersionListQuery = {}
    ): Promise<ResumeVersionRecord[]> {
        return ResumeVersionRepository.listVersions(userId, resumeId, query);
    }

    static async getActiveVersion(
        userId: string,
        resumeId: ResumeId
    ): Promise<ResumeVersionRecord | null> {
        return ResumeVersionRepository.getActiveVersion(userId, resumeId);
    }

    static async setActiveVersion(
        userId: string,
        versionId: ResumeVersionId
    ): Promise<void> {
        await ResumeVersionRepository.setActiveVersion(userId, versionId);
    }

    static async renameVersion(
        userId: string,
        versionId: ResumeVersionId,
        nextName: string
    ): Promise<void> {
        await ResumeVersionRepository.renameVersion(userId, versionId, nextName);
    }

    static async uploadVersion(params: {
        userId: string;
        resumeId: ResumeId;
        versionName: string;
        filePath?: string;
        fileSize?: number;
        atsScore: number;
        rawText?: string;
        keywords?: string[];
        skills?: string[];
        sections?: string[];
    }): Promise<ResumeVersionRecord> {
        return ResumeVersionRepository.uploadVersion(params);
    }

    static async duplicateVersion(
        userId: string,
        sourceVersionId: ResumeVersionId,
        nextName: string
    ): Promise<ResumeVersionRecord | null> {
        return ResumeVersionRepository.duplicateVersion(userId, sourceVersionId, nextName);
    }

    static async deleteVersion(userId: string, versionId: ResumeVersionId): Promise<void> {
        await ResumeVersionRepository.deleteVersion(userId, versionId);
    }

    static async restoreVersion(userId: string, versionId: ResumeVersionId): Promise<void> {
        await ResumeVersionRepository.restoreVersion(userId, versionId);
    }

    static async getVersion(userId: string, versionId: ResumeVersionId): Promise<ResumeVersionRecord | null> {
        return ResumeVersionRepository.getVersion(userId, versionId);
    }

    /**
     * Comparison logic lives in the service layer (no React).
     * For now this is mock/deterministic based on stored artifacts.
     */
    static async compareVersions(
        userId: string,
        versionAId: ResumeVersionId,
        versionBId: ResumeVersionId
    ): Promise<ResumeVersionComparison> {
        const [a, b] = await Promise.all([
            ResumeVersionRepository.getVersion(userId, versionAId),
            ResumeVersionRepository.getVersion(userId, versionBId),
        ]);

        if (!a) throw new Error("Version A not found.");
        if (!b) throw new Error("Version B not found.");

        const keywordsA = a.keywords ?? [];
        const keywordsB = b.keywords ?? [];
        const skillsA = a.skills ?? [];
        const skillsB = b.skills ?? [];
        const sectionsA = a.sections ?? [];
        const sectionsB = b.sections ?? [];

        const keywordAdded = keywordsB.filter(k => !keywordsA.includes(k));
        const keywordRemoved = keywordsA.filter(k => !keywordsB.includes(k));

        const skillsAdded = skillsB.filter(s => !skillsA.includes(s));
        const skillsRemoved = skillsA.filter(s => !skillsB.includes(s));

        const sectionsChanged = Array.from(
            new Set([...sectionsA, ...sectionsB].filter(s => !sectionsA.includes(s) || !sectionsB.includes(s)))
        );

        const atsScoreA = a.atsScore;
        const atsScoreB = b.atsScore;
        const atsScoreDiff = atsScoreB - atsScoreA;

        const aiSummary = ResumeVersionService.buildMockAiSummary({
            versionAName: a.versionName,
            versionBName: b.versionName,
            atsScoreDiff,
            keywordAdded,
            keywordRemoved,
            skillsAdded,
            skillsRemoved,
            sectionsChanged,
        });

        const aiRecommendations = ResumeVersionService.buildMockRecommendations({
            keywordAdded,
            skillsAdded,
            sectionsChanged,
        });

        return {
            versionAId,
            versionBId,

            versionAName: a.versionName,
            versionBName: b.versionName,

            atsScoreA,
            atsScoreB,
            atsScoreDiff,

            keywordAdded,
            keywordRemoved,

            skillsAdded,
            skillsRemoved,

            sectionsChanged,

            aiSummary,
            aiRecommendations,

            changeMetrics: {
                keywordsAddedCount: keywordAdded.length,
                keywordsRemovedCount: keywordRemoved.length,
                skillsAddedCount: skillsAdded.length,
                skillsRemovedCount: skillsRemoved.length,
                sectionsChangedCount: sectionsChanged.length,
            },
        };
    }

    private static buildMockAiSummary(input: {
        versionAName: string;
        versionBName: string;
        atsScoreDiff: number;
        keywordAdded: string[];
        keywordRemoved: string[];
        skillsAdded: string[];
        skillsRemoved: string[];
        sectionsChanged: string[];
    }): string {
        const diffPrefix = input.atsScoreDiff >= 0 ? "+" : "";
        const added = input.keywordAdded.slice(0, 6);
        const removed = input.keywordRemoved.slice(0, 6);
        const skillsAdded = input.skillsAdded.slice(0, 6);
        const skillsRemoved = input.skillsRemoved.slice(0, 6);

        const sectionPart =
            input.sectionsChanged.length > 0
                ? `Sections changed: ${input.sectionsChanged.slice(0, 4).join(", ")}.`
                : "No notable section structure changes detected.";

        return (
            `Comparing "${input.versionAName}" (${input.versionAName}) with "${input.versionBName}". ` +
            `ATS score delta is ${diffPrefix}${input.atsScoreDiff}. ` +
            `Keyword improvements: ${added.length ? added.join(", ") : "none"}; removals: ${removed.length ? removed.join(", ") : "none"}. ` +
            `Skill additions: ${skillsAdded.length ? skillsAdded.join(", ") : "none"}; removals: ${skillsRemoved.length ? skillsRemoved.join(", ") : "none"}. ` +
            `${sectionPart} Recommendations are based on stored parsed artifacts.`
        );
    }

    private static buildMockRecommendations(input: {
        keywordAdded: string[];
        skillsAdded: string[];
        sectionsChanged: string[];
    }): string[] {
        const recs: string[] = [];

        if (input.keywordAdded.length > 0) {
            recs.push(`Leverage newly added keywords consistently across relevant sections.`);
        } else {
            recs.push(`Consider adding missing role keywords from the target job description to strengthen match.`);
        }

        if (input.skillsAdded.length > 0) {
            recs.push(`Emphasize newly added skills with quantified outcomes to improve recruiter signal.`);
        }

        if (input.sectionsChanged.length > 0) {
            recs.push(`Ensure the updated section structure still maintains ATS-friendly formatting and ordering.`);
        }

        if (recs.length === 0) {
            recs.push(`Run another iteration to refresh keywords/skills alignment for your target role.`);
        }

        return recs.slice(0, 4);
    }
}
