import { motion } from 'framer-motion';
import { useDailyStore } from '../../stores/dailyStore';
import { ShareCard } from '../game/ShareCard';
import { useTranslation } from '../../i18n';
import { OrnamentDivider } from '../ui/OrnamentDivider';

type PuzzleCompleteProps = {
  wordsFound: number;
  sessionGold: number;
  sessionWood: number;
  sessionStone: number;
  puzzleNumber: number;
  /** „Morgen Puzzle #n+1“ nur beim Daily-Abschluss (nicht Archiv). */
  showTomorrowLine?: boolean;
  onBuildWorld: () => void;
  onKeepPlaying: () => void;
};

export function PuzzleComplete({
  wordsFound,
  sessionGold,
  sessionWood,
  sessionStone,
  puzzleNumber,
  showTomorrowLine = false,
  onBuildWorld,
  onKeepPlaying,
}: PuzzleCompleteProps) {
  const { t } = useTranslation();
  const streak = useDailyStore((s) => s.currentStreak);

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
          sessionGold={sessionGold}
          sessionWood={sessionWood}
          sessionStone={sessionStone}
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
