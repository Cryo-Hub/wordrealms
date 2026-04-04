-- Allow authenticated users to read all rows for leaderboards (join daily_completions + user_profiles).
-- Existing policies remain for INSERT/UPDATE/DELETE own rows.

create policy "daily_completions_select_leaderboard"
  on public.daily_completions
  for select
  to authenticated
  using (true);

create policy "user_profiles_select_leaderboard"
  on public.user_profiles
  for select
  to authenticated
  using (true);
