---
name: fix-suggestion-section-extraction
description: Fix the fix-suggestion endpoint to extract only the relevant resume section based on the issue type instead of sending the entire resume.
metadata:
  type: project
---

In the file `api/fix-suggestion.ts`, we need to change the handler to extract the relevant section from the resume text based on the issueText before constructing the prompt.

Steps:
1. Parse the resume text to identify sections (e.g., EXPERIENCE, EDUCATION, SKILLS) by looking for lines that are all caps and followed by a colon or newline and then indented content.
2. Based on keywords in the issueText (e.g., "experience", "skill", "education"), select the corresponding section.
3. If no match, fall back to the entire resume (or the most relevant section heuristically).
4. Use only that section in the prompt as the "Current Resume Section".

We must also update the prompt accordingly.

We will implement this in the next session when quota is available.