import { isSupabaseConfigured, supabase } from './client';

export type LeaderboardEntry = {
  rank: number;
  username: string;
  words_found: number;
  total_points: number;
  completed_at: string;
  user_id?: string;
};

function wordsCount(wordsFound: string[] | null): number {
  return wordsFound?.length ?? 0;
}

function pointsFromResources(earned: unknown): number {
  if (earned && typeof earned === 'object' && 'total_points' in earned) {
    const v = (earned as { total_points?: unknown }).total_points;
    return typeof v === 'number' ? v : 0;
  }
  return 0;
}

export async function submitScore(
  userId: string,
  puzzleDate: string,
  wordsFoundWords: string[],
  totalPoints: number,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('daily_completions').upsert(
    {
      user_id: userId,
      puzzle_date: puzzleDate,
      words_found: wordsFoundWords,
      resources_earned: { total_points: totalPoints },
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,puzzle_date' },
  );
  if (error) console.error('submitScore', error);
}

export async function getLeaderboard(puzzleDate: string, limit = 50): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data: completions, error: cErr } = await supabase
    .from('daily_completions')
    .select('user_id, completed_at, words_found, resources_earned')
    .eq('puzzle_date', puzzleDate);

  if (cErr || !completions?.length) {
    if (cErr) console.error('getLeaderboard completions', cErr);
    return [];
  }

  const sorted = [...completions].sort((a, b) => {
    const wa = wordsCount(a.words_found as string[]);
    const wb = wordsCount(b.words_found as string[]);
    if (wb !== wa) return wb - wa;
    const ta = new Date((a as { completed_at: string }).completed_at).getTime();
    const tb = new Date((b as { completed_at: string }).completed_at).getTime();
    return ta - tb;
  });

  const top = sorted.slice(0, limit);
  const userIds = [...new Set(top.map((r) => (r as { user_id: string }).user_id))];

  const { data: profiles, error: pErr } = await supabase
    .from('user_profiles')
    .select('id, username')
    .in('id', userIds);

  if (pErr) console.error('getLeaderboard profiles', pErr);

  const nameById = new Map<string, string>();
  for (const p of profiles ?? []) {
    const row = p as { id: string; username: string | null };
    nameById.set(row.id, row.username?.trim() || `Player_${row.id.replace(/-/g, '').slice(0, 6)}`);
  }

  return top.map((row, i) => {
    const r = row as {
      user_id: string;
      completed_at: string;
      words_found: string[] | null;
      resources_earned: unknown;
    };
    const wf = wordsCount(r.words_found);
    return {
      rank: i + 1,
      username: nameById.get(r.user_id) ?? `Player_${r.user_id.replace(/-/g, '').slice(0, 6)}`,
      words_found: wf,
      total_points: pointsFromResources(r.resources_earned),
      completed_at: r.completed_at,
      user_id: r.user_id,
    };
  });
}

export async function getPlayerRank(userId: string, puzzleDate: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;
  const board = await getLeaderboard(puzzleDate, 500);
  const idx = board.findIndex((e) => e.user_id === userId);
  return idx >= 0 ? board[idx].rank : null;
}

/** Liegt der Spieler in der oberen Hälfte der Rangliste (nach Wörtern)? */
export function isTopHalfOfLeaderboard(
  board: LeaderboardEntry[],
  wordsFound: number,
  userId: string | null,
): boolean {
  if (board.length === 0) return true;
  const n = board.length;
  const half = Math.ceil(n / 2);
  if (userId) {
    const row = board.find((e) => e.user_id === userId);
    if (row) return row.rank <= half;
  }
  const strictlyBetter = board.filter((e) => e.words_found > wordsFound).length;
  return strictlyBetter < half;
}
