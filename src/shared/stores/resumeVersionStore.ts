import { create } from "zustand";
import type {
    ResumeId,
    ResumeVersionId,
    ResumeVersionRecord,
    ResumeVersionComparison,
} from "../types/resumeVersionManagement";
import { ResumeVersionService } from "../services/resumeVersion.service";

interface ResumeVersionState {
    loading: boolean;
    error: string | null;

    /**
     * Versions are scoped per resumeId in the calling context.
     * Store can still keep a flat list; UI can filter by resumeId if needed.
     */
    versions: ResumeVersionRecord[];
    activeVersion: ResumeVersionRecord | null;

    /**
     * Current compare result (optional; UI can also call compare directly).
     */
    comparison: ResumeVersionComparison | null;

    loadVersions: (userId: string, resumeId: ResumeId) => Promise<void>;
    uploadVersion: (params: {
        userId: string;
        resumeId: ResumeId;
        file: File;
        versionName: string;
    }) => Promise<void>;
    renameVersion: (params: {
        userId: string;
        versionId: ResumeVersionId;
        nextName: string;
    }) => Promise<void>;
    duplicateVersion: (params: {
        userId: string;
        sourceVersionId: ResumeVersionId;
        nextName: string;
        makeActive: boolean;
    }) => Promise<void>;
    deleteVersion: (params: { userId: string; versionId: ResumeVersionId }) => Promise<void>;
    restoreVersion: (params: { userId: string; versionId: ResumeVersionId }) => Promise<void>;
    setActiveVersion: (params: { userId: string; versionId: ResumeVersionId }) => Promise<void>;

    compare: (params: {
        userId: string;
        versionAId: ResumeVersionId;
        versionBId: ResumeVersionId;
    }) => Promise<void>;
}

export const useResumeVersionStore = create<ResumeVersionState>((set, get) => ({
    loading: false,
    error: null,

    versions: [],
    activeVersion: null,
    comparison: null,

    loadVersions: async (userId, resumeId) => {
        set({ loading: true, error: null });
        try {
            const versions = await ResumeVersionService.listVersions(userId, resumeId, {
                includeDeleted: false,
            });

            const activeVersion = await ResumeVersionService.getActiveVersion(userId, resumeId);

            set({ versions, activeVersion, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load resume versions.";
            set({ error: message, loading: false });
        }
    },

    uploadVersion: async ({ userId, resumeId, file, versionName }) => {
        set({ loading: true, error: null });
        try {
            // Read file as text for mock comparison artifacts
            const text = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve((e.target?.result as string) || "");
                reader.onerror = () => resolve("");
                reader.readAsText(file.slice(0, 10000));
            });

            // Mock ATS score seeded from file size (stable + deterministic enough for UI)
            const atsScore = Math.max(50, Math.min(95, Math.floor((file.size / 1024) % 50) + 60));

            await ResumeVersionService.uploadVersion({
                userId,
                resumeId,
                versionName,
                filePath: `mock://resumes/${userId}/${resumeId}/${file.name}`,
                fileSize: file.size,
                atsScore,
                rawText: text,
                keywords: ResumeVersionService.extractKeywordsFromTextForMock(text),
                skills: ResumeVersionService.extractSkillsFromTextForMock(text),
                sections: ResumeVersionService.extractSectionsFromTextForMock(text),
            });

            // Reload active + list
            await get().loadVersions(userId, resumeId);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to upload resume version.";
            set({ error: message, loading: false });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    renameVersion: async ({ userId, versionId, nextName }) => {
        set({ loading: true, error: null });
        try {
            await ResumeVersionService.renameVersion(userId, versionId, nextName);
            // Reload is caller-controlled (UI can call loadVersions after update)
            set({ loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to rename version.";
            set({ error: message, loading: false });
            throw err;
        }
    },

    duplicateVersion: async ({ userId, sourceVersionId, nextName, makeActive }) => {
        set({ loading: true, error: null });
        try {
            const dup = await ResumeVersionService.duplicateVersion(userId, sourceVersionId, nextName);
            if (!dup) throw new Error("Source version not found.");

            if (makeActive) {
                await ResumeVersionService.setActiveVersion(userId, dup.id);
            }

            set({ loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to duplicate version.";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteVersion: async ({ userId, versionId }) => {
        set({ loading: true, error: null });
        try {
            await ResumeVersionService.deleteVersion(userId, versionId);
            set({ loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete version.";
            set({ error: message, loading: false });
            throw err;
        }
    },

    restoreVersion: async ({ userId, versionId }) => {
        set({ loading: true, error: null });
        try {
            await ResumeVersionService.restoreVersion(userId, versionId);
            set({ loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to restore version.";
            set({ error: message, loading: false });
            throw err;
        }
    },

    setActiveVersion: async ({ userId, versionId }) => {
        set({ loading: true, error: null });
        try {
            await ResumeVersionService.setActiveVersion(userId, versionId);
            set({ loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to set active version.";
            set({ error: message, loading: false });
            throw err;
        }
    },

    compare: async ({ userId, versionAId, versionBId }) => {
        set({ loading: true, error: null });
        try {
            const comparison = await ResumeVersionService.compareVersions(userId, versionAId, versionBId);
            set({ comparison, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to compare versions.";
            set({ error: message, loading: false });
            throw err;
        }
    },
}));
