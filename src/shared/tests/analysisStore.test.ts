import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnalysisStore } from "../stores/analysisStore";

describe("useAnalysisStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAnalysisStore.setState({
      history: [],
      currentResult: null,
      loading: false,
      error: null,
    });
    (globalThis as any).setSupabaseClient(null);
  });

  it("should start with default states", () => {
    const state = useAnalysisStore.getState();
    expect(state.history).toEqual([]);
    expect(state.currentResult).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("should run analysis successfully and update store state", async () => {
    const mockResult = {
      score: 85,
      recruiter_eyes: {
        first_noticed: ["TypeScript experience"],
        ignored_items: [],
        skipped_sections: [],
        strongest_section: "Experience",
        weakest_section: "Education",
        estimated_reading_time: "6 seconds",
        verdict: "Interview recommended",
        interview_probability: 75,
      },
      career_roadmap: {
        short_term_gaps: ["Kubernetes"],
      },
      opportunity_engine: {
        recommended_roles: ["Senior Frontend Engineer"],
      },
      career_dashboard: {
        metrics: { ats_alignment: 85 },
      },
    };

    // Mock fetch API response
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );
    globalThis.fetch = mockFetch as any;

    const result = await useAnalysisStore
      .getState()
      .runAnalysis("user-abc", "version-123", "Resume content here", "Job description here", "mock-api-key");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);

    const state = useAnalysisStore.getState();
    expect(state.currentResult).toEqual(mockResult);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();

    // Verify history persistence in local storage fallback
    await useAnalysisStore.getState().loadHistory("user-abc");
    expect(useAnalysisStore.getState().history).toHaveLength(1);
    expect(useAnalysisStore.getState().history[0].ats_score).toBe(85);
  });

  it("should handle error when api call fails", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Internal server error"),
      })
    );
    globalThis.fetch = mockFetch as any;

    await expect(
      useAnalysisStore
        .getState()
        .runAnalysis("user-abc", "version-123", "Resume content", "JD content", "mock-key")
    ).rejects.toThrow("Internal server error");

    const state = useAnalysisStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Internal server error");
  });
});
