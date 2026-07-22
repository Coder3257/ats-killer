// src/shared/services/prompts/cover-letter.ts

export function getCoverLetterPrompt(resume: string, company: string, role: string, focusDescription: string): string {
  return `You are a professional cover letter writer. Using the candidate's resume, write a highly tailored, compelling cover letter for the role of "${role}" at "${company}".

Focus heavily on this angle/strategy:
"${focusDescription}"

RESUME:
${resume}

INSTRUCTIONS:
Write a premium, structured cover letter.
Include standard professional blocks:
- Header placeholder.
- Strong introduction showing company alignment.
- 2 experience paragraphs citing achievements from the resume matching the role.
- Dynamic call-to-action closing.
Return the complete letter text formatted cleanly in Markdown. Do not include introductory notes or comments.`;
}
