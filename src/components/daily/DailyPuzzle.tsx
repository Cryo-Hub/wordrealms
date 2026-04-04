import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LetterWheel } from '../game/LetterWheel/LetterWheel';
import { CrosswordGrid } from '../game/CrosswordGrid/CrosswordGrid';
import { BonusWordToast } from '../game/CrosswordGrid/BonusWordToast';
import { calculateWordReward, type WordReward } from '../../core/game/resourceCalculator';
import { validateWord, type WordInvalidReason } from '../../core/game/wordValidator';
import { useGameStore } from '../../stores/gameStore';
import { useGameUiStore } from '../../stores/gameUiStore';
import { useResourceStore } from '../../stores/resourceStore';
import { useDailyStore } from '../../stores/dailyStore';
import { usePremiumStore } from '../../stores/premiumStore';
import {
  ensureDictionaryLoaded,
  getCurrentLanguage,
  type SupportedLanguage,
} from '../../core/game/dictionaryManager';
import { useLanguageVersion } from '../../hooks/useLanguageVersion';
import { formatPuzzleDate, getNextTraceableHint, getPuzzleNumber, type PuzzleConfig } from '../../core/game/puzzleGenerator';
import { getPuzzleForDate, recordWordsForArchiveDate } from '../../core/game/puzzleArchive';
import { PuzzleComplete } from './PuzzleComplete';
import type { RootScreen } from '../../types/navigation';
import { hapticService } from '../../services/hapticService';
import { initAudioOnGesture, soundService } from '../../services/soundService';
import { useTranslation } from '../../i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import { buildCrosswordGrid, type CrosswordGrid as CrosswordGridModel } from '../../core/game/crosswordEngine';

function invalidToastForReason(
  reason: WordInvalidReason | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  switch (reason) {
    case 'already_found':
      return t('game.already_found');
    case 'min_length':
      return t('game.min_length');
    case 'letters_only':
      return t('game.letters_only');
    case 'not_in_dictionary':
    default:
      return t('game.not_valid');
  }
}

function GameWordDots() {
  const len = useGameUiStore((s) => s.previewWord.length);
  return (
    <div className="flex justify-center gap-[6px]" aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => {
        const filled = i < len;
        return (
          <span
            key={i}
            className="shrink-0 rounded-full"
            style={
              filled
                ? {
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#c9a227',
                    boxShadow: '0 0 6px rgba(201,162,39,0.8)',
                  }
                : {
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'rgba(201,162,39,0.3)',
                    border: '1px solid #6b5510',
                  }
            }
          />
        );
      })}
    </div>
  );
}

/**
 * Kreuzwort-Eingabe: `puzzle.grid_words` (vom Archiv / `normalizePuzzleConfig` in `getPuzzleForDate`).
 * Ohne `grid_words` → Fallback `puzzle.validWords`.
 */
function wordsForCrosswordGrid(puzzle: PuzzleConfig): string[] {
  const raw = puzzle.grid_words?.length ? puzzle.grid_words : puzzle.validWords;
  const uniq = [...new Set(raw.map((w) => w.trim().toUpperCase()))];
  return uniq.filter((w) => w.length >= 2);
}

type DailyPuzzleProps = {
  onNavigate: (screen: RootScreen) => void;
};

export function DailyPuzzle({ onNavigate }: DailyPuzzleProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language) as SupportedLanguage;
  const langVersion = useLanguageVersion();
  const foundWords = useGameStore((s) => s.foundWords);
  const addFoundWord = useGameStore((s) => s.addFoundWord);
  const sessionGold = useGameStore((s) => s.sessionGoldEarned);
  const sessionWood = useGameStore((s) => s.sessionWoodEarned);
  const sessionStone = useGameStore((s) => s.sessionStoneEarned);
  const addResources = useResourceStore((s) => s.addResources);
  const addWordsCount = useDailyStore((s) => s.addWordsCount);
  const bumpWordsToday = useDailyStore((s) => s.bumpWordsToday);
  const completeToday = useDailyStore((s) => s.completeToday);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const activeDate = formatPuzzleDate();
  const todayStr = formatPuzzleDate();

  const [puzzle, setPuzzle] = useState<PuzzleConfig | null>(null);
  const [dictLoading, setDictLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [crossword, setCrossword] = useState<CrosswordGridModel | null>(null);
  const [bonusWord, setBonusWord] = useState<string | null>(null);
  const [showLevelSolved, setShowLevelSolved] = useState(false);
  const levelCompleteAppliedRef = useRef(false);

  const gridSourceWords = useMemo(() => (puzzle ? wordsForCrosswordGrid(puzzle) : []), [puzzle]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setDictLoading(true);
      await ensureDictionaryLoaded();
      if (cancel) return;
      const lang = getCurrentLanguage();
      try {
        const p = await getPuzzleForDate(activeDate, lang);
        if (!cancel) {
          setPuzzle(p);
        }
      } catch (e) {
        console.error(e);
        if (!cancel) setPuzzle(null);
      }
      if (!cancel) setDictLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [language, langVersion, activeDate]);

  useEffect(() => {
    if (!puzzle) return;
    levelCompleteAppliedRef.current = false;
    setCrossword(buildCrosswordGrid(gridSourceWords));
  }, [puzzle, gridSourceWords]);

  useEffect(() => {
    recordWordsForArchiveDate(activeDate, foundWords);
  }, [foundWords, activeDate, puzzle]);

  const hintValidWords = useMemo(() => {
    if (!puzzle) return [];
    return [...new Set(puzzle.validWords.map((w) => w.toUpperCase()))];
  }, [puzzle]);

  const showToast = useCallback((msg: string, ms = 1500) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(() => {
    if (!bonusWord) return;
    const id = window.setTimeout(() => setBonusWord(null), 1500);
    return () => window.clearTimeout(id);
  }, [bonusWord]);

  useEffect(() => {
    if (!crossword || crossword.placedWords.length === 0) return;
    const done = crossword.placedWords.every((pw) => pw.revealed.every(Boolean));
    if (!done || levelCompleteAppliedRef.current) return;
    levelCompleteAppliedRef.current = true;
    setShowLevelSolved(true);
    hapticService.heavy();
    soundService.puzzleComplete();
    completeToday();
  }, [crossword, completeToday]);

  const handleWord = useCallback(
    (word: string) => {
      initAudioOnGesture();
      const v = validateWord(word, foundWords);
      if (!v.valid) {
        setShake((k) => k + 1);
        soundService.wordInvalid();
        showToast(invalidToastForReason(v.reason, t));
        return;
      }
      const u = word.toUpperCase();
      let reward: WordReward = calculateWordReward(word.length);
      if (isPremium) {
        reward = {
          gold: reward.gold * 2,
          wood: reward.wood * 2,
          stone: reward.stone * 2,
        };
      }
      soundService.wordValid();
      if (word.length >= 6) {
        soundService.wordExcellent();
      }
      addResources(reward.gold, reward.wood, reward.stone);
      addWordsCount(1);
      bumpWordsToday(1);
      addFoundWord(word);
      hapticService.medium();
      showToast(`${u} +${reward.gold}🪙`, 1500);

      const placedOnGrid = crossword?.placedWords.some((pw) => pw.word === u) ?? false;
      if (placedOnGrid && crossword) {
        setCrossword((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            placedWords: prev.placedWords.map((pw) =>
              pw.word === u ? { ...pw, revealed: pw.word.split('').map(() => true) } : pw,
            ),
          };
        });
      } else {
        setBonusWord(u);
      }
    },
    [
      addFoundWord,
      addResources,
      addWordsCount,
      bumpWordsToday,
      crossword,
      foundWords,
      isPremium,
      showToast,
      t,
    ],
  );

  const showHint = () => {
    if (!puzzle) return;
    initAudioOnGesture();
    const hint = getNextTraceableHint(puzzle.letters, hintValidWords, foundWords);
    if (hint) {
      showToast(t('game.hint', { word: hint }), 3000);
    } else {
      showToast(t('game.no_hints'), 3000);
    }
  };

  const puzzleNum = getPuzzleNumber(new Date(`${activeDate}T12:00:00`));

  if (dictLoading || !puzzle || !crossword) {
    return (
      <div className="flex min-h-0 w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-2 px-4 text-[var(--text-secondary)]">
        <p className="font-body text-sm">{t('game.loading_dict')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-[480px] justify-end px-3 pt-[70px] sm:px-4">
          <button
            type="button"
            onClick={showHint}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#6b5510] bg-[rgba(10,8,6,0.85)] shadow-md transition active:scale-95"
            aria-label={t('game.hint_button_aria')}
          >
            <img src="/assets/hint.jpg" width={26} height={26} alt="" className="pointer-events-none rounded-sm" />
          </button>
        </div>
      </div>

      <BonusWordToast word={bonusWord} />

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-3 z-50 max-w-[min(100vw-1.5rem,24rem)] -translate-x-1/2 rounded-[8px] border border-[#2a2018] bg-[rgba(12,9,6,0.96)] px-4 py-2 text-center font-body text-sm font-medium text-[#f0e6cc] shadow-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelSolved ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm rounded-xl border-2 border-[#c9a227] bg-gradient-to-b from-[#2a2018] to-[#0f0a06] px-8 py-10 text-center shadow-[0_0_40px_rgba(201,162,39,0.35)]"
            >
              <p className="font-cinzel text-2xl font-bold text-[#c9a227] drop-shadow-[0_0_12px_rgba(201,162,39,0.6)]">
                Rätsel gelöst! 🏆
              </p>
              <button
                type="button"
                className="fantasy-button mt-8 w-full"
                onClick={() => {
                  setShowLevelSolved(false);
                  setShowComplete(true);
                }}
              >
                {t('game.complete_button')}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 w-full max-w-[480px] flex-1 flex-col items-center justify-center px-3 sm:px-4">
        <div className="flex w-full max-h-[45vh] min-h-0 flex-shrink-0 flex-col items-center justify-center overflow-visible py-2">
          <CrosswordGrid crossword={crossword} />
        </div>

        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-visible pt-2">
          <GameWordDots />
          <motion.div
            key={shake}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="flex w-full min-h-[320px] flex-1 touch-none flex-col items-center justify-center px-1 pb-2"
          >
            <div className="mx-auto aspect-square w-full max-w-[min(480px,100%)] min-h-[320px] min-w-0 max-h-[min(68vh,calc(100dvh-13rem))]">
              <LetterWheel letters={[...puzzle.letters]} foundWords={foundWords} onWordFormed={handleWord} />
            </div>
          </motion.div>
        </div>
      </div>

      {showComplete ? (
        <PuzzleComplete
          wordsFound={foundWords.length}
          sessionGold={sessionGold}
          sessionWood={sessionWood}
          sessionStone={sessionStone}
          puzzleNumber={puzzleNum}
          showTomorrowLine={activeDate === todayStr}
          onBuildWorld={() => {
            setShowComplete(false);
            onNavigate('world');
          }}
          onKeepPlaying={() => setShowComplete(false)}
        />
      ) : null}
    </div>
  );
}
