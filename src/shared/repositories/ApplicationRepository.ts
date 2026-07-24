// Removed direct supabase import; using global supabase helper
function getSupabase() {
  return (globalThis as any).supabase;
}

export interface ApplicationTrackerItem {
  id: string;
  company: string;
  position: string;
  date_applied: string;
  resume_version: string;
  ats_score: number;
  status: "Wishlist" | "Applied" | "OA" | "Interview" | "Offer" | "Rejected" | "Accepted";
  notes: string;
  checklist: {
    resume_customized: boolean;
    cover_letter: boolean;
    linkedin_updated: boolean;
    portfolio_ready: boolean;
    github_updated: boolean;
    followup_sent: boolean;
    interview_scheduled: boolean;
  };
  timeline?: any[];
}

export class ApplicationRepository {
  static async listApplications(userId: string): Promise<ApplicationTrackerItem[]> {
    const client = getSupabase();
    if (!client) {
      const fallback = localStorage.getItem("APPLICATIONS_LIST");
      return fallback ? JSON.parse(fallback) : [];
    }

    const { data, error } = await client
      .from("job_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    // Map status/checklist fields
    return (data || []).map((item: any) => ({
      id: item.id,
      company: item.company,
      position: item.role,
      date_applied: item.date_applied,
      resume_version: item.resume_version,
      ats_score: item.ats_score || 0,
      status: item.status,
      notes: item.notes || "",
      checklist: item.attachments?.checklist || {
        resume_customized: false,
        cover_letter: false,
        linkedin_updated: false,
        portfolio_ready: false,
        github_updated: false,
        followup_sent: false,
        interview_scheduled: false,
      },
      timeline: item.timeline || [],
    }));
  }

  static async createApplication(userId: string, data: Omit<ApplicationTrackerItem, "id">): Promise<ApplicationTrackerItem> {
    const client = getSupabase();
    if (!client) {
      const list = await this.listApplications(userId);
      const newItem: ApplicationTrackerItem = {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
      };
      list.push(newItem);
      localStorage.setItem("APPLICATIONS_LIST", JSON.stringify(list));
      return newItem;
    }

    const payload = {
      user_id: userId,
      company: data.company,
      role: data.position,
      date_applied: data.date_applied,
      resume_version: data.resume_version,
      ats_score: data.ats_score,
      status: data.status,
      notes: data.notes,
      attachments: { checklist: data.checklist },
      timeline: data.timeline || [],
    };

    const { data: record, error } = await client
      .from("job_applications")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      id: record.id,
      company: record.company,
      position: record.role,
      date_applied: record.date_applied,
      resume_version: record.resume_version,
      ats_score: record.ats_score || 0,
      status: record.status as any,
      notes: record.notes || "",
      checklist: record.attachments?.checklist || data.checklist,
      timeline: record.timeline || [],
    };
  }

  static async updateApplication(userId: string, id: string, data: Partial<ApplicationTrackerItem>): Promise<void> {
    const client = getSupabase();
    if (!client) {
      const list = await this.listApplications(userId);
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        localStorage.setItem("APPLICATIONS_LIST", JSON.stringify(list));
      }
      return;
    }

    const updates: any = {};
    if (data.company) updates.company = data.company;
    if (data.position) updates.role = data.position;
    if (data.status) updates.status = data.status;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.checklist) updates.attachments = { checklist: data.checklist };
    if (data.timeline) updates.timeline = data.timeline;

    const { error } = await client
      .from("job_applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  static async deleteApplication(userId: string, id: string): Promise<void> {
    const client = getSupabase();
    if (!client) {
      const list = await this.listApplications(userId);
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem("APPLICATIONS_LIST", JSON.stringify(filtered));
      return;
    }

    const { error } = await client
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
