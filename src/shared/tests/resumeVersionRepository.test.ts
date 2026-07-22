import { describe, it, expect, beforeEach } from "vitest";
import { ResumeVersionRepository } from "../repositories/ResumeVersionRepository";

describe("ResumeVersionRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should support full version lifecycle including upload, list, active toggle, duplicate, delete, restore and single active version constraints", async () => {
    const userId = "user-1";
    const resumeId = "resume-1";

    // 1. Initially empty
    let list = await ResumeVersionRepository.listVersions(userId, resumeId);
    expect(list).toEqual([]);

    // 2. Upload first version (should be made active automatically because active count is 0)
    const v1 = await ResumeVersionRepository.uploadVersion({
      userId,
      resumeId,
      versionName: "V1",
      atsScore: 80,
      rawText: "First version content",
    });
    expect(v1.versionName).toBe("V1");
    expect(v1.isActive).toBe(true);

    // Verify it is active
    let active = await ResumeVersionRepository.getActiveVersion(userId, resumeId);
    expect(active?.id).toBe(v1.id);

    // 3. Upload second version
    const v2 = await ResumeVersionRepository.uploadVersion({
      userId,
      resumeId,
      versionName: "V2",
      atsScore: 90,
      rawText: "Second version content",
    });
    expect(v2.versionName).toBe("V2");
    expect(v2.isActive).toBe(false); // only the first version is active automatically

    // 4. Duplicate version
    const dup = await ResumeVersionRepository.duplicateVersion(userId, v2.id, "V2 Copy");
    expect(dup).not.toBeNull();
    expect(dup?.versionName).toBe("V2 Copy");
    expect(dup?.parentVersionId).toBe(v2.id);

    // List all
    list = await ResumeVersionRepository.listVersions(userId, resumeId);
    expect(list).toHaveLength(3); // V1, V2, V2 Copy

    // 5. Set active
    await ResumeVersionRepository.setActiveVersion(userId, v2.id);
    active = await ResumeVersionRepository.getActiveVersion(userId, resumeId);
    expect(active?.id).toBe(v2.id);

    // Verify V1 is no longer active
    const oldV1 = await ResumeVersionRepository.getVersion(userId, v1.id);
    expect(oldV1?.isActive).toBe(false);

    // 6. Delete version
    await ResumeVersionRepository.deleteVersion(userId, v2.id);
    list = await ResumeVersionRepository.listVersions(userId, resumeId);
    expect(list).toHaveLength(2); // V2 is soft-deleted, list excludes it by default

    // Verify it's not active anymore
    active = await ResumeVersionRepository.getActiveVersion(userId, resumeId);
    expect(active).toBeNull();

    // 7. Ensure single active version (should select the most recent non-deleted version to become active)
    await ResumeVersionRepository.ensureSingleActiveVersion(userId, resumeId);
    active = await ResumeVersionRepository.getActiveVersion(userId, resumeId);
    expect(active).not.toBeNull();
    expect(active?.isActive).toBe(true);

    // 8. Restore version
    await ResumeVersionRepository.restoreVersion(userId, v2.id);
    list = await ResumeVersionRepository.listVersions(userId, resumeId, { includeDeleted: true });
    const restored = list.find(v => v.id === v2.id);
    expect(restored?.deletedAt).toBeUndefined();
  });
});
