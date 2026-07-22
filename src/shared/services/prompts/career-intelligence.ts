// src/shared/services/prompts/career-intelligence.ts

export function getCareerIntelligencePrompt(resume: string, targetGoal: string): string {
  return `You are a senior executive career strategist. Evaluate the candidate's resume relative to their target goal.

TARGET GOAL:
${targetGoal}

RESUME:
${resume}

INSTRUCTIONS:
Provide a detailed strategic overview. Describe:
- Market positioning: current standing relative to the goal.
- Short-term (immediate) and long-term milestones.
- Specific projects the candidate should execute to qualify for target pay bands.
Format in Markdown.`;
}
