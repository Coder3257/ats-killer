import { describe, it, expect, beforeEach } from "vitest";
import { useResumeStore } from "../stores/resumeStore";

describe("useResumeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useResumeStore.setState({
      resumes: [],
      loading: false,
      error: null,
    });
    (globalThis as any).setSupabaseClient(null);
  });

  it("should initialize with default states", () => {
    const state = useResumeStore.getState();
    expect(state.resumes).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it("should support uploading and loading resumes in offline mode", async () => {
    // 1. Initial list should be empty
    await useResumeStore.getState().loadResumes("user-1");
    expect(useResumeStore.getState().resumes).toEqual([]);

    // 2. Mock a file upload
    const mockFile = new File(["Experience: Senior Engineer, TypeScript, React"], "my_resume.txt", {
      type: "text/plain",
    });

    await useResumeStore.getState().uploadResume("user-1", mockFile, "Version A");

    // 3. Verify it was added
    const state = useResumeStore.getState();
    expect(state.resumes).toHaveLength(1);
    expect(state.resumes[0].name).toBe("my_resume.txt");
    expect(state.resumes[0].versions).toHaveLength(1);
    expect(state.resumes[0].versions?.[0].version_name).toBe("Version A");
  });
});
