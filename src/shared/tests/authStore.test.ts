import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../stores/authStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test run
    useAuthStore.setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  });

  it("should initialize with default guest state parameters", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("should correctly update user session details when setSession triggers", () => {
    const mockSession: any = {
      user: {
        id: "usr_saas_987",
        email: "engineer@***REMOVED***.io",
      },
    };

    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockSession.user);
  });
});
