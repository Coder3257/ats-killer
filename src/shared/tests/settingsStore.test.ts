import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "../stores/settingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    localStorage.clear();
    // Reinitialize state
    useSettingsStore.setState({
      theme: "light",
    });
  });

  it("should initialize with theme from localStorage or light", () => {
    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("should update theme and write to localStorage on setTheme call", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(localStorage.getItem("THEME_PREFERENCE")).toBe("dark");
  });
});
