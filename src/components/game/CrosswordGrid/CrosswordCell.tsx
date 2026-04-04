import { motion } from 'framer-motion';

export type CrosswordCellState = 'empty' | 'hidden' | 'revealed';

type CrosswordCellProps = {
  letter: string;
  state: CrosswordCellState;
};

export function CrosswordCell({ letter, state }: CrosswordCellProps) {
  if (state === 'empty') {
    return <div className="pointer-events-none h-[28px] w-[28px] shrink-0 bg-transparent" aria-hidden />;
  }

  if (state === 'hidden') {
    return (
      <div
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] border border-[#2a2018] bg-[rgba(20,16,10,0.9)] font-cinzel text-sm font-semibold text-[var(--text-muted)]"
        aria-hidden
      >
        _
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] border border-[#6b5510] bg-[rgba(12,9,6,0.85)] font-cinzel text-sm font-bold uppercase text-[#c9a227] shadow-[0_0_10px_rgba(201,162,39,0.45)]"
      style={{ textShadow: '0 0 8px rgba(201,162,39,0.6)' }}
    >
      {letter}
    </motion.div>
  );
}
