import { create } from "zustand";
import { NotificationService, AppNotification } from "../services/notification.service";

interface NotificationState {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  loadNotifications: (userId: string) => Promise<void>;
  markAsRead: (userId: string, id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  loading: false,
  error: null,

  loadNotifications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const list = await NotificationService.listNotifications(userId);
      set({ notifications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  markAsRead: async (userId, id) => {
    try {
      await NotificationService.markAsRead(userId, id);
      const list = await NotificationService.listNotifications(userId);
      set({ notifications: list });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
