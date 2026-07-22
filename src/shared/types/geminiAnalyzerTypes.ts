import type { z } from "zod";
import { AnalysisResultSchema } from "../services/schemas/analysisSchema";
import { JobMatchResultSchema } from "../services/schemas/jobMatchSchema";

export interface RejectionReason {
    title: string;
    description: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface ArchetypeInsight {
    icon: string;
    title: string;
    explanation: string;
}

export interface CompanyArchetype {
    label: string;
    insights: ArchetypeInsight[];
}

export interface ATSSystemDetails {
    name: "Workday" | "Greenhouse" | "Lever" | "Ashby" | "Taleo";
    score: number;
    status: "PASS" | "FAIL";
    explanation: string;
    biggest_issue: string;
    parsing_failure_reason: string;
    literal_fix: string;
}

export interface QuickWin {
    title: string;
    description: string;
    impact_increase: number;
    time_required: string;
    original_context: string;
}

export interface RecruiterEyes {
    first_noticed: string[];
    ignored_items: string[];
    skipped_sections: string[];
    strongest_section: string;
    weakest_section: string;
    estimated_reading_time: string;
    verdict: string;
    interview_probability: number;
}

export interface ScanTimelineStep {
    time_elapsed: string;
    section_name: string;
    observation: string;
}

export interface HeatmapSection {
    section: "Summary" | "Experience" | "Projects" | "Skills" | "Education" | "Certifications";
    grade: "Excellent" | "Good" | "Average" | "Weak";
    score_percent: number;
}

export interface AttentionScore {
    section: string;
    percentage: number;
}

export interface EmotionalImpressionAttribute {
    attribute:
    | "Confident"
    | "Leadership"
    | "Technical Depth"
    | "Ownership"
    | "Innovation"
    | "Communication"
    | "Professionalism";
    score: number;
}

export interface ProbabilityPrediction {
    percentage: number;
    confidence: number;
    explanation: string;
}

export interface HiringProbability {
    ats_pass: ProbabilityPrediction;
    recruiter_callback: ProbabilityPrediction;
    interview: ProbabilityPrediction;
    offer: ProbabilityPrediction;
}

export interface SalaryIntelligence {
    current_market: string;
    expected: string;
    potential: string;
    percentile: number;
    reasoning: string;
}

export interface SkillGapItem {
    name: string;
    category:
    | "Already Strong"
    | "Needs Improvement"
    | "Critical Missing"
    | "Learning Priority";
    learning_time: string;
}

export interface SkillGap {
    comparison: SkillGapItem[];
}

export interface RoadmapStep {
    timeframe:
    | "Immediate Fixes"
    | "This Week"
    | "This Month"
    | "Next 90 Days"
    | "Long-term";
    title: string;
    description: string;
}

export interface CareerRoadmap {
    steps: RoadmapStep[];
}

export interface ResumeCompetitiveness {
    technical_skills: number;
    leadership: number;
    communication: number;
    problem_solving: number;
    business_understanding: number;
    ats_friendliness: number;
    recruiter_appeal: number;
    overall: number;
}

export interface ApplicationChecklist {
    resume_customized: boolean;
    cover_letter: boolean;
    linkedin_updated: boolean;
    portfolio_ready: boolean;
    github_updated: boolean;
    followup_sent: boolean;
    interview_scheduled: boolean;
}

export interface ApplicationTrackerItem {
    id: string;
    company: string;
    position: string;
    date_applied: string;
    resume_version: string;
    ats_score: number;
    status:
    | "Wishlist"
    | "Applied"
    | "OA"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Accepted";
    notes: string;
    checklist: ApplicationChecklist;
}

export interface ResumeVersionMetric {
    version_name: string;
    applications_sent: number;
    interview_rate: number;
    offer_rate: number;
    avg_ats_score: number;
}

export interface JobMatchResult {
    compatibility_score: number;
    missing_skills: string[];
    strengths: string[];
    est_prep_time: string;
    recommended_version: string;
    cover_letter_focus: string;
}

export interface ApplicationAnalytics {
    total_applications: number;
    callbacks: number;
    interviews: number;
    offers: number;
    acceptance_rate: number;
    weekly_activity: { day: string; count: number }[];
    monthly_activity: { month: string; count: number }[];
    most_successful_role: string;
}

export interface CareerGoalStats {
    current_score: number;
    best_score: number;
    improvement_trend: string;
    applications_count: number;
    interviews_count: number;
    offers_count: number;
    career_goal: string;
    daily_progress: number;
}

export interface SkillProgression {
    skill_name: string;
    current_value: number;
    history: { date: string; value: number }[];
}

export interface CourseRecommendation {
    title: string;
    provider: string;
    url?: string;
}

export interface ProjectRecommendation {
    title: string;
    description: string;
}

export interface CareerCoachAdvice {
    todays_priority: string;
    this_week: string;
    this_month: string;
    recommended_courses: CourseRecommendation[];
    recommended_projects: ProjectRecommendation[];
    expected_outcome: string;
}

export interface WeeklyChallengeItem {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    points: number;
}

export interface AchievementBadge {
    id: string;
    name: string;
    description: string;
    progress: number;
    unlock_percentage: number;
    unlocked: boolean;
    icon: string;
}

export interface ProgressTimelineWeek {
    week: string;
    ats_score_improvement: number;
    applications_sent: number;
    interviews_obtained: number;
    skills_learned: string[];
}

export interface ResumeMemoryItem {
    version_name: string;
    date: string;
    ats_score: number;
    improvements: string[];
    notes: string;
}

export interface ApplicationMemoryItem {
    id: string;
    company: string;
    role: string;
    resume_version: string;
    status: string;
    interview_notes: string;
    rejection_reasons?: string[];
    offer_details?: string;
}

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

export interface CareerKnowledgeGraph {
    skills: string[];
    projects: string[];
    experience_summary: string;
    career_goals: string[];
    target_companies: string[];
    applications_count: number;
    achievements: string[];
    preferred_roles: string[];
}

export interface CareerChatInitial {
    welcome_message: string;
    suggested_prompts: string[];
}

export interface JobMatchRecommendation {
    id: string;
    company: string;
    role: string;
    match_percent: number;
    workplace_type: "Remote" | "Hybrid" | "Onsite";
    salary_range: string;
    recommendation_reason: string;
    location: string;
}

export interface OpportunityScoreDetails {
    overall_match: number;
    ats_compatibility: number;
    recruiter_appeal: number;
    skill_match: number;
    experience_match: number;
    competition_level: string;
    estimated_interview_chance: number;
}

export interface SmartResumeSelectorItem {
    job_id: string;
    best_version: string;
    selection_reason: string;
    expected_ats_improvement: number;
    expected_recruiter_appeal: number;
    confidence_score: number;
}

export interface PreApplicationOptimizerDetails {
    job_id: string;
    missing_skills: string[];
    missing_keywords: string[];
    missing_achievements: string[];
    resume_improvements: string[];
    cover_letter_suggestions: string[];
    time_to_improve: string;
    ats_gain: number;
    interview_probability_increase: number;
}

export interface WeeklyOpportunityFeedDetails {
    trending_companies: { name: string; open_roles: number; trend: string }[];
    best_matches: { company: string; role: string; match_percent: number }[];
    recommended_applications: { company: string; role: string; difficulty: string }[];
    weekly_application_target: number;
    personalized_strategy: string;
}

export interface AnalysisResult {
    score: number;
    keyword_match_percent: number;
    format_score: number;
    readability: string;
    keywords_found: string[];
    keywords_missing: string[];
    rejection_reasons: RejectionReason[];
    company_archetype: CompanyArchetype;
    quick_wins: QuickWin[];
    rewrite_suggestion: string;
    ats_simulation: ATSSystemDetails[];
    recruiter_eyes: RecruiterEyes;
    scan_timeline: ScanTimelineStep[];
    resume_heatmap: HeatmapSection[];
    attention_scores: AttentionScore[];
    emotional_impression: EmotionalImpressionAttribute[];
    hiring_probability: HiringProbability;
    salary_intelligence: SalaryIntelligence;
    skill_gap: SkillGap;
    career_roadmap: CareerRoadmap;
    resume_competitiveness: ResumeCompetitiveness;
    application_tracker: ApplicationTrackerItem[];
    resume_versions: ResumeVersionMetric[];
    job_match: JobMatchResult;
    application_analytics: ApplicationAnalytics;
    application_checklist: ApplicationChecklist;
    career_dashboard: CareerGoalStats;
    skill_evolution: SkillProgression[];
    career_coach: CareerCoachAdvice;
    weekly_challenges: WeeklyChallengeItem[];
    achievements: AchievementBadge[];
    progress_timeline: ProgressTimelineWeek[];
    career_chat: CareerChatInitial;
    resume_memory: ResumeMemoryItem[];
    application_memory: ApplicationMemoryItem[];
    interview_memory: InterviewMemoryItem[];
    knowledge_graph: CareerKnowledgeGraph;
    opportunity_engine: OpportunityScoreDetails;
    job_matches: JobMatchRecommendation[];
    resume_selector: SmartResumeSelectorItem[];
    pre_application_optimizer: PreApplicationOptimizerDetails[];
    weekly_feed: WeeklyOpportunityFeedDetails;
}

// Convenience aliases (keeps type names easy to import)
export type { AnalysisResult as GeminiAnalysisResult };
export type { JobMatchResult as GeminiJobMatchResult };
