import type { SupportedLanguage } from './dictionaryManager';
import { type PuzzleConfig, formatPuzzleDate, pickGridWords } from './puzzleGenerator';

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
  crossword_grid?: {
    placedWords: { word: string; row: number; col: number; direction: 'across' | 'down'; revealed: boolean[] }[];
    gridSize: number;
  };
};

const PUZZLE_FILES: Record<SupportedLanguage, readonly string[]> = {
  /** EN: levels 1–500 (~485 puzzles). */
  en: [
    'puzzles-en-1-100.json',
    'puzzles-en-101-200.json',
    'puzzles-en-201-300.json',
    'puzzles-en-301-400.json',
    'puzzles-en-401-500.json',
  ],
  /** DE: levels 1–200. */
  de: ['puzzles-de-1-100.json', 'puzzles-de-101-200.json'],
  /** FR: levels 301–700. */
  fr: [
    'puzzles-fr-301-400.json',
    'puzzles-fr-401-500.json',
    'puzzles-fr-501-600.json',
    'puzzles-fr-601-700.json',
  ],
  /** ES: levels 301–400 + 701–900. */
  es: ['puzzles-es-301-400.json', 'puzzles-es-701-800.json', 'puzzles-es-801-900.json'],
  /** PL: no dedicated chunks yet — `getAllLevelsForLanguage` falls back to EN. */
  pl: [],
  /** TR: levels 1–100 + 301–400 + 601–800. */
  tr: [
    'puzzles-tr-1-100.json',
    'puzzles-tr-301-400.json',
    'puzzles-tr-601-700.json',
    'puzzles-tr-701-800.json',
  ],
};

/** Only reference files explicitly — no glob (keeps unused chunks out of the bundle). */
const puzzleChunkLoaders: Record<string, () => Promise<unknown>> = {
  'puzzles-en-1-100.json': () => import('../../data/puzzles-en-1-100.json'),
  'puzzles-en-101-200.json': () => import('../../data/puzzles-en-101-200.json'),
  'puzzles-en-201-300.json': () => import('../../data/puzzles-en-201-300.json'),
  'puzzles-en-301-400.json': () => import('../../data/puzzles-en-301-400.json'),
  'puzzles-en-401-500.json': () => import('../../data/puzzles-en-401-500.json'),
  'puzzles-de-1-100.json': () => import('../../data/puzzles-de-1-100.json'),
  'puzzles-de-101-200.json': () => import('../../data/puzzles-de-101-200.json'),
  'puzzles-fr-301-400.json': () => import('../../data/puzzles-fr-301-400.json'),
  'puzzles-fr-401-500.json': () => import('../../data/puzzles-fr-401-500.json'),
  'puzzles-fr-501-600.json': () => import('../../data/puzzles-fr-501-600.json'),
  'puzzles-fr-601-700.json': () => import('../../data/puzzles-fr-601-700.json'),
  'puzzles-es-301-400.json': () => import('../../data/puzzles-es-301-400.json'),
  'puzzles-es-701-800.json': () => import('../../data/puzzles-es-701-800.json'),
  'puzzles-es-801-900.json': () => import('../../data/puzzles-es-801-900.json'),
  'puzzles-tr-1-100.json': () => import('../../data/puzzles-tr-1-100.json'),
  'puzzles-tr-301-400.json': () => import('../../data/puzzles-tr-301-400.json'),
  'puzzles-tr-601-700.json': () => import('../../data/puzzles-tr-601-700.json'),
  'puzzles-tr-701-800.json': () => import('../../data/puzzles-tr-701-800.json'),
};

const chunkCache = new Map<string, LevelEntry[]>();

async function loadChunk(filename: string): Promise<LevelEntry[]> {
  const cached = chunkCache.get(filename);
  if (cached) return cached;
  const loader = puzzleChunkLoaders[filename];
  if (!loader) throw new Error(`Puzzle chunk not in bundle: ${filename}`);
  const mod = await loader();
  const raw =
    mod && typeof mod === 'object' && 'default' in mod
      ? (mod as { default: unknown }).default
      : mod;
  const arr = Array.isArray(raw) ? (raw as LevelEntry[]) : [];
  chunkCache.set(filename, arr);
  return arr;
}

/** All chunks for a language concatenated, cached per session. */
const languageCache = new Map<string, LevelEntry[]>();

async function getAllLevelsForLanguage(lang: SupportedLanguage): Promise<LevelEntry[]> {
  if (lang === 'pl') {
    return getAllLevelsForLanguage('en');
  }
  const cached = languageCache.get(lang);
  if (cached) return cached;
  const files = PUZZLE_FILES[lang];
  const chunks = await Promise.all(files.map((f) => loadChunk(f)));
  const levels = chunks.flat();
  languageCache.set(lang, levels);
  return levels;
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
    crossword_grid: level.crossword_grid,
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
 * All chunks for the language are loaded in parallel and cached on first call.
 * The cycling index is days-since-anchor mod actual level count.
 * Verified sets: EN ~485 (1–500), DE 200, FR 400 (301–700), ES 300 (301–400 + 701–900),
 * PL uses EN until new PL files exist, TR 400 (1–100 + 301–400 + 601–800).
 */
export async function getPuzzleForDate(date: string, language: SupportedLanguage): Promise<PuzzleConfig> {
  const levels = await getAllLevelsForLanguage(language);
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
