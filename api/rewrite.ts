import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, rateLimit, getSupabaseAdmin } from "./_utils.js";
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

    if (await rateLimit(userId, res, req)) return;

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Database admin client is not configured on the server." });
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("lifetime_access")
      .eq("id", userId)
      .single();

    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const hasLifetimeAccess = profile?.lifetime_access === true;
    const hasActiveSubscription = subscription?.status === "active" 
      && new Date(subscription.current_period_end) > new Date();

    const isUnlimited = hasLifetimeAccess || hasActiveSubscription;

    let creditsData = null;

    if (!isUnlimited) {
      const { data: cData, error: creditsError } = await adminClient
        .from("credits")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (creditsError || !cData) {
        console.error("CREDITS ERROR DETECTED:", creditsError, "data:", cData);
        return res.status(402).json({ error: "No credit record found. Please purchase credits." });
      }

      if (cData.amount <= 0) {
        return res.status(402).json({ error: "Insufficient credits. Please upgrade or purchase more credits." });
      }
      creditsData = cData;
    }

    const { originalText, contextDescription } = req.body || {};
    const cleanKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!cleanKey) {
      return res.status(500).json({ error: "AI Service API key is required on the server." });
    }

    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const promptText = `You are an expert resume optimizer and hiring consultant.
Optimize this specific text/bullet point from a resume:
"${originalText}"

To address the following suggestion/feedback:
"${contextDescription}"

Return ONLY the rewritten, optimized bullet point or text. Do not include markdown formatting, backticks, bullet point prefixes like "-", quotes, or conversational explanations. Just return the clean rewritten string.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });
    } catch (geminiErr) {
      Sentry.captureException(geminiErr, { tags: { source: "gemini_api" } });
      throw geminiErr;
    }

    if (!isUnlimited && creditsData) {
      const { error: decrementError } = await adminClient
        .from("credits")
        .update({ amount: creditsData.amount - 1 })
        .eq("user_id", userId);

      if (decrementError) {
        console.error("Failed to decrement user credits:", decrementError);
      }
    }

    return res.status(200).json({ rewrittenText: (response.text || "").trim().replace(/^["']|["']$/g, "") });
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
