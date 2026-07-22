import { ResumeTemplate, PricingPlan, Testimonial } from "../types";

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "swe",
    role: "Software Engineer",
    targetJob: "Senior Frontend Engineer at Stripe",
    candidateName: "Alex Mercer",
    originalScore: 73,
    summary: "Passionate Frontend Developer with 4+ years of experience building web applications. Highly skilled in React, JavaScript, and CSS. Looking to join a growth-stage company to deliver scalable features.",
    experience: [
      {
        company: "PixelTech Solutions",
        role: "Software Engineer",
        period: "2023 - Present",
        bullets: [
          "Developed web interfaces using React and Tailwind CSS, increasing page load speed by 20%.",
          "Collaborated with backend engineers to integrate RESTful API endpoints and state management.",
          "Wrote basic scripts to automate build processes using Webpack and Vite."
        ]
      },
      {
        company: "AppForge LLC",
        role: "Junior Developer",
        period: "2021 - 2023",
        bullets: [
          "Maintained and updated customer-facing dashboard in Angular and JavaScript.",
          "Fixed UI bugs and added styling updates according to Figma designs."
        ]
      }
    ],
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Redux", "Tailwind CSS", "HTML5", "CSS3", "Webpack", "Vite", "Git"],
    keywords: [
      {
        word: "TypeScript",
        matched: true,
        category: "Technical",
        importance: "high",
        reason: "Stripe's codebase is heavily built on type-safe modern TS."
      },
      {
        word: "CI/CD Pipelines",
        matched: false,
        category: "Tool",
        importance: "high",
        reason: "Required for Stripe's continuous delivery model. No mention in resume."
      },
      {
        word: "Unit Testing (Jest)",
        matched: false,
        category: "Technical",
        importance: "medium",
        reason: "Crucial for reliable Stripe integration. Need Jest/React Testing Library."
      },
      {
        word: "Distributed Systems",
        matched: false,
        category: "Experience",
        importance: "high",
        reason: "Required for managing high-volume payment infrastructure scaling."
      },
      {
        word: "Performance Optimization",
        matched: true,
        category: "Technical",
        importance: "high",
        reason: "Stripe requires sub-second load times for billing pages."
      },
      {
        word: "State Management",
        matched: true,
        category: "Technical",
        importance: "medium",
        reason: "Needed for rich, complex multi-step payment states."
      }
    ],
    feedback: [
      {
        id: "fb-1",
        type: "critical",
        title: "Missing Key Technical Frameworks",
        description: "Stripe job description explicitly requests hands-on experience with modern CI/CD pipelines and Unit Testing (Jest). Your resume currently lacks these keywords completely.",
        fixSuggestion: "Add a line about setting up GitHub Actions or Jest test suites under your PixelTech experience."
      },
      {
        id: "fb-2",
        type: "warning",
        title: "Weak Action Verbs",
        description: "You used 'Collaborated with' and 'Wrote basic scripts'. ATS systems prioritize active, authoritative action verbs.",
        fixSuggestion: "Replace 'Collaborated with' with 'Engineered seamless server integrations' and 'Wrote basic' with 'Automated release management'."
      },
      {
        id: "fb-3",
        type: "success",
        title: "Great Frontend Base",
        description: "Your match for core frontend technologies (React, TypeScript, state management) is extremely strong and aligns perfectly with Stripe's UI team requirements.",
        fixSuggestion: "Keep these highlighted. Ensure they are mentioned in multiple job entries."
      }
    ]
  },
  {
    id: "pm",
    role: "Product Manager",
    targetJob: "Growth Product Manager at Notion",
    candidateName: "Sarah Chen",
    originalScore: 68,
    summary: "Dedicated Product Manager with background in user research and agile project delivery. Experienced in coordinate cross functional teams to execute product features on timeline. Passionate about user-friendly collaboration tools.",
    experience: [
      {
        company: "ScribeFlow Corp",
        role: "Associate Product Manager",
        period: "2024 - Present",
        bullets: [
          "Gathered requirements from 20+ clients to draft feature specifications.",
          "Organized sprint meetings, daily standups, and retrospective workshops with design and engineering.",
          "Managed the launching of the new comment system, resolving minor user bugs."
        ]
      },
      {
        company: "Hatch Analytics",
        role: "Business Analyst",
        period: "2022 - 2024",
        bullets: [
          "Analyzed web traffic logs and user click sessions to find drop-offs.",
          "Prepared PowerPoint slides for quarterly executive sync meetings."
        ]
      }
    ],
    skills: ["Product Roadmap", "User Research", "Agile/Scrum", "Jira", "SQL", "Figma", "Data Analytics", "PowerBI"],
    keywords: [
      {
        word: "A/B Testing",
        matched: false,
        category: "Technical",
        importance: "high",
        reason: "Growth PMs must validate features scientifically via experiments."
      },
      {
        word: "Product Strategy",
        matched: true,
        category: "Experience",
        importance: "high",
        reason: "Crucial for planning mid-to-long term collaboration tools."
      },
      {
        word: "User Personas",
        matched: false,
        category: "Soft Skill",
        importance: "medium",
        reason: "Notion requires deep empathy for creator and developer personas."
      },
      {
        word: "CAC/LTV Metrics",
        matched: false,
        category: "Technical",
        importance: "high",
        reason: "Growth product roles focus heavily on monetization and acquisition loops."
      },
      {
        word: "Agile Roadmap",
        matched: true,
        category: "Tool",
        importance: "medium",
        reason: "Essential for managing Notion's lightning fast sprint velocities."
      }
    ],
    feedback: [
      {
        id: "fb-pm-1",
        type: "critical",
        title: "Lack of Metric Impact",
        description: "Your achievements are phrased as duties ('Organized sprints', 'Gathered requirements') rather than business impact. ATS parsing looks for growth metrics.",
        fixSuggestion: "Rephrase responsibilities to show numeric outcomes, e.g., 'Boosted active user engagement by 18% via commenting system redesign'."
      },
      {
        id: "fb-pm-2",
        type: "warning",
        title: "Missing Growth Metrics Terminology",
        description: "Notion Growth PM requires understanding growth loops. Missing crucial terms like A/B Testing, CAC/LTV, and conversion rate optimization.",
        fixSuggestion: "Explicitly state your experience with cohort analysis or acquisition experiments in Hatch Analytics."
      }
    ]
  },
  {
    id: "marketing",
    role: "Growth Marketer",
    targetJob: "Acquisition Lead at Airbnb",
    candidateName: "Daniel K.",
    originalScore: 71,
    summary: "Creative marketing professional specializing in content creation, social media management, and branding campaigns. Excellent verbal and written communicator with passion for hospitality and travel apps.",
    experience: [
      {
        company: "RoamFree Travel",
        role: "Marketing Associate",
        period: "2023 - Present",
        bullets: [
          "Created weekly Instagram and TikTok posts, gaining 5,000 new followers.",
          "Wrote travel blog posts and newsletters to engage our email subscribers.",
          "Helped organize influencer travel partnerships and sponsorships."
        ]
      }
    ],
    skills: ["Social Media", "Content Writing", "Email Marketing", "Canva", "SEO", "Influencer Relations", "Copywriting"],
    keywords: [
      {
        word: "CAC (Customer Acquisition Cost)",
        matched: false,
        category: "Technical",
        importance: "high",
        reason: "Airbnb acquisition loops are heavily optimized around payback periods."
      },
      {
        word: "Google Analytics",
        matched: true,
        category: "Tool",
        importance: "high",
        reason: "Required to track conversion attribution across multiple paid channels."
      },
      {
        word: "Paid Ads (Meta/Google)",
        matched: false,
        category: "Experience",
        importance: "high",
        reason: "Airbnb seeks marketer with experience managing budget targets."
      },
      {
        word: "SEO Optimization",
        matched: false,
        category: "Technical",
        importance: "medium",
        reason: "Vital for organic capture of high-intent travel query terms."
      }
    ],
    feedback: [
      {
        id: "fb-mkt-1",
        type: "critical",
        title: "Missing Paid Acquisition Experience",
        description: "You've only listed organic social media (Instagram, TikTok). Airbnb's Acquisition Lead requires paid performance marketing background.",
        fixSuggestion: "Highlight any budget allocation, paid campaigns, or search engine marketing you managed, even on a small scale."
      }
    ]
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Great for a quick scan before submitting an application.",
    features: [
      "1 Resume scan per month",
      "Essential ATS score indicator",
      "Top 3 missing keyword highlights",
      "Standard PDF compatibility check"
    ],
    ctaText: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "₹299",
    period: "month",
    description: "Perfect for active job seekers looking to land interviews quickly.",
    features: [
      "Unlimited resume scans",
      "Full keyword matching (Technical + Soft Skills)",
      "One-click AI Resume Rewriter",
      "Real-time feedback & optimization cards",
      "Import job descriptions directly",
      "ATS-friendly resume download formats"
    ],
    ctaText: "Upgrade to Pro",
    popular: true,
    badge: "Most Popular"
  },
  {
    name: "Lifetime",
    price: "₹999",
    period: "one-time",
    description: "Best for professionals planning long-term career pivots.",
    features: [
      "Lifetime access to all Pro features",
      "1-on-1 Human Expert Resume Review",
      "Priority customer service with 4-hr response",
      "Cover letter optimizer & matches",
      "LinkedIn Profile Scanner plugin",
      "Zero monthly commitments"
    ],
    ctaText: "Get Lifetime Access",
    popular: false
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Aman Gupta",
    role: "Full Stack Engineer",
    company: "Swiggy",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
    text: "My resume was getting rejected within 5 minutes of applying online. I ran it through ATS Killer, added the 4 missing keywords it suggested, and got a callback from Swiggy the very next week!",
    improvement: "+45% Response Rate"
  },
  {
    id: "t2",
    name: "Priyanka Roy",
    role: "Senior Product Manager",
    company: "Paytm",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5,
    text: "The AI Rewriter feature is pure gold. It transformed my passive bullet points into high-impact metrics. My ATS score went from 62 to 94, and I suddenly had 3 interview loops running simultaneously.",
    improvement: "3 Interviews in 10 Days"
  },
  {
    id: "t3",
    name: "Vikram Malhotra",
    role: "Growth Analyst",
    company: "Razorpay",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    rating: 5,
    text: "I didn't realize how many hidden keywords employers put in job posts. ATS Killer uncovers them instantly. It is literally a cheat code for landing interviews.",
    improvement: "Interviews at top 4 startups"
  }
];
