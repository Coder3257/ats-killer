// src/shared/services/prompts/job-matching.ts

export function getJobMatchingPrompt(resume: string, targetJd: string): string {
  return `You are an expert resume reviewer. Compare the following resume against the job description and output ONLY a JSON object representing the job match details. Do not include markdown formatting or backticks.

RESUME:
${resume}

JOB DESCRIPTION:
${targetJd}

Output structure (Raw JSON only, no backticks, starting with { and ending with }):
{
  "compatibility_score": 75,
  "missing_skills": ["TypeScript", "Docker"],
  "strengths": ["React", "API Design"],
  "est_prep_time": "5 days",
  "recommended_version": "V2_Frontend",
  "cover_letter_focus": "Focus on your SPA layout and performance expertise."
}`;
}
