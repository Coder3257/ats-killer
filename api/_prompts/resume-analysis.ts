// src/shared/services/prompts/resume-analysis.ts

export function getResumeAnalysisPrompt(resume: string, jd: string, isRetry: boolean = false): string {
  let promptText = `You are an ATS (Applicant Tracking System) expert AND a hiring psychology analyst with 15 years of experience.

Analyze this resume against this job description deeply and return insights.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

INSTRUCTIONS:
Provide a highly detailed analysis of the candidate's fit for this role.
Output MUST be raw JSON formatting only, starting with { and ending with }. Do not wrap inside markdown \`\`\`json block. Do NOT include any comments (like // or /* */) inside the JSON response.

The returned JSON MUST conform strictly to this structural template, keeping all required keys, nesting, and types.

CRITICAL ANALYSIS RULES:
1. ATS SIMULATION ("ats_simulation"):
   - For each of the 5 systems ("Workday", "Greenhouse", "Lever", "Ashby", "Taleo"), perform a simulated structural check of the candidate's actual resume presentation and style (e.g., columns, borders, header tables, or section titles).
   - "parsing_failure_reason": Describe a highly specific, realistic parsing failure for that system. For example: "Workday struggles to extract work dates from horizontal dual-column structures in the Experience section", or "Taleo fails to parse contact information placed inside layout headers/footers". DO NOT write generic text like "None" or "Resume parsed correctly".
   - "literal_fix": Detail the exact, concrete formatting action the user should take. For example: "Move your dates to the right margin on a single-column layout", or "Extract your email/phone from header tables and put them in plain body text".

2. WHY YOU'RE BEING GHOSTED ("rejection_reasons"):
   - Must be deeply grounded in the candidate's actual resume content compared to the job description.
   - Every weakness cited must explicitly reference a specific resume line or section (e.g., "In the Experience section, you listed 'managed hosting' but did not mention specific AWS or Docker containerization tools required by the job post").
   - Every weakness must pair with one concrete actionable fix.
   - DO NOT provide generic career advice (e.g., "Add more achievements").

3. WHAT THIS COMPANY ACTUALLY WANTS ("company_archetype"):
   - Deduce the company's culture and specific expectations from the job description context (e.g., fast-paced startup, strict enterprise compliance, developer tooling, highly-scaled infrastructure).
   - For each insight item, write a resume-grounded advice explaining what parts of their resume they must emphasize or optimize to align with this company's archetype. Quote specific resume roles or projects that the candidate should align.

4. SCORE CALCULATION RULES:
   - The main compatibility "score" (and "ats_compatibility") must derive from stated criteria: keyword match (35%), skills coverage (35%), and seniority/experience alignment (30%). Do not output an unexplained number.

ENUM AND SIZE CONSTRAINTS (VERY IMPORTANT):
- "severity" must be exactly one of: "HIGH", "MEDIUM", "LOW"
- "ats_simulation" must contain exactly 5 objects for these system names in this exact order: "Workday", "Greenhouse", "Lever", "Ashby", "Taleo". For each, "status" must be "PASS" or "FAIL".
- "resume_heatmap" must contain exactly 6 objects for these sections in this exact order: "Summary", "Experience", "Projects", "Skills", "Education", "Certifications". For each, "grade" must be "Excellent", "Good", "Average", "Weak".
- "emotional_impression" must contain exactly 7 objects for these attributes in this exact order: "Confident", "Leadership", "Technical Depth", "Ownership", "Innovation", "Communication", "Professionalism".
- "skill_gap.comparison" items must use "category" from: "Already Strong", "Needs Improvement", "Critical Missing", "Learning Priority".
- "career_roadmap.steps" items must use "timeframe" from: "Immediate Fixes", "This Week", "This Month", "Next 90 Days", "Long-term".
- "application_tracker" items must use "status" from: "Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected", "Accepted".
- "job_matches" items must use "workplace_type" from: "Remote", "Hybrid", "Onsite".

JSON TEMPLATE:
{
  "score": 75,
  "keyword_match_percent": 82,
  "format_score": 90,
  "readability": "Good",
  "keywords_found": ["React", "TypeScript"],
  "keywords_missing": ["Docker", "Kubernetes"],
  "rejection_reasons": [
    {
      "title": "Missing containerization skills",
      "description": "The job description requires Docker but it is not found on the resume.",
      "severity": "MEDIUM"
    }
  ],
  "company_archetype": {
    "label": "Fast-paced Tech",
    "insights": [
      {
        "icon": "zap",
        "title": "Agile Delivery",
        "explanation": "The company ships code daily."
      }
    ]
  },
  "quick_wins": [
    {
      "title": "Add Docker experience",
      "description": "Mention how you used Docker containers for development.",
      "impact_increase": 10,
      "time_required": "10 minutes",
      "original_context": "Developed web applications."
    }
  ],
  "rewrite_suggestion": "Engineered high-performance React web applications...",
  "ats_simulation": [
    {
      "name": "Workday",
      "score": 78,
      "status": "PASS",
      "explanation": "Resume parsed correctly.",
      "biggest_issue": "None",
      "parsing_failure_reason": "Workday struggles to extract work dates from horizontal dual-column structures in the Experience section.",
      "literal_fix": "Move your dates to the right margin on a single-column layout."
    },
    {
      "name": "Greenhouse",
      "score": 82,
      "status": "PASS",
      "explanation": "Format was well understood.",
      "biggest_issue": "None",
      "parsing_failure_reason": "Header elements containing contact details are ignored during initial keyword extraction.",
      "literal_fix": "Ensure all contact fields are in the body of the resume rather than nested inside header tables or textboxes."
    },
    {
      "name": "Lever",
      "score": 80,
      "status": "PASS",
      "explanation": "Simple layout parsed successfully.",
      "biggest_issue": "None",
      "parsing_failure_reason": "Horizontal borders and line separators prevent the scanner from detecting section breaks.",
      "literal_fix": "Remove decorative lines and borders separating key sections."
    },
    {
      "name": "Ashby",
      "score": 75,
      "status": "PASS",
      "explanation": "Structured fields parsed.",
      "biggest_issue": "None",
      "parsing_failure_reason": "Non-standard custom bullet symbols fail to render correctly, showing as question marks or corrupt text.",
      "literal_fix": "Use standard round bullet points rather than custom graphic glyphs."
    },
    {
      "name": "Taleo",
      "score": 68,
      "status": "FAIL",
      "explanation": "Older parse engine flagged formatting density.",
      "biggest_issue": "High section density",
      "parsing_failure_reason": "Taleo fails to parse the dates placed adjacent to section headings, dropping work durations.",
      "literal_fix": "Place all dates on their own line underneath job titles, aligned left."
    }
  ],
  "recruiter_eyes": {
    "first_noticed": ["4 years experience"],
    "ignored_items": ["Interests section"],
    "skipped_sections": ["Hobbies"],
    "strongest_section": "Experience",
    "weakest_section": "Summary",
    "estimated_reading_time": "6 seconds",
    "verdict": "Qualified",
    "interview_probability": 65
  },
  "scan_timeline": [
    {
      "time_elapsed": "0-2s",
      "section_name": "Header",
      "observation": "Checked name and location."
    }
  ],
  "resume_heatmap": [
    {
      "section": "Summary",
      "grade": "Good",
      "score_percent": 80
    },
    {
      "section": "Experience",
      "grade": "Excellent",
      "score_percent": 92
    },
    {
      "section": "Projects",
      "grade": "Good",
      "score_percent": 85
    },
    {
      "section": "Skills",
      "grade": "Excellent",
      "score_percent": 90
    },
    {
      "section": "Education",
      "grade": "Average",
      "score_percent": 70
    },
    {
      "section": "Certifications",
      "grade": "Weak",
      "score_percent": 40
    }
  ],
  "attention_scores": [
    {
      "section": "Experience",
      "percentage": 50
    }
  ],
  "emotional_impression": [
    {
      "attribute": "Confident",
      "score": 80
    },
    {
      "attribute": "Leadership",
      "score": 70
    },
    {
      "attribute": "Technical Depth",
      "score": 85
    },
    {
      "attribute": "Ownership",
      "score": 80
    },
    {
      "attribute": "Innovation",
      "score": 75
    },
    {
      "attribute": "Communication",
      "score": 80
    },
    {
      "attribute": "Professionalism",
      "score": 90
    }
  ],
  "hiring_probability": {
    "ats_pass": {
      "percentage": 85,
      "confidence": 90,
      "explanation": "High match on core keywords."
    },
    "recruiter_callback": {
      "percentage": 70,
      "confidence": 80,
      "explanation": "Strong work history."
    },
    "interview": {
      "percentage": 60,
      "confidence": 75,
      "explanation": "Technical alignment is good."
    },
    "offer": {
      "percentage": 40,
      "confidence": 65,
      "explanation": "Depends on behavior rounds."
    }
  },
  "salary_intelligence": {
    "current_market": "₹12L - ₹15L",
    "expected": "₹14L - ₹18L",
    "potential": "₹20L",
    "percentile": 85,
    "reasoning": "Matching top-tier frontend skill demands."
  },
  "skill_gap": {
    "comparison": [
      {
        "name": "Docker",
        "category": "Critical Missing", // Must be exactly one of: "Already Strong", "Needs Improvement", "Critical Missing", "Learning Priority"
        "learning_time": "3 days"
      }
    ]
  },
  "career_roadmap": {
    "steps": [
      {
        "timeframe": "Immediate Fixes", // Must be exactly one of: "Immediate Fixes", "This Week", "This Month", "Next 90 Days", "Long-term"
        "title": "Add Docker keyword",
        "description": "Integrate Docker to match target specs."
      }
    ]
  },
  "resume_competitiveness": {
    "technical_skills": 80,
    "leadership": 70,
    "communication": 85,
    "problem_solving": 80,
    "business_understanding": 75,
    "ats_friendliness": 85,
    "recruiter_appeal": 80,
    "overall": 81
  },
  "application_tracker": [
    {
      "id": "app-seed-1",
      "company": "Stripe",
      "position": "Frontend Engineer",
      "date_applied": "2026-06-30",
      "resume_version": "V1_Core",
      "ats_score": 85,
      "status": "Applied", // Must be exactly one of: "Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected", "Accepted"
      "notes": "Looking good so far.",
      "checklist": {
        "resume_customized": true,
        "cover_letter": true,
        "linkedin_updated": true,
        "portfolio_ready": true,
        "github_updated": true,
        "followup_sent": false,
        "interview_scheduled": false
      }
    }
  ],
  "resume_versions": [
    {
      "version_name": "V1_Core",
      "applications_sent": 5,
      "interview_rate": 20,
      "offer_rate": 0,
      "avg_ats_score": 82
    }
  ],
  "job_match": {
    "compatibility_score": 85,
    "missing_skills": ["Docker", "Jest"],
    "strengths": ["React", "TypeScript", "State Management"],
    "est_prep_time": "5 days",
    "recommended_version": "V1_Core",
    "cover_letter_focus": "Focus on high-performance React UI optimizations."
  },
  "application_analytics": {
    "total_applications": 5,
    "callbacks": 2,
    "interviews": 1,
    "offers": 0,
    "acceptance_rate": 0,
    "weekly_activity": [
      { "day": "Mon", "count": 1 }
    ],
    "monthly_activity": [
      { "month": "Jun", "count": 5 }
    ],
    "most_successful_role": "Frontend Engineer"
  },
  "application_checklist": {
    "resume_customized": true,
    "cover_letter": true,
    "linkedin_updated": true,
    "portfolio_ready": true,
    "github_updated": true,
    "followup_sent": false,
    "interview_scheduled": false
  },
  "career_dashboard": {
    "current_score": 75,
    "best_score": 85,
    "improvement_trend": "+10%",
    "applications_count": 5,
    "interviews_count": 1,
    "offers_count": 0,
    "career_goal": "Senior Frontend Engineer",
    "daily_progress": 80
  },
  "skill_evolution": [
    {
      "skill_name": "React",
      "current_value": 90,
      "history": [
        { "date": "2026-06-01", "value": 85 }
      ]
    }
  ],
  "career_coach": {
    "todays_priority": "Refactor resume experience bullets using metrics.",
    "this_week": "Study Jest unit testing foundations.",
    "this_month": "Obtain cloud practitioner certification.",
    "recommended_courses": [
      { "title": "React Advanced Concepts", "provider": "Coursera", "url": "https://coursera.org" }
    ],
    "recommended_projects": [
      { "title": "Payment gateway client", "description": "Write a dummy checkout integration using Stripe SDK." }
    ],
    "expected_outcome": "3 new interview callbacks."
  },
  "weekly_challenges": [
    {
      "id": "challenge-1",
      "title": "Keyword Alignment",
      "description": "Align your skills section with 3 matching JD keywords.",
      "completed": false,
      "points": 50
    }
  ],
  "achievements": [
    {
      "id": "badge-1",
      "name": "ATS Slayer",
      "description": "Achieve a match score above 85% on any scan.",
      "progress": 80,
      "unlock_percentage": 100,
      "unlocked": false,
      "icon": "target"
    }
  ],
  "progress_timeline": [
    {
      "week": "Week 1",
      "ats_score_improvement": 10,
      "applications_sent": 5,
      "interviews_obtained": 1,
      "skills_learned": ["TypeScript"]
    }
  ],
  "career_chat": {
    "welcome_message": "Hello! I have completed analyzing your resume. We have some skill gaps in containerization, but your React core is outstanding. How can I help you optimize?",
    "suggested_prompts": ["How do I fix the Docker skill gap?", "Write a cover letter for this Stripe role"]
  },
  "resume_memory": [
    {
      "version_name": "V1_Core",
      "date": "2026-06-30",
      "ats_score": 75,
      "improvements": ["Added Tailwind", "Refactored header"],
      "notes": "Base profile draft."
    }
  ],
  "application_memory": [
    {
      "id": "app-seed-1",
      "company": "Stripe",
      "role": "Frontend Engineer",
      "resume_version": "V1_Core",
      "status": "Applied",
      "interview_notes": "Pending response.",
      "rejection_reasons": ["Missing unit tests"],
      "offer_details": "None"
    }
  ],
  "interview_memory": [
    {
      "id": "int-1",
      "date": "2026-07-10",
      "company": "Stripe",
      "rounds": ["Technical phone screen"],
      "technical_questions": ["Explain React reconciliation"],
      "behavioral_questions": ["Tell me about a time you resolved a conflict"],
      "feedback": "Outstanding coding performance.",
      "weak_areas": ["Testing lifecycle understanding"]
    }
  ],
  "knowledge_graph": {
    "skills": ["React", "TypeScript", "JavaScript"],
    "projects": ["Personal billing platform"],
    "experience_summary": "4 years of web application development experience.",
    "career_goals": ["Senior Frontend Engineer"],
    "target_companies": ["Stripe", "Razorpay"],
    "applications_count": 5,
    "achievements": ["ATS Slayer Progress"],
    "preferred_roles": ["Frontend Developer"]
  },
  "opportunity_engine": {
    "overall_match": 78,
    "ats_compatibility": 85,
    "recruiter_appeal": 72,
    "skill_match": 80,
    "experience_match": 75,
    "competition_level": "High",
    "estimated_interview_chance": 65
  },
  "job_matches": [
    {
      "id": "job-match-1",
      "company": "Razorpay",
      "role": "UI Engineer",
      "match_percent": 88,
      "workplace_type": "Remote", // Must be exactly: "Remote", "Hybrid", or "Onsite"
      "salary_range": "₹14L - ₹18L",
      "recommendation_reason": "High matching index on payment UI libraries.",
      "location": "Bengaluru"
    }
  ],
  "resume_selector": [
    {
      "job_id": "job-match-1",
      "best_version": "V1_Core",
      "selection_reason": "Contains relevant typescript and optimization metrics.",
      "expected_ats_improvement": 12,
      "expected_recruiter_appeal": 15,
      "confidence_score": 88
    }
  ],
  "pre_application_optimizer": [
    {
      "job_id": "job-match-1",
      "missing_skills": ["Jest"],
      "missing_keywords": ["Unit Testing"],
      "missing_achievements": ["Delivered automated test suite coverage"],
      "resume_improvements": ["Add Jest projects to showcase testing knowledge"],
      "cover_letter_suggestions": ["Mention unit testing background in intro"],
      "time_to_improve": "3 days",
      "ats_gain": 15,
      "interview_probability_increase": 20
    }
  ],
  "weekly_feed": {
    "trending_companies": [
      { "name": "Google", "open_roles": 140, "trend": "Growing" }
    ],
    "best_matches": [
      { "company": "Razorpay", "role": "UI Engineer", "match_percent": 88 }
    ],
    "recommended_applications": [
      { "company": "Razorpay", "role": "UI Engineer", "difficulty": "Medium" }
    ],
    "weekly_application_target": 3,
    "personalized_strategy": "Highlight payment integration projects to match Stripe/Razorpay requirements."
  }
}
`;

  if (isRetry) {
    promptText += `\n\nCRITICAL: The previous parsing attempt failed. Verify the JSON is absolutely valid, standard JSON with proper quotes, commas, matching braces, and no escape violations.`;
  }

  return promptText;
}

