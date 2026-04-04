import { isValidWord } from './dictionaryManager';

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

export function validateWord(word: string, foundWords: string[]): WordValidationResult {
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
  if (!isValidWord(w)) {
    return { valid: false, reason: 'not_in_dictionary' };
  }
  return { valid: true };
}
