/** WordRealms — reine Wheel-Logik (ohne Wörterbuch).
 * Freie Buchstabenwahl (wie Wordscapes / Word Connect): kein Nachbarschaftszwang;
 * jeder Slot (Index) höchstens einmal pro Wort. */

export const MIN_WORD_LENGTH = 3 as const;

/** 9 Buchstaben: Index 0 = Mitte, 1–8 = Ring (im Uhrzeigersinn ab 12 Uhr, 360°/8 je Außen-Slot). */
export const WHEEL_LETTER_COUNT = 9 as const;

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
 * Gültiger Pfad: keine doppelten Buchstaben-Slots (kein Index zweimal).
 * Keine Nachbarschaftsprüfung — beliebige Reihenfolge der Rad-Positionen.
 */
export function isValidSwipePath(path: number[]): boolean {
  if (path.length <= 1) return true;
  const seen = new Set<number>();
  for (const i of path) {
    if (seen.has(i)) return false;
    seen.add(i);
  }
  return true;
}

/** Erweitert den Swipe-Pfad; derselbe Index kann nicht erneut gewählt werden. */
export function appendToSwipePath(prev: number[], nextIndex: number | null): number[] {
  if (nextIndex === null) return prev;
  if (prev.includes(nextIndex)) return prev;
  return [...prev, nextIndex];
}

export function pathToWord(path: number[], letters: string[]): string {
  return path.map((i) => letters[i] ?? '').join('');
}

export function normalizeLetters(letters: string[]): string[] {
  return letters.slice(0, WHEEL_LETTER_COUNT).map((c) => c.toUpperCase());
}

/**
 * Strukturprüfung nach Loslassen: Mindestlänge, gültiger Pfad (keine Duplikat-Indizes), optional Duplikat in `foundWords`.
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
