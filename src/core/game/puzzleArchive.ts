import type { SupportedLanguage } from './dictionaryManager';
import { type PuzzleConfig, formatPuzzleDate, pickGridWords } from './puzzleGenerator';

import enLevels from '../../data/puzzles-en-all-final.json';
import deLevels from '../../data/puzzles-de-all-final.json';
import frLevels from '../../data/puzzles-fr-all-final.json';
import esLevels from '../../data/puzzles-es-all-final.json';
import trLevels from '../../data/puzzles-tr-all-final.json';
import plLevels from '../../data/puzzles-pl-all-final.json';

/** Shape of entries in *-all-final.json (validated export; some fields optional per row). */
type LevelEntry = {
  id: number;
  level: number;
  difficulty: string;
  letters: string[];
  center: string;
  grid_words: { word: string; length: number }[];
  bonus_words: { word: string; length: number }[];
  intersection_letters?: string[];
  hint: string;
  theme: string;
  language?: string;
  grid_word_count?: number;
  intersection_count?: number;
  crossword_grid?: {
    placedWords: { word: string; row: number; col: number; direction: string; revealed: boolean[] }[];
    gridSize: number;
  };
};

const EN_LEVELS: LevelEntry[] = enLevels as LevelEntry[];
const DE_LEVELS: LevelEntry[] = deLevels as LevelEntry[];
const FR_LEVELS: LevelEntry[] = frLevels as LevelEntry[];
const ES_LEVELS: LevelEntry[] = esLevels as LevelEntry[];
const TR_LEVELS: LevelEntry[] = trLevels as LevelEntry[];
const PL_LEVELS: LevelEntry[] = plLevels as LevelEntry[];

function getLevelsForLanguage(language: SupportedLanguage): LevelEntry[] {
  switch (language) {
    case 'de':
      return DE_LEVELS;
    case 'fr':
      return FR_LEVELS;
    case 'es':
      return ES_LEVELS;
    case 'pl':
      return PL_LEVELS;
    case 'tr':
      return TR_LEVELS;
    default:
      return EN_LEVELS;
  }
}

/** Days between two YYYY-MM-DD strings (local noon). */
function daysBetween(anchorYmd: string, dateYmd: string): number {
  const a = new Date(`${anchorYmd}T12:00:00`);
  const b = new Date(`${dateYmd}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function mapCrosswordToConfig(
  g: NonNullable<LevelEntry['crossword_grid']>,
): NonNullable<PuzzleConfig['crossword_grid']> {
  return {
    gridSize: g.gridSize,
    placedWords: g.placedWords.map((p) => ({
      word: p.word,
      row: p.row,
      col: p.col,
      direction: p.direction === 'down' ? 'down' : 'across',
      revealed: p.revealed,
    })),
  };
}

function mapLevelToPuzzle(level: LevelEntry, date: string): PuzzleConfig {
  const grid_words = level.grid_words.map((w) => w.word.toUpperCase());
  const bonusWords = level.bonus_words.map((w) => w.word.toUpperCase());
  const validWords = [...grid_words, ...bonusWords];
  return {
    letters: level.letters.map((c) => c.toUpperCase()),
    center: level.center.toUpperCase(),
    validWords,
    grid_words,
    bonusWords,
    hint: level.hint,
    theme: level.theme,
    date,
    crossword_grid: level.crossword_grid ? mapCrosswordToConfig(level.crossword_grid) : undefined,
  };
}

/** Fix missing/stale grid_words from a cached PuzzleConfig. */
export function normalizePuzzleConfig(p: PuzzleConfig): PuzzleConfig {
  const validWords = p.validWords.map((w) => String(w).toUpperCase());
  const grid_words =
    p.grid_words != null && p.grid_words.length > 0
      ? p.grid_words.map((w) => String(w).toUpperCase())
      : pickGridWords(validWords);
  const bonusWords =
    p.bonusWords != null && p.bonusWords.length > 0
      ? p.bonusWords.map((w) => String(w).toUpperCase())
      : undefined;
  return {
    ...p,
    letters: p.letters.map((c) => String(c).toUpperCase()),
    center: p.center != null ? String(p.center).toUpperCase() : undefined,
    validWords,
    grid_words,
    bonusWords,
    hint: p.hint,
    theme: p.theme,
    date: p.date,
  };
}

const PROGRESS_KEY = 'wordrealms-archive-progress-v1';

type ArchiveProgress = Record<string, { words: string[] }>;

function readProgress(): ArchiveProgress {
  try {
    const r = localStorage.getItem(PROGRESS_KEY);
    return r ? (JSON.parse(r) as ArchiveProgress) : {};
  } catch {
    return {};
  }
}

function writeProgress(p: ArchiveProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* quota */
  }
}

/**
 * Returns the daily puzzle for a given date and language.
 * Index: days since 2025-01-01 modulo level count per language.
 */
export async function getPuzzleForDate(date: string, language: SupportedLanguage): Promise<PuzzleConfig> {
  const levels = getLevelsForLanguage(language);
  if (levels.length === 0) {
    throw new Error(`No puzzle levels loaded for language: ${language}`);
  }
  const d = daysBetween('2025-01-01', date);
  const idx = ((d % levels.length) + levels.length) % levels.length;
  const level = levels[idx]!;
  return normalizePuzzleConfig(mapLevelToPuzzle(level, date));
}

export function recordWordsForArchiveDate(date: string, words: string[]): void {
  const p = readProgress();
  p[date] = { words: [...words] };
  writeProgress(p);
}

export function getWordsFoundForDate(date: string): string[] {
  return readProgress()[date]?.words ?? [];
}

export function getRecentPuzzleDates(count: number, fromDate: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() - i);
    dates.push(formatPuzzleDate(d));
  }
  return dates;
}

export async function getRecentPuzzles(
  count: number,
  language: SupportedLanguage,
  fromDate: Date = new Date(),
): Promise<PuzzleConfig[]> {
  const dates = getRecentPuzzleDates(count, fromDate);
  const out: PuzzleConfig[] = [];
  for (const d of dates) {
    out.push(await getPuzzleForDate(d, language));
  }
  return out;
}

export function getTotalPuzzlesPlayed(): number {
  return Object.keys(readProgress()).length;
}

/** Level counts for the bundled *-all-final.json archives (same order as imports). */
export const PUZZLE_LEVEL_COUNTS: Record<SupportedLanguage, number> = {
  en: EN_LEVELS.length,
  de: DE_LEVELS.length,
  fr: FR_LEVELS.length,
  es: ES_LEVELS.length,
  pl: PL_LEVELS.length,
  tr: TR_LEVELS.length,
};
