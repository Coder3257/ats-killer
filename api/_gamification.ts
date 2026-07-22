import { getSupabaseAdmin } from "./_utils.js";

export function getUTCWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0));
  return monday;
}

export async function recalculateGamification(userId: string) {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error("Database admin client is not configured.");
  }

  // 1. Fetch score history
  const { data: scoreData, error: scoreErr } = await adminClient
    .from("score_history")
    .select("score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (scoreErr) throw scoreErr;
  const history = scoreData || [];

  // 2. Fetch applications counts
  const { data: appData, error: appErr } = await adminClient
    .from("job_applications")
    .select("status, created_at")
    .eq("user_id", userId);

  if (appErr) throw appErr;
  const apps = appData || [];

  // 3. Compute counts
  const currentScans = history.length;
  const currentApps = apps.length;
  const hasInterviewState = apps.some(a => ["OA", "Interview", "Offer", "Accepted"].includes(a.status));

  // Trailing 7 days score history count
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trailing7DaysScans = history.filter(h => new Date(h.created_at) >= sevenDaysAgo).length;

  // Score climber logic
  let scoreClimberUnlocked = false;
  let scoreClimberProgress = 0;
  if (history.length >= 2) {
    const firstScore = history[0].score;
    const latestScore = history[history.length - 1].score;
    const scoreDiff = latestScore - firstScore;
    if (scoreDiff >= 15) {
      scoreClimberUnlocked = true;
    }
    scoreClimberProgress = Math.max(0, Math.min(100, Math.round((scoreDiff / 15) * 100)));
  }

  // Achievements
  const achievements = [
    {
      user_id: userId,
      achievement_id: "ach-1",
      unlocked: currentScans >= 1,
      progress: currentScans >= 1 ? 100 : 0
    },
    {
      user_id: userId,
      achievement_id: "ach-2",
      unlocked: currentScans >= 3,
      progress: Math.min(100, Math.round((currentScans / 3) * 100))
    },
    {
      user_id: userId,
      achievement_id: "ach-3",
      unlocked: currentApps >= 5,
      progress: Math.min(100, Math.round((currentApps / 5) * 100))
    },
    {
      user_id: userId,
      achievement_id: "ach-4",
      unlocked: hasInterviewState,
      progress: hasInterviewState ? 100 : 0
    },
    {
      user_id: userId,
      achievement_id: "consistent_scorer",
      unlocked: trailing7DaysScans >= 3,
      progress: Math.min(100, Math.round((trailing7DaysScans / 3) * 100))
    },
    {
      user_id: userId,
      achievement_id: "score_climber",
      unlocked: scoreClimberUnlocked,
      progress: scoreClimberProgress
    }
  ];

  // Upsert achievements
  for (const ach of achievements) {
    const { error: upsertErr } = await adminClient.from("user_achievements").upsert(ach, {
      onConflict: "user_id,achievement_id"
    });
    if (upsertErr) console.error("Error upserting achievement:", upsertErr);
  }

  // Weekly challenges
  const weekStartStr = getUTCWeekStart().toISOString().split("T")[0];

  // Scans this week
  const weekStart = getUTCWeekStart();
  const scansThisWeek = history.filter(h => new Date(h.created_at) >= weekStart).length;
  const appsThisWeek = apps.filter(a => new Date(a.created_at) >= weekStart).length;

  const challenges = [
    {
      user_id: userId,
      week_start: weekStartStr,
      challenge_key: "challenge-1",
      completed: scansThisWeek >= 1,
      points: 20
    },
    {
      user_id: userId,
      week_start: weekStartStr,
      challenge_key: "challenge-2",
      completed: appsThisWeek >= 1,
      points: 30
    },
    {
      user_id: userId,
      week_start: weekStartStr,
      challenge_key: "scans_3_this_week",
      completed: scansThisWeek >= 3,
      points: 50
    }
  ];

  // Upsert challenges
  for (const chal of challenges) {
    const { error: upsertErr } = await adminClient.from("weekly_challenges").upsert(chal, {
      onConflict: "user_id,week_start,challenge_key"
    });
    if (upsertErr) console.error("Error upserting weekly challenge:", upsertErr);
  }

  return { achievements, challenges, week_start: weekStartStr };
}

export const DEFAULT_BADGES = [
  { id: "ach-1", name: "First Scan", description: "Run a resume analysis", unlock_percentage: 95, icon: "🚀" },
  { id: "ach-2", name: "Resume Pro", description: "Run at least 3 resume scans", unlock_percentage: 45, icon: "📄" },
  { id: "ach-3", name: "Active Applicant", description: "Track 5 applications", unlock_percentage: 30, icon: "💼" },
  { id: "ach-4", name: "Interview Star", description: "Obtain an interview or offer stage", unlock_percentage: 12, icon: "✨" },
  { id: "consistent_scorer", name: "Consistent Scorer", description: "3 scans in trailing 7 days", unlock_percentage: 25, icon: "🔥" },
  { id: "score_climber", name: "Score Climber", description: "Improve latest score by 15+ vs first", unlock_percentage: 10, icon: "📈" }
];

export const DEFAULT_CHALLENGES = [
  { id: "challenge-1", title: "Analyze a resume", description: "Scan against a new JD this week", points: 20 },
  { id: "challenge-2", title: "Track a new application", description: "Add a job application this week", points: 30 },
  { id: "scans_3_this_week", title: "3 scans this week", description: "Scan your resume 3 times this week", points: 50 }
];

export async function getGamificationData(userId: string) {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error("Database admin client is not configured.");
  }

  // Ensure fresh recalculation
  await recalculateGamification(userId);

  // Fetch score history
  const { data: scoreData, error: scoreErr } = await adminClient
    .from("score_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (scoreErr) throw scoreErr;

  // Fetch skill progress
  const { data: skillData, error: skillErr } = await adminClient
    .from("skill_progress")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });
  if (skillErr) throw skillErr;

  // Fetch achievements
  const { data: achData, error: achErr } = await adminClient
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);
  if (achErr) throw achErr;

  // Fetch weekly challenges for the current week start
  const weekStartStr = getUTCWeekStart().toISOString().split("T")[0];
  const { data: chalData, error: chalErr } = await adminClient
    .from("weekly_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStartStr);
  if (chalErr) throw chalErr;

  // Merge achievements with default metadata
  const mergedAchievements = DEFAULT_BADGES.map(badge => {
    const matched = achData?.find(a => a.achievement_id === badge.id);
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      unlock_percentage: badge.unlock_percentage,
      icon: badge.icon,
      unlocked: matched ? matched.unlocked : false,
      progress: matched ? matched.progress : 0
    };
  });

  // Merge weekly challenges with default metadata
  const mergedChallenges = DEFAULT_CHALLENGES.map(chal => {
    const matched = chalData?.find(c => c.challenge_key === chal.id);
    return {
      id: chal.id,
      title: chal.title,
      description: chal.description,
      points: matched ? matched.points : chal.points,
      completed: matched ? matched.completed : false
    };
  });

  return {
    scoreHistory: scoreData || [],
    skillProgress: skillData || [],
    achievements: mergedAchievements,
    challenges: mergedChallenges,
    week_start: weekStartStr
  };
}

export async function updateChallengeStatus(userId: string, challengeKey: string, completed: boolean, points: number) {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error("Database admin client is not configured.");
  }

  const weekStartStr = getUTCWeekStart().toISOString().split("T")[0];

  const { error: upsertErr } = await adminClient
    .from("weekly_challenges")
    .upsert({
      user_id: userId,
      week_start: weekStartStr,
      challenge_key: challengeKey,
      completed,
      points
    }, {
      onConflict: "user_id,week_start,challenge_key"
    });

  if (upsertErr) throw upsertErr;

  return getGamificationData(userId);
}

