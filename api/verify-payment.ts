import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { verifyAuth, getSupabaseAdmin } from "./_utils.js";
import * as Sentry from "@sentry/node";
import { scrubPii } from "../sentry-utils.js";

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

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature verification failed");
      return res.status(400).json({ error: "Payment verification failed: invalid signature" });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ error: "Server database connection misconfigured." });
    }

    const { data: rpcResult, error: rpcErr } = await adminClient.rpc("provision_access", {
      p_user_id: userId,
      p_payment_id: razorpay_payment_id,
      p_plan_name: planName,
      p_price_id: planName === "Pro" ? "pro_monthly" : null,
      p_period_days: 30,
    });

    if (rpcErr) {
      Sentry.withScope((scope) => {
        scope.setContext("payment_info", {
          user_id: userId,
          plan: planName,
          razorpay_payment_id: razorpay_payment_id,
        });
        Sentry.captureException(rpcErr);
      });
      await Sentry.flush(2000);
      console.error("Database provisioning failed:", rpcErr);
      return res.status(500).json({ error: "Database provisioning failed: " + rpcErr.message });
    }

    return res.status(200).json({ success: true, message: rpcResult?.message || "Payment successfully verified and account upgraded." });
  } catch (err: any) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return res.status(500).json({ error: "Internal error" });
  }
}
