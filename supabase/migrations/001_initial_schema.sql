-- WordRealms initial schema (run in Supabase SQL editor or CLI)

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  created_at timestamptz default now(),
  total_words int default 0,
  total_buildings int default 0,
  best_streak int default 0,
  language text default 'en'
);

create table if not exists public.daily_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_date date not null,
  words_found text[] default '{}',
  resources_earned jsonb default '{}',
  completed_at timestamptz default now(),
  unique (user_id, puzzle_date)
);

create table if not exists public.daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  puzzle_date date not null unique,
  letters text[] not null,
  valid_words text[] not null,
  language text not null default 'en'
);

create index if not exists daily_completions_user_date_idx on public.daily_completions (user_id, puzzle_date);
create index if not exists daily_puzzles_date_idx on public.daily_puzzles (puzzle_date);

alter table public.user_profiles enable row level security;
alter table public.daily_completions enable row level security;
alter table public.daily_puzzles enable row level security;

create policy "profiles_own" on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "completions_own" on public.daily_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "puzzles_read" on public.daily_puzzles
  for select using (true);
