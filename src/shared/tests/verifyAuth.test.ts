import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyAuth } from "../../../api/_utils";
import { mockSupabase } from "./setup";
import type { VercelRequest, VercelResponse } from "@vercel/node";

describe("verifyAuth API utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).setSupabaseClient(mockSupabase);
  });

  const createMockResponse = () => {
    const res: any = {
      status: vi.fn(() => res),
      json: vi.fn(() => res),
    };
    return res as unknown as VercelResponse;
  };

  it("should return 401 if authorization header is missing", async () => {
    const req = { headers: {} } as unknown as VercelRequest;
    const res = createMockResponse();

    const userId = await verifyAuth(req, res);
    expect(userId).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Missing or invalid authorization header" }));
  });

  it("should return 401 for garbage tokens", async () => {
    const req = { headers: { authorization: "Bearer invalidgarbage" } } as unknown as VercelRequest;
    const res = createMockResponse();

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("Auth failed") });

    const userId = await verifyAuth(req, res);
    expect(userId).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Unauthorized: Invalid Supabase token" }));
  });

  it("should return 401 for fake tokens starting with eyJ that fail Supabase verification", async () => {
    const req = { headers: { authorization: "Bearer eyJfakeTokenThatFails" } } as unknown as VercelRequest;
    const res = createMockResponse();

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("Auth failed") });

    const userId = await verifyAuth(req, res);
    expect(userId).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Unauthorized: Invalid Supabase token" }));
  });

  it("should return userId for valid Supabase tokens", async () => {
    const req = { headers: { authorization: "Bearer validToken" } } as unknown as VercelRequest;
    const res = createMockResponse();

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "real-user-id" } }, error: null });

    const userId = await verifyAuth(req, res);
    expect(userId).toBe("real-user-id");
    expect(res.status).not.toHaveBeenCalled();
  });
});
