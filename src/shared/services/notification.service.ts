import { supabase } from "./supabase/client";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

function getSupabase() {
  // Use supabase client set via global test helper if available, otherwise default client
  const globalClient = (globalThis as any).supabase;
  return globalClient !== undefined ? globalClient : supabase;
}

export class NotificationService {
  static async listNotifications(userId: string): Promise<AppNotification[]> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("NOTIFICATIONS_LIST");
      return fallback
        ? JSON.parse(fallback)
        : [
            {
              id: "notif-1",
              title: "SaaS Workspace Initialized",
              message: "Welcome to ATS Killer SaaS. Your premium AI career engine is active.",
              read: false,
              created_at: new Date().toISOString(),
            },
          ];
    }

    const { data, error } = await client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      created_at: n.created_at,
    }));
  }

  static async markAsRead(userId: string, id: string): Promise<void> {
    const client = getSupabase();
    if (!client) {
      const list = await this.listNotifications(userId);
      const idx = list.findIndex((n) => n.id === id);
      if (idx !== -1) {
        list[idx].read = true;
        localStorage.setItem("NOTIFICATIONS_LIST", JSON.stringify(list));
      }
      return;
    }

    const { error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
