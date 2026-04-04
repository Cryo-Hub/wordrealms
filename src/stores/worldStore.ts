import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BuildingType } from '../core/world/buildingConfig';
import { LEGACY_BUILDING_MAP } from '../core/world/buildingTypes';

export type SlotMap = Record<number, BuildingType | null>;

export type WorldState = {
  slots: SlotMap;
  buildStructure: (slotId: number, buildingType: BuildingType) => void;
};

const SLOT_COUNT = 15;

const emptySlots = (): SlotMap => {
  const m: SlotMap = {};
  for (let i = 0; i < SLOT_COUNT; i++) m[i] = null;
  return m;
};

function migrateSlots(raw: unknown): SlotMap {
  const out = emptySlots();
  if (!raw || typeof raw !== 'object') return out;
  const o = raw as Record<string, unknown>;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const v = o[i] ?? o[String(i)];
    if (v == null) continue;
    const s = String(v);
    const mapped = (LEGACY_BUILDING_MAP[s] ?? s) as BuildingType;
    if (
      mapped === 'HUT' ||
      mapped === 'WELL' ||
      mapped === 'TOWER' ||
      mapped === 'MARKET' ||
      mapped === 'CASTLE'
    ) {
      out[i] = mapped;
    }
  }
  return out;
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      slots: emptySlots(),
      buildStructure: (slotId, buildingType) =>
        set((s) => ({
          slots: { ...migrateSlots(s.slots), [slotId]: buildingType },
        })),
    }),
    {
      name: 'wordrealms-world',
      merge: (persisted, current) => {
        const p = persisted as Partial<WorldState> | undefined;
        if (!p?.slots) return current;
        return { ...current, slots: migrateSlots(p.slots) };
      },
    },
  ),
);
