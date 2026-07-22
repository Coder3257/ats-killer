import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getSupabaseAdmin } from "./_utils.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

export const config = {
  api: {
    bodyParser: false,
  },
};

const razorpayWebhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return res.status(400).json({ error: "Missing Razorpay signature header" });
    }

    if (!razorpayWebhookSecret) {
      return res.status(500).json({ error: "Webhook secret is not configured on the server." });
    }

    const rawBody = await getRawBody(req);

    // Verify webhook signature
    const generatedSignature = crypto
      .createHmac("sha256", razorpayWebhookSecret)
      .update(rawBody)
      .digest("hex");

    if (generatedSignature !== signature) {
      console.error("Webhook signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We only care about payment.captured events
    if (event !== "payment.captured") {
      return res.status(200).json({ received: true, ignoredEvent: event });
    }

    const payment = payload.payload.payment.entity;
    const paymentId = payment.id;
    const notes = payment.notes || {};
    const userId = notes.userId;
    const planName = notes.planName;

    if (!paymentId || !userId || !planName) {
      return res.status(400).json({ error: "Malformed webhook payload properties" });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Database client configuration missing" });
    }

    // 1. Idempotency Check: check if payment already processed
    const { data: existingPayment } = await adminClient
      .from("payments")
      .select("razorpay_payment_id")
      .eq("razorpay_payment_id", paymentId)
      .maybeSingle();

    if (existingPayment) {
      return res.status(200).json({ success: true, duplicate: true, message: "Payment already processed" });
    }

    // 2. Insert payment record to ensure idempotency
    const { error: insertPayErr } = await adminClient
      .from("payments")
      .insert({
        razorpay_payment_id: paymentId,
        user_id: userId,
        status: "captured",
      });

    if (insertPayErr) {
      if (insertPayErr.code === "23505") {
        return res.status(200).json({ success: true, duplicate: true, message: "Payment already processed concurrently." });
      }
      throw insertPayErr;
    }

    // 3. Provision access
    if (planName === "Pro") {
      const { data: existingSub } = await adminClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const newPeriodEnd = new Date();
      newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);

      if (existingSub) {
        const { error: updateErr } = await adminClient
          .from("subscriptions")
          .update({
            status: "active",
            price_id: "pro_monthly",
            current_period_end: newPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await adminClient
          .from("subscriptions")
          .insert({
            user_id: userId,
            status: "active",
            price_id: "pro_monthly",
            current_period_end: newPeriodEnd.toISOString(),
          });

        if (insertErr) throw insertErr;
      }
    } else if (planName === "Lifetime") {
      const { error: profileErr } = await adminClient
        .from("profiles")
        .update({
          lifetime_access: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileErr) throw profileErr;
    }

    return res.status(200).json({ success: true, message: "Webhook processed and access configured" });
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
