import { create } from "zustand";

interface SettingsState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: (localStorage.getItem("THEME_PREFERENCE") as any) || "light",

  setTheme: (theme) => {
    localStorage.setItem("THEME_PREFERENCE", theme);
    set({ theme });
  },
}));
