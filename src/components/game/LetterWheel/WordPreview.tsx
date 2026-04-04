import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MIN_WORD_LENGTH } from '../../../core/game/wheelEngine';
import { useGameUiStore } from '../../../stores/gameUiStore';

type WordPreviewProps = {
  word: string;
  /** Kompakt über dem Rad (ohne Mindestlängen-Hinweis). */
  compact?: boolean;
};

export function WordPreview({ word, compact = false }: WordPreviewProps) {
  const meetsMin = word.length >= MIN_WORD_LENGTH;
  const forming = word.length > 0 && !meetsMin;
  const excellent = word.length >= 6;
  const setPreviewWord = useGameUiStore((s) => s.setPreviewWord);

  useEffect(() => {
    setPreviewWord(word);
  }, [word, setPreviewWord]);

  const colorClass = excellent
    ? 'wr-word-excellent'
    : meetsMin
      ? 'text-[var(--gold-primary)]'
      : forming
        ? 'text-[var(--text-secondary)]'
        : 'text-[var(--text-muted)]';

  const sizeClass = compact ? 'min-h-[2rem] text-lg font-bold tracking-[0.12em] sm:text-xl' : 'mb-3 min-h-[2.5rem] text-2xl';

  return (
    <motion.div
      className={`relative text-center font-cinzel ${sizeClass} ${colorClass}`}
      initial={false}
      animate={{
        opacity: word.length > 0 ? 1 : 0.45,
        scale: word.length > 0 ? 1 : 0.98,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <span className="inline-flex min-h-[1.5em] flex-wrap justify-center gap-0.5">
        <AnimatePresence initial={false} mode="popLayout">
          {word.length > 0 ? (
            word.split('').map((ch, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            ))
          ) : (
            <span className="text-[var(--text-muted)]">—</span>
          )}
        </AnimatePresence>
      </span>
      {!compact && word.length > 0 ? (
        <span className="ml-2 font-body text-sm font-normal tracking-normal text-[var(--text-muted)]">
          ({word.length}/{MIN_WORD_LENGTH}+)
        </span>
      ) : null}
    </motion.div>
  );
}
