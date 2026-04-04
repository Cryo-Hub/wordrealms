import { useMemo } from 'react';
import type { CrosswordGrid as CrosswordGridType, PlacedWord } from '../../../core/game/crosswordEngine';
import { CrosswordCell, type CrosswordCellState } from './CrosswordCell';

type CrosswordGridProps = {
  crossword: CrosswordGridType;
};

function cellRevealState(
  row: number,
  col: number,
  letter: string,
  placedWords: PlacedWord[],
): CrosswordCellState {
  if (!letter) return 'empty';
  let revealed = false;
  for (const pw of placedWords) {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === 'across' ? pw.row : pw.row + i;
      const c = pw.direction === 'across' ? pw.col + i : pw.col;
      if (r === row && c === col && pw.revealed[i]) {
        revealed = true;
        break;
      }
    }
    if (revealed) break;
  }
  return revealed ? 'revealed' : 'hidden';
}

export function CrosswordGrid({ crossword }: CrosswordGridProps) {
  const { cells, placedWords, width, height } = crossword;

  const cellStates = useMemo(() => {
    const rows: CrosswordCellState[][] = [];
    for (let r = 0; r < height; r++) {
      const row: CrosswordCellState[] = [];
      for (let c = 0; c < width; c++) {
        const ch = cells[r]![c] ?? '';
        row.push(cellRevealState(r, c, ch, placedWords));
      }
      rows.push(row);
    }
    return rows;
  }, [cells, placedWords, width, height]);

  return (
    <div
      className="mx-auto w-full max-w-[90vw] overflow-auto px-1"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, minmax(28px, 1fr))`,
        gridTemplateRows: `repeat(${height}, minmax(28px, auto))`,
        gap: 2,
      }}
      role="grid"
      aria-label="Kreuzworträtsel"
    >
      {cells.map((row, r) =>
        row.map((letter, c) => {
          const st = cellStates[r]![c]!;
          return <CrosswordCell key={`${r}-${c}-${st}`} letter={letter} state={st} />;
        }),
      )}
    </div>
  );
}
