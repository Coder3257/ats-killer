import { describe, it, expect, beforeEach, vi } from "vitest";
import { Logger } from "../services/logger";
import { BillingService } from "../services/billing.service";
import { CopilotService } from "../services/copilot.service";
import { ResumeVersionService } from "../services/resumeVersion.service";
import { mockSupabase } from "./setup";

describe("Services Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Logger Service", () => {
    it("should print formatted messages for info, warn, error and metric logs", () => {
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const metricSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      Logger.info("test info", { userId: "user-1" });
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("[INFO]"));
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("test info"));
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("user-1"));

      Logger.warn("test warn");
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[WARN]"));

      Logger.error("test error", new Error("Fatal issue"));
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[ERROR]"));
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Fatal issue"));

      Logger.metric("api_latency", 250, { route: "/api/chat" });
      expect(metricSpy).toHaveBeenCalledWith(expect.stringContaining("[METRIC]"));
      expect(metricSpy).toHaveBeenCalledWith(expect.stringContaining("api_latency: 250ms"));

      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
      metricSpy.mockRestore();
    });
  });

  describe("BillingService", () => {
    it("should return premium status in offline fallback mode", async () => {
      (globalThis as any).setSupabaseClient(null);
      const sub = await BillingService.getSubscription("user-offline");
      expect(sub.status).toBe("active");
      expect(sub.priceId).toBe("premium_monthly");
    });

    it("should query active subscriptions from Supabase in online mode", async () => {
      (globalThis as any).setSupabaseClient(mockSupabase);
      const mockSub = { status: "active", price_id: "pro_yearly", current_period_end: "2026-12-31" };

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          limit: vi.fn(() => Promise.resolve({ data: [mockSub], error: null })),
        };
        return query;
      });

      const sub = await BillingService.getSubscription("user-online");
      expect(sub.status).toBe("active");
      expect(sub.priceId).toBe("pro_yearly");
      expect(sub.currentPeriodEnd).toBe("2026-12-31");
    });

    it("should return status free if no subscriptions are returned in Supabase", async () => {
      (globalThis as any).setSupabaseClient(mockSupabase);

      mockSupabase.from.mockImplementation((): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        };
        return query;
      });

      const sub = await BillingService.getSubscription("user-free");
      expect(sub.status).toBe("free");
    });
  });

  describe("CopilotService", () => {
    it("should send POST request to /api/chat and return reply content", async () => {
      (globalThis as any).setSupabaseClient(null);

      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ reply: "Hello from Copilot!" }),
        })
      );
      globalThis.fetch = mockFetch as any;

      const reply = await CopilotService.sendMessage(
        "Hello",
        [],
        "Resume details",
        {},
        [],
        [],
        [],
        "api-key-abc"
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(reply).toBe("Hello from Copilot!");
    });
  });

  describe("ResumeVersionService Mock Parser Helpers", () => {
    it("should extract matching candidate keywords from text input", () => {
      const text = "Highly skilled developer with typescript, react, node, and kubernetes experience.";
      const keywords = ResumeVersionService.extractKeywordsFromTextForMock(text);
      expect(keywords).toContain("typescript");
      expect(keywords).toContain("react");
      expect(keywords).toContain("node");
      expect(keywords).toContain("kubernetes");
      expect(keywords).not.toContain("redis");
    });

    it("should extract matching professional skills from text input", () => {
      const text = "Strengths include leadership, communication, and complex system design.";
      const skills = ResumeVersionService.extractSkillsFromTextForMock(text);
      expect(skills).toContain("leadership");
      expect(skills).toContain("communication");
      expect(skills).toContain("system design");
    });

    it("should extract matching section categories from text input", () => {
      const text = "Has professional summary, work experience, projects, education, and credentials.";
      const sections = ResumeVersionService.extractSectionsFromTextForMock(text);
      expect(sections).toContain("summary");
      expect(sections).toContain("projects");
      expect(sections).toContain("education");
    });
  });
});
