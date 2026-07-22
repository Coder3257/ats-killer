import { create } from "zustand";
import { ApplicationService } from "../services/application.service";
import { ApplicationTrackerItem } from "../repositories/ApplicationRepository";

interface ApplicationState {
  applications: ApplicationTrackerItem[];
  loading: boolean;
  error: string | null;
  loadApplications: (userId: string) => Promise<void>;
  createApplication: (userId: string, data: Omit<ApplicationTrackerItem, "id">) => Promise<void>;
  updateApplication: (userId: string, id: string, data: Partial<ApplicationTrackerItem>) => Promise<void>;
  deleteApplication: (userId: string, id: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  error: null,

  loadApplications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const list = await ApplicationService.listApplications(userId);
      set({ applications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createApplication: async (userId, data) => {
    set({ loading: true, error: null });
    try {
      await ApplicationService.createApplication(userId, data);
      const list = await ApplicationService.listApplications(userId);
      set({ applications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateApplication: async (userId, id, data) => {
    set({ loading: true, error: null });
    try {
      await ApplicationService.updateApplication(userId, id, data);
      const list = await ApplicationService.listApplications(userId);
      set({ applications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteApplication: async (userId, id) => {
    set({ loading: true, error: null });
    try {
      await ApplicationService.deleteApplication(userId, id);
      const list = await ApplicationService.listApplications(userId);
      set({ applications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
