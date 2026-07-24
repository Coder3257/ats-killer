import "@testing-library/jest-dom";

import { vi } from "vitest";

// Global helper to mock Supabase client in tests
if (!(globalThis as any).setSupabaseClient) {
  (globalThis as any).setSupabaseClient = (client: any) => {
    (globalThis as any).supabase = client;
  };
}

export const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};


