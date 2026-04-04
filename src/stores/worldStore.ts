import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BuildingType } from '../core/world/buildingConfig';

export type SlotMap = Record<number, BuildingType | null>;

export type WorldState = {
  slots: SlotMap;
  buildStructure: (slotId: number, buildingType: BuildingType) => void;
};

const emptySlots = (): SlotMap => {
  const m: SlotMap = {};
  for (let i = 0; i < 10; i++) m[i] = null;
  return m;
};

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      slots: emptySlots(),
      buildStructure: (slotId, buildingType) =>
        set((s) => ({
          slots: { ...s.slots, [slotId]: buildingType },
        })),
    }),
    { name: 'wordrealms-world' },
  ),
);
