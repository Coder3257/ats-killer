// Removed direct supabase import; using global helper
function getSupabase() {
  return (globalThis as any).supabase;
}

export interface SubscriptionDetails {
  status: string;
  priceId?: string;
  currentPeriodEnd?: string;
}

export class BillingService {
  static async getSubscription(userId: string): Promise<SubscriptionDetails> {
    const client = getSupabase();
    if (!client) {
      return { status: "active", priceId: "premium_monthly", currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000).toISOString() };
    }

    const { data, error } = await client
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      return {
        status: data[0].status,
        priceId: data[0].price_id,
        currentPeriodEnd: data[0].current_period_end,
      };
    }

    return { status: "free" };
  }
}
