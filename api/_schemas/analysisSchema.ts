import { z } from "zod";

export const RejectionReasonSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export const InsightItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  explanation: z.string(),
});

export const CompanyArchetypeSchema = z.object({
  label: z.string(),
  insights: z.array(InsightItemSchema),
});

export const QuickWinSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact_increase: z.number(),
  time_required: z.string(),
  original_context: z.string(),
});

export const ATSSystemDetailsSchema = z.object({
  name: z.enum(["Workday", "Greenhouse", "Lever", "Ashby", "Taleo"]),
  score: z.number(),
  status: z.enum(["PASS", "FAIL"]),
  explanation: z.string(),
  biggest_issue: z.string(),
  parsing_failure_reason: z.string(),
  literal_fix: z.string(),
});

export const RecruiterEyesSchema = z.object({
  first_noticed: z.array(z.string()),
  ignored_items: z.array(z.string()),
  skipped_sections: z.array(z.string()),
  strongest_section: z.string(),
  weakest_section: z.string(),
  estimated_reading_time: z.string(),
  verdict: z.string(),
  interview_probability: z.number(),
});

export const ScanTimelineStepSchema = z.object({
  time_elapsed: z.string(),
  section_name: z.string(),
  observation: z.string(),
});

export const HeatmapSectionSchema = z.object({
  section: z.enum(["Summary", "Experience", "Projects", "Skills", "Education", "Certifications"]),
  grade: z.enum(["Excellent", "Good", "Average", "Weak"]),
  score_percent: z.number(),
});

export const AttentionScoreSchema = z.object({
  section: z.string(),
  percentage: z.number(),
});

export const EmotionalImpressionAttributeSchema = z.object({
  attribute: z.enum(["Confident", "Leadership", "Technical Depth", "Ownership", "Innovation", "Communication", "Professionalism"]),
  score: z.number(),
});

export const ProbabilityMetricSchema = z.object({
  percentage: z.number(),
  confidence: z.number(),
  explanation: z.string(),
});

export const HiringProbabilitySchema = z.object({
  ats_pass: ProbabilityMetricSchema,
  recruiter_callback: ProbabilityMetricSchema,
  interview: ProbabilityMetricSchema,
  offer: ProbabilityMetricSchema,
});

export const SalaryIntelligenceSchema = z.object({
  current_market: z.string(),
  expected: z.string(),
  potential: z.string(),
  percentile: z.number(),
  reasoning: z.string(),
});

export const SkillGapSchema = z.array(z.string());

export const RoadmapStepSchema = z.object({
  timeframe: z.enum(["Immediate Fixes", "This Week", "This Month", "Next 90 Days", "Long-term"]),
  title: z.string(),
  description: z.string(),
});

export const CareerRoadmapSchema = z.object({
  steps: z.array(RoadmapStepSchema),
});

export const ResumeCompetitivenessSchema = z.object({
  technical_skills: z.number(),
  leadership: z.number(),
  communication: z.number(),
  problem_solving: z.number(),
  business_understanding: z.number(),
  ats_friendliness: z.number(),
  recruiter_appeal: z.number(),
  overall: z.number(),
});

export const ApplicationChecklistSchema = z.object({
  resume_customized: z.boolean(),
  cover_letter: z.boolean(),
  linkedin_updated: z.boolean(),
  portfolio_ready: z.boolean(),
  github_updated: z.boolean(),
  followup_sent: z.boolean(),
  interview_scheduled: z.boolean(),
});

export const ApplicationTrackerItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  date_applied: z.string(),
  resume_version: z.string(),
  ats_score: z.number(),
  status: z.enum(["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected", "Accepted"]),
  notes: z.string(),
  checklist: ApplicationChecklistSchema,
});

export const ResumeVersionMetricSchema = z.object({
  version_name: z.string(),
  applications_sent: z.number(),
  interview_rate: z.number(),
  offer_rate: z.number(),
  avg_ats_score: z.number(),
});

export const JobMatchResultSchema = z.object({
  compatibility_score: z.number(),
  missing_skills: z.array(z.string()),
  strengths: z.array(z.string()),
  est_prep_time: z.string(),
  recommended_version: z.string(),
  cover_letter_focus: z.string(),
});

export const DayActivitySchema = z.object({
  day: z.string(),
  count: z.number(),
});

export const MonthActivitySchema = z.object({
  month: z.string(),
  count: z.number(),
});

export const ApplicationAnalyticsSchema = z.object({
  total_applications: z.number(),
  callbacks: z.number(),
  interviews: z.number(),
  offers: z.number(),
  acceptance_rate: z.number(),
  weekly_activity: z.array(DayActivitySchema),
  monthly_activity: z.array(MonthActivitySchema),
  most_successful_role: z.string(),
});

export const CareerGoalStatsSchema = z.object({
  current_score: z.number(),
  best_score: z.number(),
  improvement_trend: z.string(),
  applications_count: z.number(),
  interviews_count: z.number(),
  offers_count: z.number(),
  career_goal: z.string(),
  daily_progress: z.number(),
});

export const HistoryPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const SkillProgressionSchema = z.object({
  skill_name: z.string(),
  current_value: z.number(),
  history: z.array(HistoryPointSchema),
});

export const CourseRecommendationSchema = z.object({
  title: z.string(),
  provider: z.string(),
  url: z.string().optional(),
});

export const ProjectRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const CareerCoachAdviceSchema = z.object({
  todays_priority: z.string(),
  this_week: z.string(),
  this_month: z.string(),
  recommended_courses: z.array(CourseRecommendationSchema),
  recommended_projects: z.array(ProjectRecommendationSchema),
  expected_outcome: z.string(),
});

export const WeeklyChallengeItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  points: z.number(),
});

export const AchievementBadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  progress: z.number(),
  unlock_percentage: z.number(),
  unlocked: z.boolean(),
  icon: z.string(),
});

export const ProgressTimelineWeekSchema = z.object({
  week: z.string(),
  ats_score_improvement: z.number(),
  applications_sent: z.number(),
  interviews_obtained: z.number(),
  skills_learned: z.array(z.string()),
});

export const CareerChatInitialSchema = z.object({
  welcome_message: z.string(),
  suggested_prompts: z.array(z.string()),
});

export const ResumeMemoryItemSchema = z.object({
  version_name: z.string(),
  date: z.string(),
  ats_score: z.number(),
  improvements: z.array(z.string()),
  notes: z.string(),
});

export const ApplicationMemoryItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  resume_version: z.string(),
  status: z.string(),
  interview_notes: z.string(),
  rejection_reasons: z.array(z.string()).optional(),
  offer_details: z.string().optional(),
});

export const InterviewMemoryItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  company: z.string(),
  rounds: z.array(z.string()),
  technical_questions: z.array(z.string()),
  behavioral_questions: z.array(z.string()),
  feedback: z.string(),
  weak_areas: z.array(z.string()),
});

export const CareerKnowledgeGraphSchema = z.object({
  skills: z.array(z.string()),
  projects: z.array(z.string()),
  experience_summary: z.string(),
  career_goals: z.array(z.string()),
  target_companies: z.array(z.string()),
  applications_count: z.number(),
  achievements: z.array(z.string()),
  preferred_roles: z.array(z.string()),
});

export const OpportunityScoreDetailsSchema = z.object({
  overall_match: z.number(),
  ats_compatibility: z.number(),
  recruiter_appeal: z.number(),
  skill_match: z.number(),
  experience_match: z.number(),
  competition_level: z.string(),
  estimated_interview_chance: z.number(),
});

export const JobMatchRecommendationSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  match_percent: z.number(),
  workplace_type: z.enum(["Remote", "Hybrid", "Onsite"]),
  salary_range: z.string(),
  recommendation_reason: z.string(),
  location: z.string(),
});

export const SmartResumeSelectorItemSchema = z.object({
  job_id: z.string(),
  best_version: z.string(),
  selection_reason: z.string(),
  expected_ats_improvement: z.number(),
  expected_recruiter_appeal: z.number(),
  confidence_score: z.number(),
});

export const PreApplicationOptimizerDetailsSchema = z.object({
  job_id: z.string(),
  missing_skills: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  missing_achievements: z.array(z.string()),
  resume_improvements: z.array(z.string()),
  cover_letter_suggestions: z.array(z.string()),
  time_to_improve: z.string(),
  ats_gain: z.number(),
  interview_probability_increase: z.number(),
});

export const TrendingCompanySchema = z.object({
  name: z.string(),
  open_roles: z.number(),
  trend: z.string(),
});

export const BestMatchSchema = z.object({
  company: z.string(),
  role: z.string(),
  match_percent: z.number(),
});

export const RecommendedAppSchema = z.object({
  company: z.string(),
  role: z.string(),
  difficulty: z.string(),
});

export const WeeklyOpportunityFeedDetailsSchema = z.object({
  trending_companies: z.array(TrendingCompanySchema),
  best_matches: z.array(BestMatchSchema),
  recommended_applications: z.array(RecommendedAppSchema),
  weekly_application_target: z.number(),
  personalized_strategy: z.string(),
});

export const AnalysisResultSchema = z.object({
  score: z.number(),
  keyword_match_percent: z.number(),
  format_score: z.number(),
  readability: z.string(),
  keywords_found: z.array(z.string()),
  keywords_missing: z.array(z.string()),
  rejection_reasons: z.array(RejectionReasonSchema),
  company_archetype: CompanyArchetypeSchema,
  quick_wins: z.array(QuickWinSchema),
  rewrite_suggestion: z.string(),
  ats_simulation: z.array(ATSSystemDetailsSchema),
  recruiter_eyes: RecruiterEyesSchema,
  scan_timeline: z.array(ScanTimelineStepSchema),
  resume_heatmap: z.array(HeatmapSectionSchema),
  attention_scores: z.array(AttentionScoreSchema),
  emotional_impression: z.array(EmotionalImpressionAttributeSchema),
  hiring_probability: HiringProbabilitySchema,
  salary_intelligence: SalaryIntelligenceSchema,
  skill_gap: SkillGapSchema,
  career_roadmap: CareerRoadmapSchema,
  resume_competitiveness: ResumeCompetitivenessSchema,
  application_tracker: z.array(ApplicationTrackerItemSchema),
  resume_versions: z.array(ResumeVersionMetricSchema),
  job_match: JobMatchResultSchema,
  application_analytics: ApplicationAnalyticsSchema,
  application_checklist: ApplicationChecklistSchema,
  career_dashboard: CareerGoalStatsSchema,
  skill_evolution: z.array(SkillProgressionSchema),
  career_coach: CareerCoachAdviceSchema,
  weekly_challenges: z.array(WeeklyChallengeItemSchema),
  achievements: z.array(AchievementBadgeSchema),
  progress_timeline: z.array(ProgressTimelineWeekSchema),
  career_chat: CareerChatInitialSchema,
  resume_memory: z.array(ResumeMemoryItemSchema),
  application_memory: z.array(ApplicationMemoryItemSchema),
  interview_memory: z.array(InterviewMemoryItemSchema),
  knowledge_graph: CareerKnowledgeGraphSchema,
  opportunity_engine: OpportunityScoreDetailsSchema,
  job_matches: z.array(JobMatchRecommendationSchema),
  resume_selector: z.array(SmartResumeSelectorItemSchema),
  pre_application_optimizer: z.array(PreApplicationOptimizerDetailsSchema),
  weekly_feed: WeeklyOpportunityFeedDetailsSchema,
});
