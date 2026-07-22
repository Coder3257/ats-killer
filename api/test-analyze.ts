import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth, rateLimit } from "./_utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // For load testing: accept an optional x-user-id header to bypass Supabase auth getUser API requests (which would rate limit us)
    let userId = req.headers["x-user-id"] as string;
    if (!userId) {
      userId = await verifyAuth(req, res) || "";
      if (!userId) return;
    }

    if (await rateLimit(userId, res, req)) return;

    return res.status(200).json({
      success: true,
      message: "Mock analysis successfully executed!",
      data: {
        score: 85,
        summary: "This is a mock load test response."
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
