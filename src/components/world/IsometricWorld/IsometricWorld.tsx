import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getWorldSlots } from '../../../core/world/isometricRenderer';
import { useWorldStore } from '../../../stores/worldStore';
import { Building } from './Building';
import { BuildingSlot } from './BuildingSlot';
import { ConstructionModal } from './ConstructionModal';
import type { BuildingType } from '../../../core/world/buildingConfig';

const MIN_W = 320;
const MIN_H = 200;
const PAD = 16;
/** Slot box size — groß genug für text-5xl Gebäude. */
const SLOT_PX = 104;

type IsometricWorldProps = {
  onBuildingSelect?: (type: BuildingType) => void;
};

export function IsometricWorld({ onBuildingSelect }: IsometricWorldProps) {
  const slots = useWorldStore((s) => s.slots);
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: MIN_W, h: MIN_H });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox((b) => ({ ...b, w: Math.max(MIN_W, r.width) }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const worldSlots = getWorldSlots();
    const xs = worldSlots.map((w) => w.screen.screenX);
    const ys = worldSlots.map((w) => w.screen.screenY);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;

    const usableW = box.w - PAD * 2;
    const usableH = box.h - PAD * 2;

    const raw = worldSlots.map((ws) => {
      const tX = (ws.screen.screenX - minX) / spanX;
      const tY = (ws.screen.screenY - minY) / spanY;
      const left = PAD + tX * Math.max(0, usableW - SLOT_PX);
      const top = PAD + tY * Math.max(0, usableH - SLOT_PX);
      return { ...ws, left, top };
    });

    const cx = raw.map((p) => p.left + SLOT_PX / 2);
    const cy = raw.map((p) => p.top + SLOT_PX / 2);
    const bboxMidX = (Math.min(...cx) + Math.max(...cx)) / 2;
    const bboxMidY = (Math.min(...cy) + Math.max(...cy)) / 2;
    const dx = box.w / 2 - bboxMidX;
    const dy = box.h / 2 - bboxMidY;

    const placed = raw.map((p) => ({
      ...p,
      left: p.left + dx,
      top: p.top + dy,
    }));

    return { placed, slotPx: SLOT_PX };
  }, [box.w, box.h]);

  useLayoutEffect(() => {
    const { placed, slotPx } = layout;
    if (!placed.length) return;
    const bottom = Math.max(...placed.map((p) => p.top + slotPx));
    const needed = Math.max(MIN_H, Math.ceil(bottom + PAD));
    setBox((b) => (Math.abs(b.h - needed) > 0.5 ? { ...b, h: needed } : b));
  }, [layout]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-w-0 overflow-hidden"
      style={{
        minHeight: MIN_H,
        height: 'auto',
        background: '#0a0806',
      }}
    >
      <div className="relative w-full" style={{ height: box.h, minHeight: MIN_H }}>
        {layout.placed.map((ws) => {
          const built = slots[ws.id];
          return (
            <div
              key={ws.id}
              className="absolute flex items-center justify-center"
              style={{
                left: ws.left,
                top: ws.top,
                width: layout.slotPx,
                height: layout.slotPx,
              }}
            >
              {built ? (
                <Building type={built} size={layout.slotPx} onSelect={onBuildingSelect} />
              ) : (
                <BuildingSlot
                  slotId={ws.id}
                  size={layout.slotPx}
                  onBuildClick={setModalSlot}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {modalSlot !== null ? (
          <ConstructionModal slotId={modalSlot} onClose={() => setModalSlot(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
