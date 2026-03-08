-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Sessions: one row per focus block
create table if not exists public.sessions (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  start_time         timestamptz not null,
  end_time           timestamptz,
  duration_seconds   int,
  overall_motivation int check (overall_motivation between 1 and 5),
  overall_notes      text
);

-- Per-area logs attached to a session
create table if not exists public.session_logs (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  area_name  text not null,
  content    text
);

-- One optional daily check-in per calendar date (reserved for future feature)
create table if not exists public.daily_check_ins (
  id           uuid primary key default gen_random_uuid(),
  date         date not null unique,
  mood_summary text,
  blockers     text
);

-- Enable Row Level Security
alter table public.sessions        enable row level security;
alter table public.session_logs    enable row level security;
alter table public.daily_check_ins enable row level security;

-- Permissive policies (replace with user-scoped policies when auth is added)
create policy "allow_all_sessions"        on public.sessions        for all using (true);
create policy "allow_all_session_logs"    on public.session_logs    for all using (true);
create policy "allow_all_daily_check_ins" on public.daily_check_ins for all using (true);

-- Indexes
create index if not exists idx_session_logs_session_id on public.session_logs(session_id);
create index if not exists idx_sessions_created_at     on public.sessions(created_at);
