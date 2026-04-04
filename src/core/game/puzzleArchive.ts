import type { SupportedLanguage } from './dictionaryManager';
import { type PuzzleConfig, formatPuzzleDate, pickGridWords } from './puzzleGenerator';
import rawLevels from '../../data/levels_1_100_corrected_full.json';
import rawLevels101 from '../../data/puzzles-en-101-200.json';
import rawLevels201 from '../../data/puzzles-en-201-300.json';
import rawLevels301 from '../../data/puzzles-en-301-400.json';
import rawLevels401 from '../../data/puzzles-en-401-500.json';

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

const LEVELS_1_100 = rawLevels as LevelEntry[];
const LEVELS_101_500 = [
  ...(rawLevels101 as LevelEntry[]),
  ...(rawLevels201 as LevelEntry[]),
  ...(rawLevels301 as LevelEntry[]),
  ...(rawLevels401 as LevelEntry[]),
];
const ALL_500_LEVELS = [...LEVELS_1_100, ...LEVELS_101_500];

/** Tage zwischen zwei YYYY-MM-DD (lokale Mittagszeit). */
function daysBetween(anchorYmd: string, dateYmd: string): number {
  const a = new Date(`${anchorYmd}T12:00:00`);
  const b = new Date(`${dateYmd}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function levelIndexForDate(dateStr: string): number {
  const d = daysBetween(ANCHOR_DATE, dateStr);
  if (d >= 100) {
    // Use all 500 levels cyclically
    return ((d % 500) + 500) % 500;
  }
  return ((d % 100) + 100) % 100;
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

/** Fehlende `grid_words` (z. B. alter Cache): wie bei Neugenerierung aus nachziehbaren Wörtern wählen. */
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
 * Daily puzzle from all 500 EN levels (cyclic).
 * days < 100  → index = days % 100 from the first 100 levels.
 * days >= 100 → index = days % 500 across all 500 levels.
 */
export async function getPuzzleForDate(date: string, _language: SupportedLanguage): Promise<PuzzleConfig> {
  void _language;
  if (ALL_500_LEVELS.length === 0) {
    throw new Error('No puzzle levels loaded');
  }
  const idx = levelIndexForDate(date);
  const level = ALL_500_LEVELS[idx]!;
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
