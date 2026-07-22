import { z } from "zod";

export const JobMatchResultSchema = z.object({
  compatibility_score: z.number(),
  missing_skills: z.array(z.string()),
  strengths: z.array(z.string()),
  est_prep_time: z.string(),
  recommended_version: z.string(),
  cover_letter_focus: z.string(),
});
