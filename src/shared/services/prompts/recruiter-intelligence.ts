// src/shared/services/prompts/recruiter-intelligence.ts

export function getRecruiterIntelligencePrompt(resume: string, jd: string): string {
  return `You are an expert Recruitment Director. Analyze where a human screener's attention will go on this resume during the critical 6-second initial scan, when evaluated against this target job description.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

INSTRUCTIONS:
Evaluate screener focus behaviors and layout visual hierarchy. Provide highly specific, concrete, resume-grounded feedback:
- "first_noticed": Explicitly point out which exact terms, years, or titles on their resume will catch the recruiter's eye first. Quote actual resume texts.
- "ignored_items": Identify which secondary elements, filler words, or bullet points on their resume will likely be skimmed over or ignored.
- "skipped_sections": Detail which full sections or headers on the resume will be entirely bypassed during the initial scan, and explain why.
- "strongest_section": Specify the candidate's strongest section and explain how it aligns with the target job criteria.
- "weakest_section": Identify their weakest section, detailing specific visual or content deficiencies that need correction.
- "estimated_reading_time": Provide a realistic reading time based on word count.
- "verdict": Give a direct recruitment screening verdict (e.g., "Screen-in", "Waitlist", "Screen-out").
- "interview_probability": Estimate the percentage chance of a callback.

Format the output in a clear, professional Markdown layout with structured headings.`;
}
