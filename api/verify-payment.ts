import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { verifyAuth, getSupabaseAdmin } from "./_utils.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils";

Sentry.init({ dsn: process.env.SENTRY_DSN, beforeSend: scrubPii });

const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const userId = await verifyAuth(req, res);
    if (!userId) return;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planName) {
      return res.status(400).json({ error: "Missing required checkout verification fields" });
    }

    if (!razorpayKeySecret) {
      return res.status(500).json({ error: "Razorpay key secret is not configured on the server." });
    }

    // 1. Signature Verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature verification failed");
      return res.status(400).json({ error: "Payment verification failed: invalid signature" });
    }

    // 2. Database Update
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Server database connection misconfigured." });
    }

    // A. Idempotency Check: check if payment already processed
    const { data: existingPayment } = await adminClient
      .from("payments")
      .select("razorpay_payment_id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      return res.status(200).json({ success: true, message: "Payment already processed and provisioned." });
    }

    // B. Record the payment to ensure idempotency
    const { error: insertPayErr } = await adminClient
      .from("payments")
      .insert({
        razorpay_payment_id: razorpay_payment_id,
        user_id: userId,
        status: "verified",
      });

    if (insertPayErr) {
      if (insertPayErr.code === "23505") {
        return res.status(200).json({ success: true, message: "Payment already processed concurrently." });
      }
      throw insertPayErr;
    }

    // C. Provision Access
    if (planName === "Pro") {
      // Upsert user subscription
      const { data: existingSub } = await adminClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const newPeriodEnd = new Date();
      newPeriodEnd.setDate(newPeriodEnd.getDate() + 30); // 30 days extension

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
      // Set lifetime access flag on profiles
      const { error: profileErr } = await adminClient
        .from("profiles")
        .update({
          lifetime_access: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileErr) throw profileErr;
    }

    return res.status(200).json({ success: true, message: "Payment successfully verified and account upgraded." });
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
