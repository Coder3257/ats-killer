import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../repositories/UserRepository";
import { mockSupabase } from "./setup";

describe("UserRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Offline Mode (No Supabase Config)", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(null);
    });

    it("should fetch default profile values from localStorage fallbacks", async () => {
      const profile = await UserRepository.getProfile("usr-offline");
      expect(profile.id).toBe("usr-offline");
      expect(profile.full_name).toBe("Premium Guest");
      expect(profile.credits).toBe(50);
    });

    it("should update profile in localStorage fallback", async () => {
      await UserRepository.updateProfile("usr-offline", { full_name: "Alice Smith" });
      const profile = await UserRepository.getProfile("usr-offline");
      expect(profile.full_name).toBe("Alice Smith");
      expect(localStorage.getItem("PROFILE_NAME")).toBe("Alice Smith");
    });
  });

  describe("Online Mode (Supabase Configured)", () => {
    beforeEach(() => {
      (globalThis as any).setSupabaseClient(mockSupabase);
    });

    it("should retrieve profile and credit details from Supabase", async () => {
      mockSupabase.from.mockImplementation((table: string): any => {
        const query: any = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          single: vi.fn(() => {
            if (table === "profiles") {
              return Promise.resolve({
                data: { full_name: "SaaS Dev", avatar_url: "https://avatar.url" },
                error: null,
              });
            } else if (table === "credits") {
              return Promise.resolve({
                data: { amount: 150 },
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
          maybeSingle: vi.fn(() => {
            if (table === "subscriptions") {
              return Promise.resolve({
                data: { status: "active", current_period_end: "2026-12-31T23:59:59.000Z" },
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return query;
      });

      const profile = await UserRepository.getProfile("usr-online");
      expect(profile.full_name).toBe("SaaS Dev");
      expect(profile.avatar_url).toBe("https://avatar.url");
      expect(profile.credits).toBe(150);
    });

    it("should update profile in Supabase table", async () => {
      const mockUpsert = vi.fn().mockImplementation(() => Promise.resolve({ error: null }));

      mockSupabase.from.mockImplementation((table: string): any => ({
        upsert: mockUpsert,
      }));

      await UserRepository.updateProfile("usr-online", { full_name: "Bob Builder", avatar_url: "new-url" });
      expect(mockUpsert).toHaveBeenCalledWith({ id: "usr-online", full_name: "Bob Builder", avatar_url: "new-url" });
    });
  });
});
