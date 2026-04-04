import { useCallback, useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../../services/supabase/leagueService';
import { getCurrentUser } from '../../services/supabase/auth';
import { formatPuzzleDate } from '../../core/game/puzzleGenerator';
import { LeagueCard } from './LeagueCard';
import { useTranslation } from '../../i18n';

export function LeagueBoard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const u = await getCurrentUser();
    setMe(u?.id ?? null);
    const data = await getLeaderboard(formatPuzzleDate(), 50);
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-card)]" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="fantasy-card text-center font-body text-sm text-[var(--text-secondary)]">
        {t('league.be_first')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <LeagueCard
          key={`${r.rank}-${r.username}`}
          rank={r.rank}
          username={r.username}
          wordsFound={r.words_found}
          points={r.total_points}
          isYou={me !== null && r.user_id === me}
        />
      ))}
      <button type="button" onClick={() => void load()} className="btn-secondary mt-2 w-full min-h-[44px] py-2 text-sm">
        {t('league.refresh')}
      </button>
    </div>
  );
}
