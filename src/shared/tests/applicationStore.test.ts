import { describe, it, expect, beforeEach } from "vitest";
import { useApplicationStore } from "../stores/applicationStore";

describe("useApplicationStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useApplicationStore.setState({
      applications: [],
      loading: false,
      error: null,
    });
    (globalThis as any).setSupabaseClient(null);
  });

  it("should support creating, loading, updating and deleting applications in offline mode", async () => {
    // 1. Initial load (should be empty)
    await useApplicationStore.getState().loadApplications("user-1");
    expect(useApplicationStore.getState().applications).toEqual([]);

    // 2. Create application
    const appData = {
      company: "Google",
      position: "Software Engineer",
      date_applied: "2026-07-10",
      resume_version: "V1",
      ats_score: 85,
      status: "Applied" as const,
      notes: "Referral from friend",
      checklist: {
        resume_customized: true,
        cover_letter: false,
        linkedin_updated: true,
        portfolio_ready: false,
        github_updated: false,
        followup_sent: false,
        interview_scheduled: false,
      },
    };

    await useApplicationStore.getState().createApplication("user-1", appData);
    expect(useApplicationStore.getState().applications).toHaveLength(1);
    const created = useApplicationStore.getState().applications[0];
    expect(created.company).toBe("Google");
    expect(created.id).toBeDefined();

    // 3. Update application
    await useApplicationStore.getState().updateApplication("user-1", created.id, {
      status: "Interview",
      notes: "Round 1 scheduled",
    });
    expect(useApplicationStore.getState().applications[0].status).toBe("Interview");
    expect(useApplicationStore.getState().applications[0].notes).toBe("Round 1 scheduled");

    // 4. Delete application
    await useApplicationStore.getState().deleteApplication("user-1", created.id);
    expect(useApplicationStore.getState().applications).toHaveLength(0);
  });
});
