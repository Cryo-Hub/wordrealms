import type { SupportedLanguage } from './dictionaryManager';
import { type PuzzleConfig, formatPuzzleDate, pickGridWords } from './puzzleGenerator';

// EN
import rawEn1   from '../../data/puzzles-en-1-100.json';
import rawEn2   from '../../data/puzzles-en-101-200.json';
import rawEn3   from '../../data/puzzles-en-201-300.json';
import rawEn4   from '../../data/puzzles-en-301-400.json';
import rawEn5   from '../../data/puzzles-en-401-500.json';
// DE
import rawDe1   from '../../data/puzzles-de-1-100.json';
import rawDe2   from '../../data/puzzles-de-101-200.json';
import rawDe3   from '../../data/puzzles-de-201-300.json';
import rawDe4   from '../../data/puzzles-de-301-400.json';
import rawDe5   from '../../data/puzzles-de-401-500.json';
// FR
import rawFr1   from '../../data/puzzles-fr-1-100.json';
import rawFr2   from '../../data/puzzles-fr-101-200.json';
import rawFr3   from '../../data/puzzles-fr-201-300.json';
import rawFr4   from '../../data/puzzles-fr-301-400.json';
import rawFr5   from '../../data/puzzles-fr-401-500.json';
// ES
import rawEs1   from '../../data/puzzles-es-1-100.json';
import rawEs2   from '../../data/puzzles-es-101-200.json';
import rawEs3   from '../../data/puzzles-es-201-300.json';
import rawEs4   from '../../data/puzzles-es-301-400.json';
import rawEs5   from '../../data/puzzles-es-401-500.json';
// PL
import rawPl1   from '../../data/puzzles-pl-1-100.json';
import rawPl2   from '../../data/puzzles-pl-101-200.json';
import rawPl3   from '../../data/puzzles-pl-201-300.json';
import rawPl4   from '../../data/puzzles-pl-301-400.json';
import rawPl5   from '../../data/puzzles-pl-401-500.json';
// TR (no 101-200)
import rawTr1   from '../../data/puzzles-tr-1-100.json';
import rawTr3   from '../../data/puzzles-tr-201-300.json';
import rawTr4   from '../../data/puzzles-tr-301-400.json';
import rawTr5   from '../../data/puzzles-tr-401-500.json';

const ANCHOR_DATE = '2025-01-01';

type LevelEntry = {
  id: number;
  level: number;
  difficulty: string;
  letters: string[];
  center: string;
  grid_words: { word: string; length: number }[];
  bonus_words: { word: string; length: number }[];
  intersection_letters: string[];
  hint: string;
  theme: string;
};

const EN_LEVELS: LevelEntry[] = [
  ...(rawEn1 as LevelEntry[]),
  ...(rawEn2 as LevelEntry[]),
  ...(rawEn3 as LevelEntry[]),
  ...(rawEn4 as LevelEntry[]),
  ...(rawEn5 as LevelEntry[]),
];

const DE_LEVELS: LevelEntry[] = [
  ...(rawDe1 as LevelEntry[]),
  ...(rawDe2 as LevelEntry[]),
  ...(rawDe3 as LevelEntry[]),
  ...(rawDe4 as LevelEntry[]),
  ...(rawDe5 as LevelEntry[]),
];

const FR_LEVELS: LevelEntry[] = [
  ...(rawFr1 as LevelEntry[]),
  ...(rawFr2 as LevelEntry[]),
  ...(rawFr3 as LevelEntry[]),
  ...(rawFr4 as LevelEntry[]),
  ...(rawFr5 as LevelEntry[]),
];

const ES_LEVELS: LevelEntry[] = [
  ...(rawEs1 as LevelEntry[]),
  ...(rawEs2 as LevelEntry[]),
  ...(rawEs3 as LevelEntry[]),
  ...(rawEs4 as LevelEntry[]),
  ...(rawEs5 as LevelEntry[]),
];

const PL_LEVELS: LevelEntry[] = [
  ...(rawPl1 as LevelEntry[]),
  ...(rawPl2 as LevelEntry[]),
  ...(rawPl3 as LevelEntry[]),
  ...(rawPl4 as LevelEntry[]),
  ...(rawPl5 as LevelEntry[]),
];

// TR has no 101-200 file → 400 levels
const TR_LEVELS: LevelEntry[] = [
  ...(rawTr1 as LevelEntry[]),
  ...(rawTr3 as LevelEntry[]),
  ...(rawTr4 as LevelEntry[]),
  ...(rawTr5 as LevelEntry[]),
];

function getLevelsForLanguage(lang: string): LevelEntry[] {
  switch (lang) {
    case 'de': return DE_LEVELS;
    case 'fr': return FR_LEVELS;
    case 'es': return ES_LEVELS;
    case 'pl': return PL_LEVELS;
    case 'tr': return TR_LEVELS;
    default:   return EN_LEVELS;
  }
}

/** Days between two YYYY-MM-DD strings (local noon). */
function daysBetween(anchorYmd: string, dateYmd: string): number {
  const a = new Date(`${anchorYmd}T12:00:00`);
  const b = new Date(`${dateYmd}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
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
 * Index is derived from days since 2025-01-01, cycling over the available levels.
 */
export async function getPuzzleForDate(date: string, language: SupportedLanguage): Promise<PuzzleConfig> {
  const levels = getLevelsForLanguage(language);
  if (levels.length === 0) {
    throw new Error(`No puzzle levels loaded for language: ${language}`);
  }
  const d = daysBetween(ANCHOR_DATE, date);
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
