import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "./_utils.js";
import { getGamificationData, updateChallengeStatus } from "./_gamification.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils.js";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req, res);
    if (!userId) return;

    if (req.method === "POST") {
      const { challengeKey, completed, points } = req.body || {};
      if (!challengeKey) {
        return res.status(400).json({ error: "Missing challengeKey in request body" });
      }
      const data = await updateChallengeStatus(userId, challengeKey, !!completed, Number(points) || 0);
      return res.status(200).json(data);
    } else {
      const data = await getGamificationData(userId);
      return res.status(200).json(data);
    }
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
