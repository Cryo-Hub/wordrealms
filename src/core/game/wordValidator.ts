import {
  getCurrentLanguage,
  isValidWord,
  validateWordOnline,
  type SupportedLanguage,
} from './dictionaryManager';

export type WordInvalidReason =
  | 'min_length'
  | 'letters_only'
  | 'already_found'
  | 'not_in_dictionary';

export type WordValidationResult = {
  valid: boolean;
  reason?: WordInvalidReason;
};

const AZ = /^[A-Z]+$/;

export type ValidateWordOptions = {
  /** Wörter, die immer gelten (Lösungs- und Bonusliste). */
  validWords?: readonly string[];
  /** Gitter-/Kreuzwort-Wörter; zusätzlich zu validWords. */
  gridWords?: readonly string[];
  /** UI-Sprache / Wörterbuch; Standard: getCurrentLanguage(). */
  lang?: string;
  /**
   * Nur Wörter aus dem Puzzle-Lexikon (z. B. Free Play):
   * keine externe Wörterbuchprüfung, nur validWords/gridWords.
   */
  restrictToPuzzleVocabulary?: boolean;
};

function puzzleWordSet(validWords?: readonly string[], gridWords?: readonly string[]): Set<string> {
  const s = new Set<string>();
  for (const w of validWords ?? []) {
    const u = w.trim().toUpperCase();
    if (u.length >= 2) s.add(u);
  }
  for (const w of gridWords ?? []) {
    const u = w.trim().toUpperCase();
    if (u.length >= 2) s.add(u);
  }
  return s;
}

/**
 * Wort prüfen: Puzzle-Wörter zuerst, dann EN lokal, sonst Online-API (mit Cache).
 * `restrictToPuzzleVocabulary`: nur Puzzle-Lexikon, kein Wörterbuch.
 */
export async function validateWord(
  word: string,
  foundWords: string[],
  options?: ValidateWordOptions,
): Promise<WordValidationResult> {
  const w = word.trim().toUpperCase();
  if (w.length < 3) {
    return { valid: false, reason: 'min_length' };
  }
  if (!AZ.test(w)) {
    return { valid: false, reason: 'letters_only' };
  }
  if (foundWords.some((x) => x.toUpperCase() === w)) {
    return { valid: false, reason: 'already_found' };
  }

  const puzzleSet = puzzleWordSet(options?.validWords, options?.gridWords);
  if (puzzleSet.has(w)) {
    return { valid: true };
  }

  if (options?.restrictToPuzzleVocabulary) {
    return { valid: false, reason: 'not_in_dictionary' };
  }

  const lang = (options?.lang ?? getCurrentLanguage()) as SupportedLanguage;

  if (lang === 'en') {
    if (!isValidWord(w)) {
      return { valid: false, reason: 'not_in_dictionary' };
    }
    return { valid: true };
  }

  const online = await validateWordOnline(w, lang);
  if (!online) {
    return { valid: false, reason: 'not_in_dictionary' };
  }
  return { valid: true };
}
