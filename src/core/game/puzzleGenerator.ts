import type { SupportedLanguage } from './dictionaryManager';
import { getCurrentLanguage } from './dictionaryManager';

export type PuzzleConfig = {
  letters: string[];
  validWords: string[];
  /** Wörter fürs Kreuzwortgitter; fehlend/leer → zur Laufzeit aus `validWords` ableiten. */
  grid_words?: string[];
  /** Zusätzliche gültige Wörter (Bonus), nicht im Kreuzwort platziert. */
  bonusWords?: string[];
  /** Mittelbuchstabe des Rads (falls abweichend von `letters[0]`). */
  center?: string;
  hint?: string;
  theme?: string;
  date: string;
};

/** Bonuswörter: explizit `bonusWords` oder `validWords` minus `grid_words`. */
export function bonusWordPool(puzzle: PuzzleConfig): string[] {
  const u = (s: string) => s.trim().toUpperCase();
  if (puzzle.bonusWords && puzzle.bonusWords.length > 0) {
    return [...new Set(puzzle.bonusWords.map(u))].sort((a, b) => a.localeCompare(b));
  }
  const grid = new Set((puzzle.grid_words ?? []).map(u));
  return [...new Set(puzzle.validWords.map(u).filter((w) => !grid.has(w)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** Längere Wörter zuerst; begrenzt für Platzierungs-Performance im Gitter. */
const MAX_GRID_WORDS = 20;

/** Öffentlich für Fallback, wenn gespeicherte Puzzles noch kein `grid_words` haben. */
export function pickGridWords(traceable: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of traceable) {
    const u = w.toUpperCase();
    if (u.length < 3) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= MAX_GRID_WORDS) break;
  }
  return out;
}

/** JS getDay(): 0=Sunday … 6=Saturday */
const FALLBACK_BY_JS_DAY: readonly (readonly string[])[] = [
  ['S', 'T', 'O', 'N', 'E', 'R', 'S'], // 0 Sunday
  ['S', 'T', 'A', 'R', 'E', 'D', 'N'], // 1 Monday
  ['P', 'L', 'A', 'N', 'E', 'T', 'S'], // 2 Tuesday
  ['G', 'R', 'O', 'W', 'T', 'H', 'S'], // 3 Wednesday
  ['B', 'R', 'I', 'G', 'H', 'T', 'S'], // 4 Thursday
  ['C', 'L', 'O', 'U', 'D', 'S', 'Y'], // 5 Friday
  ['F', 'L', 'O', 'W', 'E', 'R', 'S'], // 6 Saturday
];

const MIN_WORDS_PER_LETTER_TYPE = 3;
/** Mindestanzahl nachziehbarer Wörter pro Puzzle (laut Spezifikation). */
const MIN_TRACEABLE_WORDS = 15;

const multisetPoolCache = new Map<string, string[][]>();

function hashDateAndLang(dateStr: string, lang: string): number {
  let h = 0;
  const s = `${dateStr}:${lang}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

function extractSevenLetterMultisetsFromWordSet(wordSet: Set<string>, max: number): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const w of wordSet) {
    if (w.length !== 7) continue;
    if (!/^[a-z]+$/.test(w)) continue;
    const u = w.toUpperCase();
    const key = [...u].sort().join('');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([...u]);
    if (out.length >= max) break;
  }
  return out;
}

function basePoolFromWordSet(wordSet: Set<string>, lang: SupportedLanguage): string[][] {
  const key = `${lang}:${wordSet.size}`;
  const hit = multisetPoolCache.get(key);
  if (hit) return hit;

  const fromDict = extractSevenLetterMultisetsFromWordSet(wordSet, 12000);
  const presets = FALLBACK_BY_JS_DAY.map((arr) => [...arr]);
  const seen = new Set(fromDict.map((a) => [...a].sort().join('')));
  for (const p of presets) {
    const k = [...p].sort().join('');
    if (!seen.has(k)) {
      seen.add(k);
      fromDict.push(p);
    }
  }
  if (fromDict.length === 0) {
    fromDict.push([...FALLBACK_BY_JS_DAY[0]]);
  }
  multisetPoolCache.set(key, fromDict);
  return fromDict;
}

/** Nach Sprachwechsel aufrufen, damit Buchstaben-Pools neu aus dem Wörterbuch gebaut werden. */
export function clearMultisetPoolCache(): void {
  multisetPoolCache.clear();
}

function letterBagFrom(letters: readonly string[]): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const ch of letters) {
    const c = ch.toUpperCase();
    bag[c] = (bag[c] ?? 0) + 1;
  }
  return bag;
}

function canSpellWithBag(word: string, bag: Record<string, number>): boolean {
  const use: Record<string, number> = {};
  for (const ch of word.toUpperCase()) {
    use[ch] = (use[ch] ?? 0) + 1;
  }
  for (const ch of Object.keys(use)) {
    if ((bag[ch] ?? 0) < use[ch]) return false;
  }
  return true;
}

/**
 * Prüft, ob `word` mit den sieben Rad-Buchstaben gebildet werden kann
 * (freie Reihenfolge; jeder Slot höchstens einmal — Multiset-Abgleich).
 */
export function canFormWord(word: string, letters: readonly string[]): boolean {
  const W = word.toUpperCase();
  if (W.length < 3) return false;
  const bag: Record<string, number> = {};
  for (const c of letters.map((x) => String(x).toUpperCase())) {
    bag[c] = (bag[c] ?? 0) + 1;
  }
  const need: Record<string, number> = {};
  for (let i = 0; i < W.length; i++) {
    const ch = W[i]!;
    need[ch] = (need[ch] ?? 0) + 1;
    if (need[ch]! > (bag[ch] ?? 0)) return false;
  }
  return true;
}

function presetKey(letters: readonly string[]): string {
  return [...letters].sort().join('');
}

const PRESET_VALID: Record<string, readonly string[]> = {
  ADENRST: [
    'STAR',
    'RATE',
    'TEAR',
    'NEAR',
    'READ',
    'DEAR',
    'EARN',
    'REST',
    'NEST',
    'SENT',
    'RENT',
    'ANTS',
    'DARE',
    'EAST',
    'SEAT',
    'TEA',
    'ARE',
    'ART',
    'EAR',
    'END',
    'RED',
    'SAT',
    'SEA',
    'TAN',
    'TEN',
  ],
  AELNPST: [
    'PLANET',
    'PLAN',
    'PLATE',
    'PLEA',
    'LEAN',
    'LATE',
    'NEST',
    'NETS',
    'PAST',
    'PETS',
    'SEAT',
    'STEP',
    'TAPE',
    'TEAL',
    'ANT',
    'APE',
    'APT',
    'ATE',
    'EAT',
    'LAP',
    'LET',
    'PAN',
    'PAT',
    'PET',
    'SAP',
    'SEA',
    'SET',
    'SPA',
    'TAN',
    'TAP',
    'TEN',
  ],
  GHORSTW: [
    'GROWTH',
    'GROW',
    'HOST',
    'SHOT',
    'SORT',
    'ROWS',
    'HOW',
    'HOT',
    'ROT',
    'TWO',
    'WHO',
    'GHOST',
  ],
  BGHIRST: [
    'BRIGHT',
    'RIGHT',
    'LIGHT',
    'BIRTH',
    'GIRTH',
    'GRIT',
    'HITS',
    'BITS',
    'BIG',
    'HIT',
    'SIT',
    'RIB',
  ],
  CDLOSUY: [
    'CLOUD',
    'CLOUDY',
    'LOUD',
    'COLD',
    'DOLL',
    'SOLD',
    'SOUL',
    'COD',
    'CUD',
    'DOC',
    'OLD',
    'CLOD',
    'SCUD',
  ],
  EFLORSW: [
    'FLOWER',
    'FLOW',
    'WOLF',
    'FOWL',
    'ROLE',
    'LORE',
    'ROSE',
    'SLOW',
    'LOW',
    'OWL',
    'ROW',
    'SEW',
    'OWE',
  ],
  ENORSST: [
    'STONE',
    'NOTES',
    'TONES',
    'STORE',
    'SNORE',
    'REST',
    'NEST',
    'ROSE',
    'SENT',
    'RENT',
    'ONE',
    'NET',
    'NOT',
    'SON',
    'TEN',
    'TOE',
  ],
};

function collectCandidateWords(
  base: readonly string[],
  bag: Record<string, number>,
  wordSet: Set<string>,
  language: SupportedLanguage,
): Set<string> {
  const merged = new Set<string>();
  const key = presetKey(base);
  const extra = language === 'en' ? (PRESET_VALID[key] ?? []) : [];

  for (const w of wordSet) {
    if (w.length < 3 || w.length > 7) continue;
    if (!/^[a-z]+$/.test(w)) continue;
    const u = w.toUpperCase();
    if (canSpellWithBag(u, bag)) merged.add(u);
  }
  for (const w of extra) {
    if (canSpellWithBag(w, bag)) merged.add(w);
  }
  return merged;
}

/** Gesamtvorkommen jedes Buchstabens in den Kandidatenwörtern (für Zentrumswahl). */
function letterFrequencyInCandidates(candidates: Iterable<string>): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of candidates) {
    for (const ch of w.toUpperCase()) {
      m.set(ch, (m.get(ch) ?? 0) + 1);
    }
  }
  return m;
}

/** Aufeinanderfolgende Buchstabenpaare in den Kandidatenwörtern (für Ring-Nachbarschaft). */
function bigramCountsInCandidates(candidates: Iterable<string>): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of candidates) {
    const u = w.toUpperCase();
    for (let i = 0; i < u.length - 1; i++) {
      const key = `${u[i]}${u[i + 1]}`;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
  }
  return m;
}

function removeOneCopy(chars: string[], letter: string): string[] {
  const i = chars.findIndex((c) => c.toUpperCase() === letter.toUpperCase());
  if (i < 0) return [...chars];
  return [...chars.slice(0, i), ...chars.slice(i + 1)];
}

/** Alle Permutationen von `arr` (n! ; bei n=6 → 720). */
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr as T[]];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) {
      out.push([arr[i], ...p]);
    }
  }
  return out;
}

function filterTraceable(letters: readonly string[], words: Iterable<string>): string[] {
  const out: string[] = [];
  for (const w of words) {
    if (canFormWord(w, letters)) out.push(w);
  }
  return out;
}

/** Wie viele nachziehbare Wörter enthalten Buchstabe `L` mindestens einmal? */
function countWordsContainingLetter(traceable: readonly string[], L: string): number {
  const u = L.toUpperCase();
  let n = 0;
  for (const w of traceable) {
    if (w.includes(u)) n++;
  }
  return n;
}

function coveragePerLetterType(
  traceable: readonly string[],
  letterTypes: ReadonlySet<string>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const L of letterTypes) {
    m.set(L, countWordsContainingLetter(traceable, L));
  }
  return m;
}

/**
 * Bewertet Ring-Nachbarschaften: Mitte↔Ring + Kanten entlang des Rings (1–2–…–6–1).
 * Höher = häufiger treten diese Paare in Kandidatenwörtern nebeneinander auf.
 */
function ringBigramScore(letters: readonly string[], bigrams: Map<string, number>): number {
  if (letters.length !== 7) return 0;
  const c = letters[0];
  let s = 0;
  for (let i = 1; i <= 6; i++) {
    const a = `${c}${letters[i]}`;
    s += bigrams.get(a) ?? 0;
  }
  for (let i = 1; i <= 6; i++) {
    const a = letters[i];
    const b = i === 6 ? letters[1] : letters[i + 1];
    s += bigrams.get(`${a}${b}`) ?? 0;
  }
  return s;
}

type Scored = {
  letters: string[];
  traceable: string[];
  allLettersCovered3: boolean;
  minCover: number;
  bigramScore: number;
};

function compareScored(a: Scored, b: Scored): number {
  if (a.allLettersCovered3 !== b.allLettersCovered3) return a.allLettersCovered3 ? -1 : 1;
  if (a.traceable.length !== b.traceable.length) return b.traceable.length - a.traceable.length;
  if (a.minCover !== b.minCover) return b.minCover - a.minCover;
  return b.bigramScore - a.bigramScore;
}

/** Häufigster Buchstabe in den Kandidatenwörtern; bei Gleichstand lexikographisch kleinster Buchstabe. */
function pickCenterLetter(letterTypes: ReadonlySet<string>, freq: Map<string, number>): string {
  let best = '';
  let bestF = -1;
  for (const L of letterTypes) {
    const f = freq.get(L) ?? 0;
    if (f > bestF || (f === bestF && (best === '' || L < best))) {
      bestF = f;
      best = L;
    }
  }
  return best;
}

function buildArrangement(
  base: readonly string[],
  candidates: Set<string>,
  freq: Map<string, number>,
  bigrams: Map<string, number>,
  letterTypes: Set<string>,
  logBestArrangement: boolean,
): Scored {
  const baseArr = [...base].map((c) => c.toUpperCase());
  const center = pickCenterLetter(letterTypes, freq);
  const ringPool = removeOneCopy(baseArr, center);

  let best: Scored | null = null;

  if (ringPool.length === 6) {
    const perms = permutations(ringPool);
    for (const ring of perms) {
      const letters = [center, ...ring] as string[];
      const traceable = filterTraceable(letters, candidates);
      const cov = coveragePerLetterType(traceable, letterTypes);
      let minCover = Infinity;
      for (const v of cov.values()) {
        if (v < minCover) minCover = v;
      }
      if (minCover === Infinity) minCover = 0;

      const allLettersCovered3 = [...letterTypes].every(
        (L) => (cov.get(L) ?? 0) >= MIN_WORDS_PER_LETTER_TYPE,
      );

      const scored: Scored = {
        letters,
        traceable,
        allLettersCovered3,
        minCover,
        bigramScore: ringBigramScore(letters, bigrams),
      };

      if (!best || compareScored(scored, best) < 0) {
        best = scored;
      }
    }
  }

  if (!best) {
    const traceable = filterTraceable(baseArr, candidates);
    best = {
      letters: baseArr,
      traceable,
      allLettersCovered3: false,
      minCover: 0,
      bigramScore: 0,
    };
  }

  if (logBestArrangement) {
    console.log(`Best arrangement: ${best.traceable.length} traceable words`);
  }

  return best;
}

/**
 * Einziges Puzzle pro Kalendertag & Sprache: deterministische Buchstabenwahl aus
 * Wörterbuch-Multisets + Fallback-Presets; mindestens MIN_TRACEABLE_WORDS nachziehbare Wörter.
 */
export async function generatePuzzle(
  _language: SupportedLanguage,
  date: string,
  wordSet: Set<string>,
): Promise<PuzzleConfig> {
  void _language;
  const language = getCurrentLanguage();
  const pool = basePoolFromWordSet(wordSet, language);
  const seed = hashDateAndLang(date, language);
  const maxAttempts = Math.min(600, Math.max(pool.length * 4, 200));

  let bestFallback: Scored | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const base = [...pool[(seed + attempt) % pool.length]];
    const baseBag = letterBagFrom(base);
    const candidates = collectCandidateWords(base, baseBag, wordSet, language);

    const freq = letterFrequencyInCandidates(candidates);
    const bigrams = bigramCountsInCandidates(candidates);
    const letterTypes = new Set(base.map((c) => c.toUpperCase()));

    const best = buildArrangement(base, candidates, freq, bigrams, letterTypes, false);

    if (!bestFallback || best.traceable.length > bestFallback.traceable.length) {
      bestFallback = best;
    }

    if (best.traceable.length >= MIN_TRACEABLE_WORDS) {
      const traceable = [...best.traceable];
      traceable.sort((a, b) => b.length - a.length || a.localeCompare(b));
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.log(
          `[WordRealms] Puzzle ${date} [${language}] ${presetKey(base)}: ${traceable.length} traceable`,
        );
      }
      return {
        letters: [...best.letters],
        validWords: traceable,
        grid_words: pickGridWords(traceable),
        date,
      };
    }
  }

  const best = bestFallback ?? {
    letters: [...pool[seed % pool.length]],
    traceable: [],
    allLettersCovered3: false,
    minCover: 0,
    bigramScore: 0,
  };
  let traceable = [...best.traceable];
  traceable.sort((a, b) => b.length - a.length || a.localeCompare(b));
  return {
    letters: [...best.letters],
    validWords: traceable,
    grid_words: pickGridWords(traceable),
    date,
  };
}

export function getNextTraceableHint(
  letters: readonly string[],
  validWords: readonly string[],
  foundWords: readonly string[],
): string | null {
  const found = new Set(foundWords.map((w) => w.toUpperCase()));
  for (const w of validWords) {
    if (found.has(w)) continue;
    if (canFormWord(w, letters)) return w;
  }
  return null;
}

export function getInstallTimestamp(): number {
  const k = 'wordrealms_install_ts';
  let t = Number(localStorage.getItem(k));
  if (!t) {
    t = Date.now();
    localStorage.setItem(k, String(t));
  }
  return t;
}

/** Puzzle #1 = 3. April 2026 (Launch). */
const PUZZLE_LAUNCH_UTC = Date.UTC(2026, 3, 3);

export function getPuzzleNumber(d = new Date()): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const launchDay = Math.floor(PUZZLE_LAUNCH_UTC / dayMs);
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / dayMs);
  return Math.max(1, day - launchDay + 1);
}

export function formatPuzzleDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
