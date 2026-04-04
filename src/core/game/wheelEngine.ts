/** WordRealms — reine Wheel-Logik (ohne Wörterbuch). */

export const MIN_WORD_LENGTH = 3 as const;

/** 7 Buchstaben: Index 0 = Mitte, 1–6 = Ring (im Uhrzeigersinn ab 12 Uhr). */
export const WHEEL_LETTER_COUNT = 7 as const;

export type PathValidationReason =
  | 'too_short'
  | 'duplicate'
  | 'invalid_path'
  | 'ok';

export type CompletedPathResult = {
  ok: boolean;
  word?: string;
  reason?: PathValidationReason;
};

/**
 * Nachbarschaft: Mitte (0) ist mit allen äußeren (1–6) verbunden;
 * auf dem Ring ist jeder Buchstabe mit den beiden Nachbarn und der Mitte verbunden.
 */
function buildAdjacency(): ReadonlyMap<number, ReadonlySet<number>> {
  const m = new Map<number, Set<number>>();
  m.set(0, new Set([1, 2, 3, 4, 5, 6]));
  for (let i = 1; i <= 6; i++) {
    const prev = i === 1 ? 6 : i - 1;
    const next = i === 6 ? 1 : i + 1;
    m.set(i, new Set([0, prev, next]));
  }
  return m;
}

const ADJ = buildAdjacency();

export function areIndicesAdjacent(a: number, b: number): boolean {
  return ADJ.get(a)?.has(b) ?? false;
}

/** Nachbar-Indizes für Slot `i` (0 = Mitte, 1–6 = Ring). */
export function getWheelNeighborIndices(i: number): readonly number[] {
  const s = ADJ.get(i);
  return s ? [...s] : [];
}

/** Jeder Schritt im Pfad muss zu Nachbarbuchstaben führen. */
export function isValidSwipePath(path: number[]): boolean {
  if (path.length <= 1) return true;
  for (let i = 0; i < path.length - 1; i++) {
    if (!areIndicesAdjacent(path[i], path[i + 1])) return false;
  }
  return true;
}

/** Erweitert den Swipe-Pfad um einen Buchstaben (oder unverändert bei null / ungültigem Schritt). */
export function appendToSwipePath(prev: number[], nextIndex: number | null): number[] {
  if (nextIndex === null) return prev;
  if (prev.length === 0) return [nextIndex];
  const last = prev[prev.length - 1];
  if (nextIndex === last) return prev;
  if (!areIndicesAdjacent(last, nextIndex)) return prev;
  return [...prev, nextIndex];
}

export function pathToWord(path: number[], letters: string[]): string {
  return path.map((i) => letters[i] ?? '').join('');
}

export function normalizeLetters(letters: string[]): string[] {
  return letters.slice(0, WHEEL_LETTER_COUNT).map((c) => c.toUpperCase());
}

/**
 * Strukturprüfung nach Loslassen: Mindestlänge, gültiger Pfad, optional Duplikat in `foundWords`.
 * Wörterbuch-Prüfung erfolgt später (wordValidator / Server).
 */
export function evaluateCompletedPath(
  path: number[],
  letters: string[],
  foundWords: readonly string[] = [],
): CompletedPathResult {
  if (!isValidSwipePath(path)) {
    return { ok: false, reason: 'invalid_path' };
  }
  const word = pathToWord(path, letters);
  if (word.length < MIN_WORD_LENGTH) {
    return { ok: false, reason: 'too_short' };
  }
  const upper = word.toUpperCase();
  if (foundWords.some((w) => w.toUpperCase() === upper)) {
    return { ok: false, word, reason: 'duplicate' };
  }
  return { ok: true, word, reason: 'ok' };
}
