import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeminiAnalyzer } from "../hooks/useGeminiAnalyzer";

describe("useGeminiAnalyzer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (globalThis as any).setSupabaseClient(null);
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useGeminiAnalyzer());
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should throw validation error if resume is too short", async () => {
    const { result } = renderHook(() => useGeminiAnalyzer());

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.analyze("short", "A".repeat(60));
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe("Please enter a valid resume (at least 50 characters).");
    expect(result.current.error).toBe("Please enter a valid resume (at least 50 characters).");
    expect(result.current.loading).toBe(false);
  });

  it("should throw validation error if job description is too short", async () => {
    const { result } = renderHook(() => useGeminiAnalyzer());

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.analyze("A".repeat(60), "short");
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe("Please enter a valid job description (at least 50 characters).");
    expect(result.current.error).toBe("Please enter a valid job description (at least 50 characters).");
    expect(result.current.loading).toBe(false);
  });

  it("should run analysis successfully and save latest analysis to localStorage", async () => {
    const mockResult = { score: 92, recruiter_eyes: {} };
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );
    globalThis.fetch = mockFetch as any;

    const { result } = renderHook(() => useGeminiAnalyzer());

    let analyzeResult: any;
    await act(async () => {
      analyzeResult = await result.current.analyze("Resume: " + "A".repeat(50), "Job Description: " + "B".repeat(50));
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem("latest_analysis_result")).toBe(JSON.stringify(mockResult));
  });

  it("should handle 401 API authentication error correctly", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        text: () => Promise.resolve("401: Unauthorized Access - invalid key"),
      })
    );
    globalThis.fetch = mockFetch as any;

    const { result } = renderHook(() => useGeminiAnalyzer());

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.analyze("Resume: " + "A".repeat(50), "Job Description: " + "B".repeat(50));
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe("Server API authentication failed. API key is invalid or not configured on the server.");
    expect(result.current.error).toBe("Server API authentication failed. API key is invalid or not configured on the server.");
    expect(result.current.loading).toBe(false);
  });

  it("should handle 429 Daily Quota error correctly", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        text: () => Promise.resolve("quota exceeded for this project"),
      })
    );
    globalThis.fetch = mockFetch as any;

    const { result } = renderHook(() => useGeminiAnalyzer());

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.analyze("Resume: " + "A".repeat(50), "Job Description: " + "B".repeat(50));
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe("API free tier daily quota exceeded. Please check your plan/billing details, try a different API key, or try again tomorrow.");
    expect(result.current.error).toBe("API free tier daily quota exceeded. Please check your plan/billing details, try a different API key, or try again tomorrow.");
  });

  it("should handle 500 rate limiting configuration error as service temporarily unavailable rather than rate limit reached", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server rate limiting configuration error"),
      })
    );
    globalThis.fetch = mockFetch as any;

    const { result } = renderHook(() => useGeminiAnalyzer());

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.analyze("Resume: " + "A".repeat(50), "Job Description: " + "B".repeat(50));
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe("Service temporarily unavailable. Please try again later.");
    expect(result.current.error).toBe("Service temporarily unavailable. Please try again later.");
  });

  it("should support rewriteBullet, reset, analyzeJobMatch and chatWithCopilot methods", async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/rewrite") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rewrittenText: "Rewritten bullet point text" }),
        });
      }
      if (url === "/api/job-match") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ compatibility_score: 88 }),
        });
      }
      if (url === "/api/chat") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ reply: "Copilot response message" }),
        });
      }
      return Promise.reject("Unknown URL");
    });
    globalThis.fetch = mockFetch as any;

    const { result } = renderHook(() => useGeminiAnalyzer());

    // Test rewriteBullet
    const rewritten = await result.current.rewriteBullet("Old bullet", "context info");
    expect(rewritten).toBe("Rewritten bullet point text");

    // Test analyzeJobMatch
    const matched = await result.current.analyzeJobMatch("resume text", "jd text");
    expect(matched.compatibility_score).toBe(88);

    // Test chatWithCopilot
    const chat = await result.current.chatWithCopilot("question", [], "resume", {
      skills: [], projects: [], experience_summary: "", career_goals: [], target_companies: [],
      applications_count: 0, achievements: [], preferred_roles: []
    }, [], [], []);
    expect(chat).toBe("Copilot response message");

    // Test reset
    act(() => {
      result.current.reset();
    });
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
