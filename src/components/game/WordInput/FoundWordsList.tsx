import { motion, AnimatePresence } from 'framer-motion';
import type { FoundWordEntry } from '../../../stores/gameStore';
import { useTranslation } from '../../../i18n';

function wordAccent(word: string): string {
  const n = word.length;
  if (n >= 6) return 'border-l-[#c9a227]';
  if (n >= 4) return 'border-l-[#6b5510]';
  return 'border-l-[#2a2018]';
}

function wordText(word: string): string {
  const n = word.length;
  if (n >= 6) return 'text-[#c9a227]';
  return 'text-[#f0e6cc]';
}

type FoundWordsListProps = {
  entries: FoundWordEntry[];
};

export function FoundWordsList({ entries }: FoundWordsListProps) {
  const { t } = useTranslation();
  return (
    <div className="fantasy-card flex min-h-0 flex-1 flex-col overflow-hidden !p-0">
      <p className="wr-label border-b border-[#2a2018] px-3 py-2 font-cinzel text-[11px] font-semibold uppercase tracking-wide">
        {t('game.words_found')}
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
        <AnimatePresence initial={false}>
          {entries.map((e) => {
            const border = wordAccent(e.word);
            const text = wordText(e.word);
            return (
              <motion.li
                key={e.word}
                layout
                initial={{ opacity: 0, x: -8, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={`flex items-center justify-between gap-2 border-b border-[#2a2018]/80 border-l-2 bg-[rgba(8,6,4,0.35)] py-1.5 pl-2 font-medium last:border-b-0 ${border}`}
              >
                <span className={`font-cinzel tracking-wide ${text}`}>{e.word}</span>
                <span className="font-num text-sm tabular-nums text-[#c9a227]">+{e.points}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {entries.length === 0 ? (
          <li className="py-5 text-center font-body text-sm text-[#8a7060]">{t('game.no_words')}</li>
        ) : null}
      </ul>
    </div>
  );
}
