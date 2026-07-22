import { supabase } from "../services/supabase/client";

export interface InterviewMemoryItem {
  id: string;
  date: string;
  company: string;
  rounds: string[];
  technical_questions: string[];
  behavioral_questions: string[];
  feedback: string;
  weak_areas: string[];
}

export class InterviewRepository {
  static async listInterviews(userId: string): Promise<InterviewMemoryItem[]> {
    if (!supabase) {
      const fallback = localStorage.getItem("INTERVIEWS_LIST");
      return fallback ? JSON.parse(fallback) : [];
    }

    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      company: item.company,
      rounds: item.rounds || [],
      technical_questions: item.technical_questions || [],
      behavioral_questions: item.behavioral_questions || [],
      feedback: item.feedback || "",
      weak_areas: item.weak_areas || [],
    }));
  }

  static async createInterview(userId: string, data: Omit<InterviewMemoryItem, "id">): Promise<InterviewMemoryItem> {
    if (!supabase) {
      const list = await this.listInterviews(userId);
      const newItem: InterviewMemoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
      };
      list.push(newItem);
      localStorage.setItem("INTERVIEWS_LIST", JSON.stringify(list));
      return newItem;
    }

    // Try to find a matching application_id for safety, else create a detached one or reference it
    const { data: apps } = await supabase
      .from("job_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("company", data.company)
      .limit(1);

    const appId = apps && apps.length > 0 ? apps[0].id : null;

    const payload = {
      user_id: userId,
      application_id: appId,
      date: data.date,
      company: data.company,
      rounds: data.rounds,
      technical_questions: data.technical_questions,
      behavioral_questions: data.behavioral_questions,
      feedback: data.feedback,
      weak_areas: data.weak_areas,
    };

    // If appId is not found, we can select a fallback application or throw, but for SaaS, let's create a generic app or skip validation if DB has nullable application_id. Wait! In our schema.sql:
    // "application_id uuid references public.job_applications on delete cascade not null"
    // Oh! application_id is NOT NULL!
    // So if there is no application for that company, we MUST first insert a mock job_application so that the foreign key constraint is satisfied! This is extremely important, otherwise the database will throw a foreign key violation!
    // Let's do that:
    let finalAppId = appId;
    if (!finalAppId) {
      const { data: newApp, error: appErr } = await supabase
        .from("job_applications")
        .insert({
          user_id: userId,
          company: data.company,
          role: "Interview Prep Reference",
          resume_version: "V1_Core",
          status: "Interview",
        })
        .select()
        .single();
      if (appErr) throw appErr;
      finalAppId = newApp.id;
    }

    const { data: record, error } = await supabase
      .from("interviews")
      .insert({
        ...payload,
        application_id: finalAppId,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: record.id,
      date: record.date,
      company: record.company,
      rounds: record.rounds,
      technical_questions: record.technical_questions,
      behavioral_questions: record.behavioral_questions,
      feedback: record.feedback,
      weak_areas: record.weak_areas,
    };
  }
}
