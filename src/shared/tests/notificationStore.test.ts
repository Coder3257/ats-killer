import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotificationStore } from "../stores/notificationStore";

describe("useNotificationStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useNotificationStore.setState({
      notifications: [],
      loading: false,
      error: null,
    });
    // Set offline mode for simplicity to test the store interaction with service logic
    (globalThis as any).setSupabaseClient(null);
  });

  it("should load notifications with fallback data if none exists in localStorage", async () => {
    await useNotificationStore.getState().loadNotifications("test-user");
    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe("notif-1");
    expect(state.notifications[0].read).toBe(false);
  });

  it("should mark notification as read and reload notifications", async () => {
    // Populate localStorage first
    const initialList = [
      { id: "n-1", title: "Test Title", message: "Test Msg", read: false, created_at: new Date().toISOString() },
    ];
    localStorage.setItem("NOTIFICATIONS_LIST", JSON.stringify(initialList));

    await useNotificationStore.getState().loadNotifications("test-user");
    expect(useNotificationStore.getState().notifications[0].read).toBe(false);

    await useNotificationStore.getState().markAsRead("test-user", "n-1");

    const state = useNotificationStore.getState();
    expect(state.notifications[0].read).toBe(true);
    
    // Check localStorage
    const saved = JSON.parse(localStorage.getItem("NOTIFICATIONS_LIST") || "[]");
    expect(saved[0].read).toBe(true);
  });
});
