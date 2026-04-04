import { useEffect, useRef, useState } from 'react';
import { useResourceStore } from '../../../stores/resourceStore';

function useCountUp(target: number): number {
  const [n, setN] = useState(target);
  const lastRef = useRef(target);

  useEffect(() => {
    const from = lastRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const dur = 420;
    let frame: number;
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - u) * (1 - u);
      const v = Math.round(from + (to - from) * eased);
      setN(v);
      if (u < 1) frame = requestAnimationFrame(tick);
      else lastRef.current = to;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return n;
}

export function ResourceBar() {
  const gold = useResourceStore((s) => s.gold);
  const wood = useResourceStore((s) => s.wood);
  const stone = useResourceStore((s) => s.stone);

  const g = useCountUp(gold);
  const w = useCountUp(wood);
  const s = useCountUp(stone);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#2a2018] bg-[rgba(8,6,4,0.97)] px-3 py-2.5">
      <div className="mx-auto flex max-w-[430px] flex-wrap items-center justify-center gap-2 font-num text-sm font-bold">
        <div className="flex items-center gap-1.5 rounded-[8px] border border-[#2a2018] bg-[#1a1410] px-2.5 py-1 tabular-nums">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#2a2018] bg-[#080608] text-xs text-[#c9a227]">
            G
          </span>
          <span className="text-[#c9a227]">{g}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-[8px] border border-[#2a2018] bg-[#1a1410] px-2.5 py-1 tabular-nums">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#2a2018] bg-[#080608] text-xs text-[#4a7a2a]">
            W
          </span>
          <span className="text-[#4a7a2a]">{w}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-[8px] border border-[#2a2018] bg-[#1a1410] px-2.5 py-1 tabular-nums">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#2a2018] bg-[#080608] text-xs text-[#7a7060]">
            S
          </span>
          <span className="text-[#7a7060]">{s}</span>
        </div>
      </div>
    </header>
  );
}
