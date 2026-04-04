-- Erweiterung user_profiles + daily_completions für Game Build

alter table public.user_profiles
  add column if not exists avatar text default '⚔️',
  add column if not exists elo integer default 0,
  add column if not exists league text default 'Bronze',
  add column if not exists current_streak integer default 0,
  add column if not exists puzzles_completed integer default 0,
  add column if not exists battle_pass_level integer default 1,
  add column if not exists battle_pass_xp integer default 0,
  add column if not exists is_premium boolean default false,
  add column if not exists updated_at timestamptz default now();

alter table public.daily_completions
  add column if not exists gold_earned integer default 0,
  add column if not exists wood_earned integer default 0,
  add column if not exists stone_earned integer default 0,
  add column if not exists time_seconds integer;

-- Leaderboard: alle authentifizierten Nutzer dürfen completions lesen (Datum + Punkte)
drop policy if exists "completions_own" on public.daily_completions;

create policy "completions_insert_own"
  on public.daily_completions for insert
  with check (auth.uid() = user_id);

create policy "completions_select_own"
  on public.daily_completions for select
  using (auth.uid() = user_id);

create policy "completions_update_own"
  on public.daily_completions for update
  using (auth.uid() = user_id);

create policy "completions_leaderboard_read"
  on public.daily_completions for select
  using (auth.role() = 'authenticated');
