export interface Keyword {
  word: string;
  matched: boolean;
  category: "Technical" | "Soft Skill" | "Experience" | "Tool";
  importance: "high" | "medium" | "low";
  reason: string;
}

export interface FeedbackCardType {
  id: string;
  type: "warning" | "success" | "info" | "critical";
  title: string;
  description: string;
  fixSuggestion: string;
}

export interface ResumeTemplate {
  id: string;
  role: string;
  targetJob: string;
  candidateName: string;
  originalScore: number;
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    bullets: string[];
  }[];
  skills: string[];
  keywords: Keyword[];
  feedback: FeedbackCardType[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  popular: boolean;
  badge?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
  text: string;
  improvement: string;
}
