import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils.js";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Gate: only allow in development/non-production environments
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return res.status(404).end();
  }

  try {
    throw new Error("This is a test serverless function error thrown to verify Sentry integration.");
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
