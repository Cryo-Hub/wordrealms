import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDailyStore } from '../../stores/dailyStore';
import { useLeagueStore } from '../../stores/leagueStore';
import { getEloChange } from '../../core/game/leagueSystem';
import {
  getLeaderboard,
  isTopHalfOfLeaderboard,
  submitScore,
} from '../../services/supabase/leagueService';
import { getCurrentUser } from '../../services/supabase/auth';
import { isSupabaseConfigured } from '../../services/supabase/client';
import { formatPuzzleDate } from '../../core/game/puzzleGenerator';
import { ShareCard } from '../game/ShareCard';
import { useTranslation } from '../../i18n';
import { OrnamentDivider } from '../ui/OrnamentDivider';
import {
  requestPermissionAfterFirstCompletion,
} from '../../services/notificationService';

type PuzzleCompleteProps = {
  wordsFound: number;
  foundWords: string[];
  sessionGold: number;
  sessionWood: number;
  sessionStone: number;
  puzzleNumber: number;
  /** Heutiges Daily (kein Archiv): Liga-ELO & erste Benachrichtigung */
  isDailyToday: boolean;
  /** „Morgen Puzzle #n+1“ nur beim Daily-Abschluss (nicht Archiv). */
  showTomorrowLine?: boolean;
  onBuildWorld: () => void;
  onKeepPlaying: () => void;
  onToast?: (message: string, ms?: number) => void;
};

export function PuzzleComplete({
  wordsFound,
  foundWords,
  sessionGold,
  sessionWood,
  sessionStone,
  puzzleNumber,
  isDailyToday,
  showTomorrowLine = false,
  onBuildWorld,
  onKeepPlaying,
  onToast,
}: PuzzleCompleteProps) {
  const { t } = useTranslation();
  const streak = useDailyStore((s) => s.currentStreak);
  const addEloForDailyPuzzle = useLeagueStore((s) => s.addEloForDailyPuzzle);
  useEffect(() => {
    if (!isDailyToday) return;
    const puzzleDate = formatPuzzleDate();

    const upper = foundWords.map((w) => w.toUpperCase());
    const totalPoints = sessionGold + sessionWood + sessionStone;

    void (async () => {
      try {
        const user = await getCurrentUser();
        if (user && isSupabaseConfigured) {
          try {
            await submitScore(user.id, puzzleDate, upper, totalPoints);
          } catch (e) {
            console.error('submitScore', e);
          }
        }
        let board: Awaited<ReturnType<typeof getLeaderboard>> = [];
        try {
          board = await getLeaderboard(puzzleDate, 500);
        } catch (e) {
          console.error('getLeaderboard', e);
          board = [];
        }
        const top = isTopHalfOfLeaderboard(board, wordsFound, user?.id ?? null);
        const delta = getEloChange(top);
        addEloForDailyPuzzle(puzzleDate, delta);
        if (delta > 0) {
          onToast?.(`+${delta} ELO ⚔️`, 2200);
        } else {
          onToast?.(`${delta} ELO`, 2200);
        }
      } catch (e) {
        console.error('league completion', e);
        addEloForDailyPuzzle(puzzleDate, getEloChange(true));
        onToast?.('+25 ELO ⚔️', 2200);
      }
    })();

    void requestPermissionAfterFirstCompletion();
  }, [
    isDailyToday,
    wordsFound,
    foundWords,
    sessionGold,
    sessionWood,
    sessionStone,
    addEloForDailyPuzzle,
    onToast,
  ]);

  useEffect(() => {
    if (!isDailyToday) return;
    if (![3, 7, 30].includes(streak)) return;
    const puzzleDate = formatPuzzleDate();
    const mKey = `wordrealms-milestone-${puzzleDate}-${streak}`;
    try {
      if (sessionStorage.getItem(mKey)) return;
      sessionStorage.setItem(mKey, '1');
    } catch {
      return;
    }
    if (streak === 3) onToast?.('🔥 3 day streak!', 2500);
    else if (streak === 7) onToast?.('⚡ One week warrior!', 2500);
    else onToast?.('👑 Legendary streak!', 3000);
  }, [isDailyToday, streak, onToast]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece absolute h-2 w-2 rounded-sm opacity-90"
            style={{
              left: `${(i * 37) % 100}%`,
              top: '-8%',
              background: ['#c9a227', '#6b5510', '#8a7060', '#7a1a1a', '#f0e6cc'][i % 5],
              animation: `confetti-fall ${2.5 + (i % 5) * 0.2}s linear ${(i % 8) * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="fantasy-card relative z-10 w-full max-w-sm text-center"
      >
        <h2 className="font-title text-xl font-bold text-[var(--gold-primary)]">{t('complete.title')}</h2>
        <OrnamentDivider size="sm" className="my-3" />
        {showTomorrowLine ? (
          <p className="mt-2 font-body text-sm text-[var(--text-secondary)]">
            {t('game.come_back', { n: puzzleNumber + 1 })}
          </p>
        ) : null}
        <dl className="mt-4 space-y-2 text-left font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)]">{t('complete.label_words')}</dt>
            <dd className="font-semibold text-[var(--text-primary)]">{wordsFound}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)]">{t('complete.label_resources')}</dt>
            <dd className="font-num text-[var(--text-primary)]">
              🪙 {sessionGold} · 🪵 {sessionWood} · 🪨 {sessionStone}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)]">{t('complete.label_streak')}</dt>
            <dd className="font-semibold text-[var(--gold-primary)]">{t('complete.streak_days', { n: streak })}</dd>
          </div>
        </dl>

        <ShareCard
          wordsFound={wordsFound}
          foundWords={foundWords}
          sessionGold={sessionGold}
          sessionWood={sessionWood}
          sessionStone={sessionStone}
          puzzleNumber={puzzleNumber}
          streakDays={streak}
          onToast={onToast}
        />

        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={() => onBuildWorld()} className="fantasy-button w-full">
            {t('complete.build_world')}
          </button>
          <button type="button" onClick={onKeepPlaying} className="btn-secondary w-full py-3 text-sm">
            {t('complete.keep_playing')}
          </button>
        </div>
      </motion.div>
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.85;
          }
        }
      `}</style>
    </motion.div>
  );
}
