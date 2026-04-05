import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { NavigationBar } from '../components/ui/NavigationBar';
import { LeagueBoard } from '../components/league/LeagueBoard';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import { formatPuzzleDate, getPuzzleNumber } from '../core/game/puzzleGenerator';
import { useDailyStore } from '../stores/dailyStore';
import { useLeagueStore } from '../stores/leagueStore';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';

type LeagueScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function LeagueScreen({ navigate }: LeagueScreenProps) {
  const { t } = useTranslation();
  const totalWords = useDailyStore((s) => s.totalWordsAllTime);
  const elo = useLeagueStore((s) => s.elo);

  const tabNav = (t: RootScreen) => {
    if (t === 'home' || t === 'game' || t === 'world' || t === 'league') navigate(t);
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] pb-28 pt-[72px]">
      <ResourceBar />
      <div className="w-full px-4 pb-4">
        <h1 className="wr-screen-title text-xl">{t('league.title')}</h1>
        <p className="wr-body mt-1 text-center text-sm">
          {formatPuzzleDate()} · {t('game.puzzle_number', { n: getPuzzleNumber() })}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center">
          <LeagueBadge elo={elo} size="lg" />
        </div>
        <p className="wr-body mt-4 text-center text-xs text-[var(--text-muted)]">{t('league.reset_sunday')}</p>
        <div className="mt-4">
          <LeagueBoard />
        </div>
        <div className="fantasy-card mt-6">
          <p className="wr-body text-sm">{t('league.your_words', { n: totalWords })}</p>
          <p className="wr-label mt-1">{t('league.connect_supabase')}</p>
        </div>
      </div>
      <NavigationBar active="league" onNavigate={tabNav} />
    </div>
  );
}
