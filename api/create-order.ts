import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";
import { verifyAuth } from "./_utils.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const userId = await verifyAuth(req, res);
    if (!userId) return;

    const { planName } = req.body || {};
    if (!planName || (planName !== "Pro" && planName !== "Lifetime")) {
      return res.status(400).json({ error: "Invalid plan name" });
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ error: "Razorpay credentials are not configured on the server." });
    }

    // Pro: ₹299 (29900 paise), Lifetime: ₹999 (99000 paise)
    const amount = planName === "Pro" ? 29900 : 99000;

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        planName,
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    });
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
