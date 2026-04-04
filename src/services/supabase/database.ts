import { getCurrentUser } from './auth';
import { isSupabaseConfigured, supabase } from './client';
import type { LeaderboardEntry } from './leagueService';
import { getLeaderboard as getLeaderboardFromService, submitScore } from './leagueService';

export type Profile = {
  id: string;
  username: string | null;
  avatar: string;
  elo: number;
  league: string;
  current_streak: number;
  best_streak: number;
  total_words: number;
  puzzles_completed: number;
  battle_pass_level: number;
  battle_pass_xp: number;
  is_premium: boolean;
  created_at?: string;
};

export type BattlePassProgress = {
  level: number;
  xp: number;
  claimedRewards: string[];
};

export async function saveUserProfile(profile: {
  username?: string;
  avatar?: string;
  elo?: number;
  league?: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  const u = await getCurrentUser();
  if (!u) return;
  try {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        id: u.id,
        username: profile.username,
        avatar: profile.avatar,
        elo: profile.elo,
        league: profile.league,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (error) console.error('saveUserProfile', error);
  } catch (e) {
    console.error('saveUserProfile', e);
  }
}

export async function loadUserProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const u = await getCurrentUser();
  if (!u) return null;
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', u.id).maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: u.id,
      username: (row.username as string) ?? null,
      avatar: (row.avatar as string) ?? '⚔️',
      elo: (row.elo as number) ?? 0,
      league: (row.league as string) ?? 'Bronze',
      current_streak: (row.current_streak as number) ?? 0,
      best_streak: (row.best_streak as number) ?? 0,
      total_words: (row.total_words as number) ?? 0,
      puzzles_completed: (row.puzzles_completed as number) ?? 0,
      battle_pass_level: (row.battle_pass_level as number) ?? 1,
      battle_pass_xp: (row.battle_pass_xp as number) ?? 0,
      is_premium: (row.is_premium as boolean) ?? false,
      created_at: row.created_at as string | undefined,
    };
  } catch (e) {
    console.error('loadUserProfile', e);
    return null;
  }
}

export async function submitDailyScore(score: {
  words: number;
  wordsList: string[];
  gold: number;
  wood: number;
  stone: number;
  time_seconds?: number;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  const u = await getCurrentUser();
  if (!u) return;
  const puzzle_date = new Date().toISOString().slice(0, 10);
  const totalPoints = score.gold + score.wood + score.stone;
  try {
    await submitScore(u.id, puzzle_date, score.wordsList, totalPoints);
    const { error } = await supabase
      .from('daily_completions')
      .update({
        gold_earned: score.gold,
        wood_earned: score.wood,
        stone_earned: score.stone,
        time_seconds: score.time_seconds ?? null,
      })
      .eq('user_id', u.id)
      .eq('puzzle_date', puzzle_date);
    if (error) {
      /* Spalten optional — nicht kritisch */
      console.debug('submitDailyScore extras', error);
    }
  } catch (e) {
    console.error('submitDailyScore', e);
  }
}

export async function getLeaderboard(date: string): Promise<LeaderboardEntry[]> {
  try {
    return await getLeaderboardFromService(date, 50);
  } catch (e) {
    console.error('getLeaderboard database', e);
    return [];
  }
}

export async function saveBattlePassProgress(
  level: number,
  xp: number,
  claimedRewards: string[],
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const u = await getCurrentUser();
  if (!u) return;
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        battle_pass_level: level,
        battle_pass_xp: xp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', u.id);
    if (error) console.error('saveBattlePassProgress', error);
    void claimedRewards;
  } catch (e) {
    console.error('saveBattlePassProgress', e);
  }
}

export async function loadBattlePassProgress(): Promise<BattlePassProgress | null> {
  const p = await loadUserProfile();
  if (!p) return null;
  return {
    level: p.battle_pass_level,
    xp: p.battle_pass_xp,
    claimedRewards: [],
  };
}
