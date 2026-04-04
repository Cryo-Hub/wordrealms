import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CrosswordGrid as CrosswordGridType, PlacedWord } from '../../../core/game/crosswordEngine';
import { CrosswordCell, type CrosswordCellState } from './CrosswordCell';

type CrosswordGridProps = {
  crossword: CrosswordGridType;
};

const CELL_PX = 28;
const GAP_PX = 2;

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

function CrosswordGridInner({ crossword }: CrosswordGridProps) {
  const { cells, placedWords, width, height } = crossword;
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const naturalW = width * CELL_PX + (width - 1) * GAP_PX;
  const naturalH = height * CELL_PX + (height - 1) * GAP_PX;

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w <= 0 || naturalW <= 0) {
        setScale(1);
        return;
      }
      setScale(Math.min(1, w / naturalW));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalW, width]);

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

  const scaledW = naturalW * scale;
  const scaledH = naturalH * scale;

  return (
    <div
      ref={hostRef}
      className="flex w-full max-w-full flex-shrink-0 justify-center overflow-visible px-1 py-1"
      role="presentation"
    >
      <div
        className="relative mx-auto overflow-visible"
        style={{
          width: scaledW,
          height: scaledH,
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: naturalW,
            height: naturalH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            display: 'grid',
            gridTemplateColumns: `repeat(${width}, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(${height}, ${CELL_PX}px)`,
            gap: GAP_PX,
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
      </div>
    </div>
  );
}

export const CrosswordGrid = memo(CrosswordGridInner);
