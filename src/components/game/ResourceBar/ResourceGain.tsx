import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { WordReward } from '../../../core/game/resourceCalculator';

type ResourceGainProps = {
  reward: WordReward | null;
  onDone?: () => void;
};

function formatGain(r: WordReward): string {
  const parts: string[] = [];
  if (r.gold) parts.push(`+${r.gold} 🪙`);
  if (r.wood) parts.push(`+${r.wood} 🪵`);
  if (r.stone) parts.push(`+${r.stone} 🪨`);
  return parts.join('  ');
}

export function ResourceGain({ reward, onDone }: ResourceGainProps) {
  useEffect(() => {
    if (!reward) return;
    const t = window.setTimeout(() => onDone?.(), 950);
    return () => window.clearTimeout(t);
  }, [reward, onDone]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 justify-center">
      <AnimatePresence mode="wait">
        {reward ? (
          <motion.div
            key={`${reward.gold}-${reward.wood}-${reward.stone}`}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="whitespace-nowrap rounded-[8px] border border-[var(--border-gold)] bg-[var(--bg-elevated)] px-3 py-1 font-cinzel text-xs font-semibold text-[var(--gold-light)] shadow-lg"
          >
            {formatGain(reward)}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
