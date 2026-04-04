import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { SupportedLanguage } from '../../core/game/dictionaryManager';
import {
  formatPuzzleDate,
  getPuzzleNumber,
  type PuzzleConfig,
} from '../../core/game/puzzleGenerator';
import { getRecentPuzzles, getWordsFoundForDate } from '../../core/game/puzzleArchive';
import { useTranslation } from '../../i18n';
import { OrnamentDivider } from '../ui/OrnamentDivider';

type PuzzleArchiveModalProps = {
  language: SupportedLanguage;
  onClose: () => void;
  onSelectDate: (date: string) => void;
};

export function PuzzleArchiveModal({ language, onClose, onSelectDate }: PuzzleArchiveModalProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PuzzleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const today = formatPuzzleDate();

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      const list = await getRecentPuzzles(7, language);
      if (alive) {
        setRows(list);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [language]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/85 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="diablo-modal max-h-[85vh] w-full max-w-[430px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h2 id="archive-title" className="font-title text-lg font-bold text-[var(--gold-primary)]">
            {t('archive.title')}
          </h2>
          <button type="button" onClick={onClose} className="btn-icon px-3" aria-label={t('modal.close')}>
            ✕
          </button>
        </div>
        <div className="px-4">
          <OrnamentDivider size="sm" />
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">{t('archive.loading')}</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((p) => {
                const isToday = p.date === today;
                const words = getWordsFoundForDate(p.date);
                const played = words.length > 0;
                const future = p.date > today;
                const locked = future;
                const letters = p.letters.join(' ');
                const num = getPuzzleNumber(new Date(`${p.date}T12:00:00`));
                return (
                  <li key={p.date}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        if (!locked) {
                          onSelectDate(p.date);
                          onClose();
                        }
                      }}
                      className={`flex w-full flex-col gap-1 rounded-[8px] border px-3 py-3 text-left font-body transition ${
                        isToday
                          ? 'border-[var(--gold-primary)] bg-[var(--gold-dim)]/15'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
                      } ${locked ? 'cursor-not-allowed opacity-50' : 'active:scale-[0.99]'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-cinzel text-sm font-semibold text-[var(--text-primary)]">
                          {p.date}
                          {isToday ? (
                            <span className="ml-2 text-[10px] text-[var(--gold-primary)]">
                              {t('archive.today')}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-[#6b5510]">#{num}</span>
                      </div>
                      <span className="font-cinzel text-xs tracking-widest text-[var(--text-secondary)]">
                        {locked ? t('archive.locked') : letters}
                      </span>
                      {!locked && played ? (
                        <span className="text-xs text-[#2a7a3a]">
                          {t('archive.words_found', { n: words.length })}
                        </span>
                      ) : !locked && !played ? (
                        <span className="text-xs text-[var(--text-muted)]">{t('archive.hint_play')}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="border-t border-[var(--border-subtle)] px-4 py-2 text-center text-[10px] text-[var(--text-muted)]">
          {t('archive.footer')}
        </p>
      </motion.div>
    </motion.div>
  );
}
