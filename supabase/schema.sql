-- supabase/schema.sql
-- Production-ready Database Schema for ATS Killer SaaS Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. RESUMES Table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index resumes_user_id_idx on public.resumes(user_id);
alter table public.resumes enable row level security;

create policy "Allow users access to their own resumes select" on public.resumes
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own resumes insert" on public.resumes
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own resumes update" on public.resumes
  for update using (auth.uid() = user_id);

create policy "Allow users access to their own resumes delete" on public.resumes
  for delete using (auth.uid() = user_id);

-- 3. RESUME_VERSIONS Table
create table public.resume_versions (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes on delete cascade not null,
  version_name text not null,
  file_path text not null, -- Supabase Storage path
  file_size integer not null,
  ats_score integer not null,
  notes text,
  raw_text text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index resume_versions_resume_id_idx on public.resume_versions(resume_id);
alter table public.resume_versions enable row level security;

create policy "Allow users access to their own resume_versions select" on public.resume_versions
  for select using (
    exists (
      select 1 from public.resumes
      where public.resumes.id = resume_id and public.resumes.user_id = auth.uid()
    )
  );

create policy "Allow users access to their own resume_versions insert" on public.resume_versions
  for insert with check (
    exists (
      select 1 from public.resumes
      where public.resumes.id = resume_id and public.resumes.user_id = auth.uid()
    )
  );

create policy "Allow users access to their own resume_versions update" on public.resume_versions
  for update using (
    exists (
      select 1 from public.resumes
      where public.resumes.id = resume_id and public.resumes.user_id = auth.uid()
    )
  );

create policy "Allow users access to their own resume_versions delete" on public.resume_versions
  for delete using (
    exists (
      select 1 from public.resumes
      where public.resumes.id = resume_id and public.resumes.user_id = auth.uid()
    )
  );

-- 4. ANALYSES Table
create table public.analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  resume_version_id uuid references public.resume_versions on delete cascade not null,
  job_description text,
  ats_score integer not null,
  recruiter_intelligence jsonb not null,
  career_intelligence jsonb not null,
  opportunity_engine jsonb not null,
  career_dashboard jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index analyses_user_id_idx on public.analyses(user_id);
create index analyses_resume_version_id_idx on public.analyses(resume_version_id);
alter table public.analyses enable row level security;

create policy "Allow users access to their own analyses select" on public.analyses
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own analyses insert" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own analyses delete" on public.analyses
  for delete using (auth.uid() = user_id);

-- 5. JOB_APPLICATIONS Table
create table public.job_applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text not null,
  role text not null,
  salary text,
  resume_version text not null,
  status text not null, -- Wishlist, Applied, OA, Interview, Offer, Rejected, Accepted
  interview_stage text,
  notes text,
  attachments jsonb default '[]'::jsonb,
  timeline jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index job_applications_user_id_idx on public.job_applications(user_id);
alter table public.job_applications enable row level security;

create policy "Allow users access to their own job_applications select" on public.job_applications
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own job_applications insert" on public.job_applications
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own job_applications update" on public.job_applications
  for update using (auth.uid() = user_id);

create policy "Allow users access to their own job_applications delete" on public.job_applications
  for delete using (auth.uid() = user_id);

-- 6. INTERVIEWS Table
create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  application_id uuid references public.job_applications on delete cascade not null,
  date timestamptz not null,
  company text not null,
  rounds jsonb default '[]'::jsonb not null,
  technical_questions jsonb default '[]'::jsonb not null,
  behavioral_questions jsonb default '[]'::jsonb not null,
  feedback text,
  weak_areas jsonb default '[]'::jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index interviews_user_id_idx on public.interviews(user_id);
create index interviews_application_id_idx on public.interviews(application_id);
alter table public.interviews enable row level security;

create policy "Allow users access to their own interviews select" on public.interviews
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own interviews insert" on public.interviews
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own interviews update" on public.interviews
  for update using (auth.uid() = user_id);

create policy "Allow users access to their own interviews delete" on public.interviews
  for delete using (auth.uid() = user_id);

-- 7. CAREER_GOALS Table
create table public.career_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  target_role text not null,
  target_companies jsonb default '[]'::jsonb not null,
  preferred_locations jsonb default '[]'::jsonb not null,
  salary_goal text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index career_goals_user_id_idx on public.career_goals(user_id);
alter table public.career_goals enable row level security;

create policy "Allow users access to their own career_goals select" on public.career_goals
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own career_goals insert" on public.career_goals
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own career_goals update" on public.career_goals
  for update using (auth.uid() = user_id);

-- 8. ACHIEVEMENTS Table
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text not null,
  progress integer default 0 not null,
  unlocked boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index achievements_user_id_idx on public.achievements(user_id);
alter table public.achievements enable row level security;

create policy "Allow users access to their own achievements select" on public.achievements
  for select using (auth.uid() = user_id);

create policy "Allow users to update achievements" on public.achievements
  for update using (auth.uid() = user_id);

create policy "Allow users to insert achievements" on public.achievements
  for insert with check (auth.uid() = user_id);

-- 9. AI_CONVERSATIONS Table
create table public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  messages jsonb default '[]'::jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index ai_conversations_user_id_idx on public.ai_conversations(user_id);
alter table public.ai_conversations enable row level security;

create policy "Allow users access to their own ai_conversations select" on public.ai_conversations
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own ai_conversations insert" on public.ai_conversations
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own ai_conversations update" on public.ai_conversations
  for update using (auth.uid() = user_id);

-- 10. SUBSCRIPTIONS Table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text not null, -- active, trialing, canceled, past_due
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
alter table public.subscriptions enable row level security;

create policy "Allow users to read their subscription details" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 11. CREDITS Table
create table public.credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index credits_user_id_idx on public.credits(user_id);
alter table public.credits enable row level security;

create policy "Allow users to view their credits" on public.credits
  for select using (auth.uid() = user_id);

-- 12. ACTIVITY_LOGS Table
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index activity_logs_user_id_idx on public.activity_logs(user_id);
alter table public.activity_logs enable row level security;

create policy "Allow users read access to activity logs" on public.activity_logs
  for select using (auth.uid() = user_id);

create policy "Allow users to write activity logs" on public.activity_logs
  for insert with check (auth.uid() = user_id);

-- 13. NOTIFICATIONS Table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index notifications_user_id_idx on public.notifications(user_id);
alter table public.notifications enable row level security;

create policy "Allow users access to their own notifications select" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Allow users to update notification status" on public.notifications
  for update using (auth.uid() = user_id);

-- AUTOMATIC PROFILE TRIGGER ON AUTH.USERS CREATION
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'avatar_url', ''));

  insert into public.credits (user_id, amount)
  values (new.id, 50); -- Seed with 50 credits initially
  
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 14. RATE_LIMITS Table
create table public.rate_limits (
  user_id uuid references auth.users on delete cascade primary key,
  count integer default 0 not null,
  reset_time timestamptz not null
);

-- RPC for atomic rate limit tracking
create or replace function public.increment_rate_limit(
  p_user_id uuid,
  p_limit integer,
  p_window_ms integer
)
returns boolean -- returns true if rate limited, false if allowed
language plpgsql
security definer
as $$
declare
  v_count integer;
  v_reset_time timestamptz;
  v_now timestamptz := now();
begin
  -- Ensure a row exists for the user
  insert into public.rate_limits (user_id, count, reset_time)
  values (p_user_id, 0, v_now + (p_window_ms || ' milliseconds')::interval)
  on conflict (user_id) do nothing;

  -- Select the row with FOR UPDATE to lock it atomically for this transaction
  select count, reset_time
  into v_count, v_reset_time
  from public.rate_limits
  where user_id = p_user_id
  for update;

  -- Check reset window
  if v_now > v_reset_time then
    -- Window expired, reset window and count
    update public.rate_limits
    set count = 1,
        reset_time = v_now + (p_window_ms || ' milliseconds')::interval
    where user_id = p_user_id;
    return false;
  end if;

  -- Check limit
  if v_count >= p_limit then
    return true;
  end if;

  -- Under limit, increment count
  update public.rate_limits
  set count = count + 1
  where user_id = p_user_id;

  return false;
end;
$$;

grant execute on function public.increment_rate_limit(uuid, integer, integer) to service_role;
grant execute on function public.increment_rate_limit(uuid, integer, integer) to anon;
grant execute on function public.increment_rate_limit(uuid, integer, integer) to authenticated;

create index rate_limits_user_id_idx on public.rate_limits(user_id);
alter table public.rate_limits enable row level security;

create policy "Allow users access to their own rate limits select" on public.rate_limits
  for select using (auth.uid() = user_id);

create policy "Allow users access to their own rate limits insert" on public.rate_limits
  for insert with check (auth.uid() = user_id);

create policy "Allow users access to their own rate limits update" on public.rate_limits
  for update using (auth.uid() = user_id);

-- 15. PAYMENTS Table (Razorpay Idempotency tracking)
create table public.payments (
  razorpay_payment_id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index payments_user_id_idx on public.payments(user_id);
alter table public.payments enable row level security;

create policy "Allow users to read their own payments" on public.payments
  for select using (auth.uid() = user_id);

-- Alter profiles to support lifetime access flag
alter table public.profiles add column if not exists lifetime_access boolean default false not null;

-- 16. TPO_USERS Table (Placement Cell users)
create table public.tpo_users (
  id uuid references auth.users on delete cascade primary key,
  institution_id text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.tpo_users enable row level security;

create policy "Allow TPO users to read their own row" on public.tpo_users
  for select using (auth.uid() = id);

-- 17. BATCHES Table (Groups of student resumes)
create table public.batches (
  id uuid default uuid_generate_v4() primary key,
  institution_id text not null,
  name text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index batches_institution_id_idx on public.batches(institution_id);
alter table public.batches enable row level security;

create policy "Allow TPO users to view batches of their institution" on public.batches
  for select using (
    exists (
      select 1 from public.tpo_users
      where public.tpo_users.id = auth.uid()
      and public.tpo_users.institution_id = public.batches.institution_id
    )
  );

-- 18. BATCH_RESUMES Table (Resumes belonging to a batch)
create table public.batch_resumes (
  id uuid default uuid_generate_v4() primary key,
  batch_id uuid references public.batches on delete cascade not null,
  student_name text not null,
  file_path text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index batch_resumes_batch_id_idx on public.batch_resumes(batch_id);
alter table public.batch_resumes enable row level security;

create policy "Allow TPO users to view batch resumes of their institution" on public.batch_resumes
  for select using (
    exists (
      select 1 from public.batches
      join public.tpo_users on public.tpo_users.institution_id = public.batches.institution_id
      where public.batches.id = public.batch_resumes.batch_id
      and public.tpo_users.id = auth.uid()
    )
  );

-- 19. SCORE_HISTORY Table (Scan score history)
create table public.score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  score int not null,
  keyword_match_percent int,
  jd_snippet text,
  created_at timestamptz default now()
);

alter table public.score_history enable row level security;
create policy "Allow users to manage their own score history" on public.score_history
  for all using (auth.uid() = user_id);

-- 20. SKILL_PROGRESS Table (Historical values of skills over scans)
create table public.skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  skill_name text not null,
  value int not null,
  recorded_at timestamptz default now()
);

alter table public.skill_progress enable row level security;
create policy "Allow users to manage their own skill progress" on public.skill_progress
  for all using (auth.uid() = user_id);

-- 21. USER_ACHIEVEMENTS Table (Unlocked achievements)
create table public.user_achievements (
  user_id uuid references auth.users on delete cascade not null,
  achievement_id text not null,
  unlocked boolean default false,
  progress int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;
create policy "Allow users to manage their own achievements" on public.user_achievements
  for all using (auth.uid() = user_id);

-- 22. WEEKLY_CHALLENGES Table (Weekly challenge completion status)
create table public.weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  week_start date not null,
  challenge_key text not null,
  completed boolean default false,
  points int default 0,
  created_at timestamptz default now(),
  unique(user_id, week_start, challenge_key)
);

alter table public.weekly_challenges enable row level security;
create policy "Allow users to manage their own weekly challenges" on public.weekly_challenges
  for all using (auth.uid() = user_id);



