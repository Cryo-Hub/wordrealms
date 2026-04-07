import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  WHEEL_LETTER_COUNT,
  appendToSwipePath,
  evaluateCompletedPath,
  normalizeLetters,
  pathToWord,
} from '../../../core/game/wheelEngine';
import { SwipeTracker, type LetterSlot } from './SwipeTracker';
import { WheelLetter } from './WheelLetter';
import { WordPreview } from './WordPreview';
import { initAudioOnGesture, soundService } from '../../../services/soundService';

const VIEW_SIZE = 320;
const CENTER = { x: VIEW_SIZE / 2, y: VIEW_SIZE / 2 };
const OUTER_RADIUS = 92;
/** proportional zu früherem 400px-Rad */
const CENTER_LETTER_R = 22;
const OUTER_LETTER_R = 22;

export type LetterWheelProps = {
  letters: string[];
  onWordFormed: (word: string) => void;
  /** Bereits gefundene Wörter (Duplikat-Prüfung in wheelEngine). */
  foundWords?: string[];
};

export function LetterWheel({ letters, onWordFormed, foundWords = [] }: LetterWheelProps) {
  const normalized = normalizeLetters(letters);
  const [path, setPath] = useState<number[]>([]);
  const pathRef = useRef<number[]>([]);
  pathRef.current = path;
  const [sessionFound, setSessionFound] = useState<string[]>([]);
  const pathLenRef = useRef(0);

  useEffect(() => {
    if (path.length > pathLenRef.current) {
      initAudioOnGesture();
      soundService.letterSelect();
    }
    pathLenRef.current = path.length;
  }, [path.length]);

  const mergedFound = useMemo(
    () => [...foundWords, ...sessionFound],
    [foundWords, sessionFound],
  );

  const letterSlots: LetterSlot[] = useMemo(() => {
    const slots: LetterSlot[] = [
      { index: 0, cx: CENTER.x, cy: CENTER.y, r: CENTER_LETTER_R },
    ];
    const outer = WHEEL_LETTER_COUNT - 1;
    for (let i = 0; i < outer; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / outer;
      slots.push({
        index: i + 1,
        cx: CENTER.x + Math.cos(angle) * OUTER_RADIUS,
        cy: CENTER.y + Math.sin(angle) * OUTER_RADIUS,
        r: OUTER_LETTER_R,
      });
    }
    return slots;
  }, []);

  const previewWord = path.length > 0 ? pathToWord(path, normalized) : '';

  const pathPoints = useMemo(() => {
    if (path.length < 2) return '';
    return path
      .map((idx) => {
        const slot = letterSlots.find((s) => s.index === idx);
        if (!slot) return null;
        return `${slot.cx},${slot.cy}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [path, letterSlots]);

  const handlePathStart = useCallback((startIndex: number) => {
    setPath([startIndex]);
  }, []);

  const handlePathAppend = useCallback((hit: number | null) => {
    setPath((prev) => appendToSwipePath(prev, hit));
  }, []);

  const handleGestureEnd = useCallback(() => {
    const currentPath = pathRef.current;
    setPath([]);
    if (currentPath.length === 0) return;
    const result = evaluateCompletedPath(currentPath, normalized, mergedFound);
    if (result.ok && result.word) {
      onWordFormed(result.word);
      setSessionFound((s) => [...s, result.word!.toUpperCase()]);
    }
  }, [normalized, mergedFound, onWordFormed]);

  const validLetters =
    normalized.length === WHEEL_LETTER_COUNT ? normalized : padLetters(normalized);

  return (
    <div className="relative mx-auto h-full w-full min-h-0 min-w-0 max-h-full max-w-full bg-transparent">
      <div className="pointer-events-none absolute inset-x-0 top-1 z-10 flex justify-center px-1">
        <WordPreview word={previewWord} compact />
      </div>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-[1] block touch-none select-none bg-transparent"
          style={{ touchAction: 'none' }}
          role="img"
          aria-label="Buchstabenrad zum Verbinden von Wörtern"
        >
          {pathPoints ? (
            <motion.polyline
              fill="none"
              stroke="var(--gold-primary)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(201,162,39,0.8))' }}
              points={pathPoints}
              initial={{ opacity: 0.45 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          ) : null}

          {validLetters.map((ch, i) => {
            const slot = letterSlots.find((s) => s.index === i)!;
            const isOnPath = path.includes(i);
            const isPathEnd = path.length > 0 && path[path.length - 1] === i;
            return (
              <WheelLetter
                key={`${i}-${ch}`}
                letter={ch}
                cx={slot.cx}
                cy={slot.cy}
                r={slot.r}
                index={i}
                isOnPath={isOnPath}
                isPathEnd={isPathEnd}
              />
            );
          })}

          <SwipeTracker
            width={VIEW_SIZE}
            height={VIEW_SIZE}
            letterSlots={letterSlots}
            onPathStart={handlePathStart}
            onPathAppend={handlePathAppend}
            onGestureEnd={handleGestureEnd}
          />
        </svg>
    </div>
  );
}

function padLetters(letters: string[]): string[] {
  const out = [...letters];
  while (out.length < WHEEL_LETTER_COUNT) {
    out.push('?');
  }
  return out.slice(0, WHEEL_LETTER_COUNT);
}
