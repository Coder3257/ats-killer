export type ResumeVersionId = string;
export type ResumeId = string;
export type UserId = string;

export interface ResumeVersionRecord {
    id: ResumeVersionId;
    resumeId: ResumeId;
    userId: UserId;

    versionName: string;
    createdAt: string;

    filePath?: string;
    fileSize?: number;

    atsScore: number;

    /**
     * Active version is the version currently selected for downstream analysis.
     */
    isActive: boolean;

    /**
     * Optional raw text content used for comparison intelligence.
     * In production this should come from parsing pipeline.
     */
    rawText?: string;

    /**
     * Parsed artifacts for comparison. Stored so AI/compare can be deterministic and service-owned.
     */
    keywords?: string[];
    skills?: string[];
    sections?: string[];

    /**
     * Soft delete + restore support.
     */
    deletedAt?: string;
    restoredFromVersionId?: ResumeVersionId;

    /**
     * For duplicate/restore lineage tracking.
     */
    parentVersionId?: ResumeVersionId;
}

export interface ResumeVersionComparison {
    versionAId: ResumeVersionId;
    versionBId: ResumeVersionId;

    versionAName: string;
    versionBName: string;

    atsScoreA: number;
    atsScoreB: number;
    atsScoreDiff: number;

    keywordAdded: string[];
    keywordRemoved: string[];

    skillsAdded: string[];
    skillsRemoved: string[];

    sectionsChanged: string[];

    /**
     * AI summary (mock for now). Must be computed by service layer.
     */
    aiSummary: string;
    aiRecommendations: string[];

    /**
     * For UI rendering: a richer view of what changed.
     */
    changeMetrics: {
        keywordsAddedCount: number;
        keywordsRemovedCount: number;
        skillsAddedCount: number;
        skillsRemovedCount: number;
        sectionsChangedCount: number;
    };
}

export interface ResumeVersionListQuery {
    search?: string;
    includeDeleted?: boolean;
}
