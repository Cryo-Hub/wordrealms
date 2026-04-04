/**
 * Baut ein Wordscapes-ähnliches Kreuzwortgitter aus einer Wortliste.
 * Unterstützt typischerweise 3–10 (oder mehr) Gitter-Wörter; platziert iterativ so viele wie möglich.
 */

export type WordDirection = 'across' | 'down';

export type PlacedWord = {
  word: string;
  row: number;
  col: number;
  direction: WordDirection;
  /** Pro Buchstabenposition: sichtbar, sobald das Wort gefunden wurde. */
  revealed: boolean[];
};

export type CrosswordGrid = {
  cells: string[][];
  placedWords: PlacedWord[];
  width: number;
  height: number;
  /** Wörter, die nicht ins Raster passen (Bonus). */
  skippedWords: string[];
};

const GRID = 12;
/** Mindestlänge pro Wort (übliches Wordscapes-Minimum). */
const MIN_WORD_LEN = 3;
/** Obere Grenze Eingabelänge (Performance); längere Listen werden gekürzt. */
const MAX_INPUT_WORDS = 24;

function emptyGrid(): string[][] {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => ''));
}

function tryPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: WordDirection,
): { ok: boolean; overlapScore: number } {
  const len = word.length;
  let overlapScore = 0;
  if (dir === 'across') {
    if (col < 0 || col + len > GRID) return { ok: false, overlapScore: 0 };
    if (col > 0 && grid[row]![col - 1] !== '') return { ok: false, overlapScore: 0 };
    if (col + len < GRID && grid[row]![col + len] !== '') return { ok: false, overlapScore: 0 };
    for (let k = 0; k < len; k++) {
      const ch = word[k]!;
      const cell = grid[row]![col + k]!;
      if (cell !== '' && cell !== ch) return { ok: false, overlapScore: 0 };
      if (cell === ch) overlapScore += 1;
    }
  } else {
    if (row < 0 || row + len > GRID) return { ok: false, overlapScore: 0 };
    if (row > 0 && grid[row - 1]![col] !== '') return { ok: false, overlapScore: 0 };
    if (row + len < GRID && grid[row + len]![col] !== '') return { ok: false, overlapScore: 0 };
    for (let k = 0; k < len; k++) {
      const ch = word[k]!;
      const cell = grid[row + k]![col]!;
      if (cell !== '' && cell !== ch) return { ok: false, overlapScore: 0 };
      if (cell === ch) overlapScore += 1;
    }
  }
  return { ok: true, overlapScore };
}

function applyWord(grid: string[][], word: string, row: number, col: number, dir: WordDirection): void {
  for (let k = 0; k < word.length; k++) {
    if (dir === 'across') grid[row]![col + k] = word[k]!;
    else grid[row + k]![col] = word[k]!;
  }
}

type BestPlacement = {
  score: number;
  row: number;
  col: number;
  dir: WordDirection;
  placed: PlacedWord;
};

function findBestPlacement(
  grid: string[][],
  placedWords: PlacedWord[],
  w: string,
): BestPlacement | null {
  let best: BestPlacement | null = null;
  for (const pw of placedWords) {
    for (let pi = 0; pi < pw.word.length; pi++) {
      for (let ni = 0; ni < w.length; ni++) {
        if (pw.word[pi] !== w[ni]) continue;
        const perp: WordDirection = pw.direction === 'across' ? 'down' : 'across';
        let startR: number;
        let startC: number;
        if (pw.direction === 'across') {
          startR = pw.row - ni;
          startC = pw.col + pi;
        } else {
          startR = pw.row + pi;
          startC = pw.col - ni;
        }
        const test = tryPlace(grid, w, startR, startC, perp);
        if (!test.ok) continue;
        const score = test.overlapScore;
        if (!best || score > best.score) {
          best = {
            score,
            row: startR,
            col: startC,
            dir: perp,
            placed: {
              word: w,
              row: startR,
              col: startC,
              direction: perp,
              revealed: Array.from({ length: w.length }, () => false),
            },
          };
        }
      }
    }
  }
  return best;
}

/**
 * Erzeugt ein Kreuzwortgitter. Längere Wörter zuerst; mehrere Durchläufe, bis keine neue Platzierung mehr möglich ist.
 * Verarbeitet typischerweise 3–10+ Wörter; bei weniger als 3 platzierten Wörtern: Konsole-Warnung (kein Crash).
 */
export function buildCrosswordGrid(words: string[]): CrosswordGrid {
  const seen = new Set<string>();
  const sorted: string[] = [];
  for (const raw of words) {
    const w = raw.trim().toUpperCase();
    if (w.length < MIN_WORD_LEN) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    sorted.push(w);
  }
  sorted.sort((a, b) => b.length - a.length || a.localeCompare(b));

  const limited = sorted.slice(0, MAX_INPUT_WORDS);

  const grid = emptyGrid();
  const placedWords: PlacedWord[] = [];
  const skippedWords: string[] = [];

  if (limited.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[WordRealms/crosswordEngine] buildCrosswordGrid: no words (min length ' + MIN_WORD_LEN + ').');
    }
    return { cells: grid, placedWords, width: GRID, height: GRID, skippedWords };
  }

  const first = limited[0]!;
  const row = Math.floor(GRID / 2);
  const col = Math.max(0, Math.floor((GRID - first.length) / 2));
  const dir: WordDirection = 'across';
  const t0 = tryPlace(grid, first, row, col, dir);
  if (t0.ok) {
    applyWord(grid, first, row, col, dir);
    placedWords.push({
      word: first,
      row,
      col,
      direction: dir,
      revealed: Array.from({ length: first.length }, () => false),
    });
  } else {
    skippedWords.push(first);
  }

  let pending = limited.slice(1);

  while (pending.length > 0) {
    let placedThisRound = 0;
    const stillPending: string[] = [];
    for (const w of pending) {
      const best = findBestPlacement(grid, placedWords, w);
      if (best && best.score > 0) {
        applyWord(grid, w, best.row, best.col, best.dir);
        placedWords.push(best.placed);
        placedThisRound++;
      } else {
        stillPending.push(w);
      }
    }
    pending = stillPending;
    if (placedThisRound === 0) break;
  }

  skippedWords.push(...pending);

  if (placedWords.length < 3) {
    console.warn(
      '[WordRealms/crosswordEngine] Fewer than 3 words placed on the grid (' +
        placedWords.length +
        '). Input had ' +
        limited.length +
        ' candidate word(s); skipped ' +
        skippedWords.length +
        '.',
    );
  }

  return {
    cells: grid,
    placedWords,
    width: GRID,
    height: GRID,
    skippedWords,
  };
}
