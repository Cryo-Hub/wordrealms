import { AnimatePresence, motion } from 'framer-motion';

type BonusWordToastProps = {
  word: string | null;
};

export function BonusWordToast({ word }: BonusWordToastProps) {
  return (
    <AnimatePresence>
      {word ? (
        <motion.div
          key={word}
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-1/2 top-16 z-[55] w-[min(100vw-2rem,22rem)] -translate-x-1/2 text-center font-cinzel text-lg font-bold text-[#c9a227] drop-shadow-[0_0_12px_rgba(201,162,39,0.7)]"
        >
          +{word} ✨ Bonus!
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
