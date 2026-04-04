import type { PointerEvent } from 'react';

export type LetterSlot = {
  index: number;
  cx: number;
  cy: number;
  r: number;
};

type SwipeTrackerProps = {
  width: number;
  height: number;
  letterSlots: LetterSlot[];
  onPathStart: (startIndex: number) => void;
  onPathAppend: (hit: number | null) => void;
  onGestureEnd: () => void;
  disabled?: boolean;
};

function hitTestLetter(svgX: number, svgY: number, slots: LetterSlot[]): number | null {
  let best: number | null = null;
  let bestDist = Infinity;
  for (const s of slots) {
    const dx = svgX - s.cx;
    const dy = svgY - s.cy;
    const d2 = dx * dx + dy * dy;
    if (d2 <= s.r * s.r && d2 < bestDist) {
      bestDist = d2;
      best = s.index;
    }
  }
  return best;
}

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Touch- und Maus-/Pointer-Events auf einer transparenten SVG-Schicht;
 * liefert eine Buchstaben-Index-Sequenz an LetterWheel.
 */
export function SwipeTracker({
  width,
  height,
  letterSlots,
  onPathStart,
  onPathAppend,
  onGestureEnd,
  disabled = false,
}: SwipeTrackerProps) {
  const handlePointerDown = (e: PointerEvent<SVGRectElement>) => {
    if (disabled) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = clientToSvg(svg, e.clientX, e.clientY);
    const hit = hitTestLetter(x, y, letterSlots);
    if (hit !== null) {
      onPathStart(hit);
    }
  };

  const handlePointerMove = (e: PointerEvent<SVGRectElement>) => {
    if (disabled) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const { x, y } = clientToSvg(svg, e.clientX, e.clientY);
    const hit = hitTestLetter(x, y, letterSlots);
    onPathAppend(hit);
  };

  const handlePointerUp = (e: PointerEvent<SVGRectElement>) => {
    if (disabled) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    onGestureEnd();
  };

  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="transparent"
      className="cursor-pointer touch-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
