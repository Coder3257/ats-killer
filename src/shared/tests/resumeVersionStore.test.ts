import { describe, it, expect, beforeEach } from "vitest";
import { useResumeVersionStore } from "../stores/resumeVersionStore";

describe("useResumeVersionStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useResumeVersionStore.setState({
      versions: [],
      activeVersion: null,
      comparison: null,
      loading: false,
      error: null,
    });
    (globalThis as any).setSupabaseClient(null);
  });

  it("should initialize with default states", () => {
    const state = useResumeVersionStore.getState();
    expect(state.versions).toEqual([]);
    expect(state.activeVersion).toBeNull();
    expect(state.comparison).toBeNull();
  });

  it("should upload a resume version, load versions, duplicate, rename, setActive, compare and delete version", async () => {
    const userId = "usr-123";
    const resumeId = "res-456";

    // 1. Initial upload
    const mockFile = new File(["Skills: TypeScript, React, Node, Testing"], "resume_v1.txt", {
      type: "text/plain",
    });

    await useResumeVersionStore.getState().uploadVersion({
      userId,
      resumeId,
      file: mockFile,
      versionName: "Initial Version",
    });

    // Verify it is loaded and active (since it's the first one, it becomes active)
    expect(useResumeVersionStore.getState().versions).toHaveLength(1);
    const initialVersion = useResumeVersionStore.getState().versions[0];
    expect(initialVersion.versionName).toBe("Initial Version");
    expect(useResumeVersionStore.getState().activeVersion?.id).toBe(initialVersion.id);

    // 2. Duplicate version
    await useResumeVersionStore.getState().duplicateVersion({
      userId,
      sourceVersionId: initialVersion.id,
      nextName: "Duplicated Version",
      makeActive: false,
    });

    // Reload
    await useResumeVersionStore.getState().loadVersions(userId, resumeId);
    expect(useResumeVersionStore.getState().versions).toHaveLength(2);
    const dupedVersion = useResumeVersionStore.getState().versions.find(v => v.versionName === "Duplicated Version")!;
    expect(dupedVersion).toBeDefined();
    expect(dupedVersion.parentVersionId).toBe(initialVersion.id);

    // 3. Rename version
    await useResumeVersionStore.getState().renameVersion({
      userId,
      versionId: dupedVersion.id,
      nextName: "Renamed Version",
    });
    await useResumeVersionStore.getState().loadVersions(userId, resumeId);
    const renamed = useResumeVersionStore.getState().versions.find(v => v.id === dupedVersion.id)!;
    expect(renamed.versionName).toBe("Renamed Version");

    // 4. Set Active
    await useResumeVersionStore.getState().setActiveVersion({
      userId,
      versionId: renamed.id,
    });
    await useResumeVersionStore.getState().loadVersions(userId, resumeId);
    expect(useResumeVersionStore.getState().activeVersion?.id).toBe(renamed.id);

    // 5. Compare
    await useResumeVersionStore.getState().compare({
      userId,
      versionAId: initialVersion.id,
      versionBId: renamed.id,
    });
    const state = useResumeVersionStore.getState();
    expect(state.comparison).not.toBeNull();
    expect(state.comparison?.atsScoreDiff).toBeDefined();

    // 6. Delete
    await useResumeVersionStore.getState().deleteVersion({
      userId,
      versionId: renamed.id,
    });
    await useResumeVersionStore.getState().loadVersions(userId, resumeId);
    // After deletion, we should only see 1 version (non-deleted)
    expect(useResumeVersionStore.getState().versions).toHaveLength(1);
    expect(useResumeVersionStore.getState().versions[0].id).toBe(initialVersion.id);
  });
});
