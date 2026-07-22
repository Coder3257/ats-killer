import type {
    ResumeId,
    ResumeVersionId,
    ResumeVersionRecord,
    ResumeVersionListQuery,
} from "../types/resumeVersionManagement";

/**
 * Repository is responsible for persistence.
 * In this phase it uses localStorage mock storage.
 *
 * Supabase integration later:
 * - Replace localStorage reads/writes with supabase queries
 * - Keep the repository public methods identical
 */
export class ResumeVersionRepository {
    private static storageKey(userId: string) {
        return `RESUME_VERSION_MGMT_${userId}`;
    }

    private static readAll(userId: string): ResumeVersionRecord[] {
        const fallback = localStorage.getItem(this.storageKey(userId));
        if (!fallback) return [];
        try {
            return JSON.parse(fallback) as ResumeVersionRecord[];
        } catch {
            return [];
        }
    }

    private static writeAll(userId: string, versions: ResumeVersionRecord[]) {
        localStorage.setItem(this.storageKey(userId), JSON.stringify(versions));
    }

    private static nowIso() {
        return new Date().toISOString();
    }

    static async listVersions(userId: string, resumeId: ResumeId, query: ResumeVersionListQuery = {}): Promise<ResumeVersionRecord[]> {
        const all = this.readAll(userId);
        const includeDeleted = query.includeDeleted ?? false;

        const filtered = all.filter(v => {
            if (v.resumeId !== resumeId) return false;
            if (!includeDeleted && v.deletedAt) return false;
            return true;
        });

        // Most recent first
        return filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    static async getActiveVersion(userId: string, resumeId: ResumeId): Promise<ResumeVersionRecord | null> {
        const all = this.readAll(userId);
        const active = all.find(v => v.resumeId === resumeId && v.isActive && !v.deletedAt);
        return active || null;
    }

    static async setActiveVersion(userId: string, versionId: ResumeVersionId): Promise<void> {
        const all = this.readAll(userId);
        const target = all.find(v => v.id === versionId);
        if (!target) return;

        const updated = all.map(v => {
            if (v.resumeId !== target.resumeId) return v;
            // Soft-deleted versions cannot be active
            if (v.deletedAt) return { ...v, isActive: false };
            return { ...v, isActive: v.id === versionId };
        });

        this.writeAll(userId, updated);
    }

    static async renameVersion(userId: string, versionId: ResumeVersionId, nextName: string): Promise<void> {
        const all = this.readAll(userId);
        const updated = all.map(v => (v.id === versionId ? { ...v, versionName: nextName } : v));
        this.writeAll(userId, updated);
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
        const all = this.readAll(params.userId);

        const newVersion: ResumeVersionRecord = {
            id: Math.random().toString(36).substring(2, 10),
            resumeId: params.resumeId,
            userId: params.userId,
            versionName: params.versionName,
            createdAt: this.nowIso(),
            filePath: params.filePath,
            fileSize: params.fileSize,
            atsScore: params.atsScore,
            rawText: params.rawText,
            keywords: params.keywords ?? [],
            skills: params.skills ?? [],
            sections: params.sections ?? [],
            isActive: false,
        };

        all.push(newVersion);

        // If this is the first version, make it active for convenience.
        const activeCount = all.filter(v => v.resumeId === params.resumeId && v.isActive && !v.deletedAt).length;
        if (activeCount === 0) {
            const updated = all.map(v => {
                if (v.resumeId !== params.resumeId) return v;
                if (v.deletedAt) return { ...v, isActive: false };
                return { ...v, isActive: v.id === newVersion.id };
            });
            this.writeAll(params.userId, updated);
            return updated.find(v => v.id === newVersion.id)!;
        }

        this.writeAll(params.userId, all);
        return newVersion;
    }

    static async duplicateVersion(
        userId: string,
        sourceVersionId: ResumeVersionId,
        nextName: string
    ): Promise<ResumeVersionRecord | null> {
        const all = this.readAll(userId);
        const source = all.find(v => v.id === sourceVersionId && !v.deletedAt);
        if (!source) return null;

        const duplicated: ResumeVersionRecord = {
            ...source,
            id: Math.random().toString(36).substring(2, 10),
            versionName: nextName,
            createdAt: this.nowIso(),
            isActive: false,
            parentVersionId: source.id,
        };

        all.push(duplicated);
        this.writeAll(userId, all);
        return duplicated;
    }

    static async deleteVersion(userId: string, versionId: ResumeVersionId): Promise<void> {
        const all = this.readAll(userId);
        const target = all.find(v => v.id === versionId);
        if (!target) return;

        const updated = all.map(v => {
            if (v.id !== versionId) return v;
            return {
                ...v,
                deletedAt: this.nowIso(),
                isActive: false,
            };
        });

        this.writeAll(userId, updated);
    }

    static async restoreVersion(userId: string, versionId: ResumeVersionId): Promise<void> {
        const all = this.readAll(userId);
        const target = all.find(v => v.id === versionId);
        if (!target) return;

        const updated = all.map(v => {
            if (v.id !== versionId) return v;
            return {
                ...v,
                deletedAt: undefined,
                restoredFromVersionId: v.restoredFromVersionId ?? target.id,
                isActive: v.isActive ?? false,
            };
        });

        // If restoring the active version doesn't exist, set restored as active.
        const resumeId = target.resumeId;
        const hasActive = updated.some(v => v.resumeId === resumeId && v.isActive && !v.deletedAt);
        const final = hasActive
            ? updated
            : updated.map(v => (v.id === versionId ? { ...v, isActive: true } : v));

        this.writeAll(userId, final);
    }

    static async getVersion(userId: string, versionId: ResumeVersionId): Promise<ResumeVersionRecord | null> {
        const all = this.readAll(userId);
        return all.find(v => v.id === versionId) || null;
    }

    static async ensureSingleActiveVersion(userId: string, resumeId: ResumeId): Promise<void> {
        const all = this.readAll(userId);
        const active = all.find(v => v.resumeId === resumeId && v.isActive && !v.deletedAt);

        if (active) return;

        const candidate = all
            .filter(v => v.resumeId === resumeId && !v.deletedAt)
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];

        if (!candidate) return;

        const updated = all.map(v => {
            if (v.resumeId !== resumeId) return v;
            return { ...v, isActive: v.id === candidate.id };
        });

        this.writeAll(userId, updated);
    }
}

/**
 * NOTE:
 * mockAuth helpers are in a separate file so the repository
 * can later accept an injected user provider. For now, we
 * keep APIs explicit with userId parameters to avoid hidden logic.
 */
