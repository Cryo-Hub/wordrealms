import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ResourceState = {
  gold: number;
  wood: number;
  stone: number;
  totalGoldEarned: number;
  totalWoodEarned: number;
  totalStoneEarned: number;
  addResources: (gold: number, wood: number, stone: number) => void;
  spendResources: (gold: number, wood: number, stone: number) => boolean;
};

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      gold: 0,
      wood: 0,
      stone: 0,
      totalGoldEarned: 0,
      totalWoodEarned: 0,
      totalStoneEarned: 0,
      addResources: (gold, wood, stone) =>
        set((s) => ({
          gold: s.gold + gold,
          wood: s.wood + wood,
          stone: s.stone + stone,
          totalGoldEarned: s.totalGoldEarned + Math.max(0, gold),
          totalWoodEarned: s.totalWoodEarned + Math.max(0, wood),
          totalStoneEarned: s.totalStoneEarned + Math.max(0, stone),
        })),
      spendResources: (gold, wood, stone) => {
        const { gold: g, wood: w, stone: st } = get();
        if (g < gold || w < wood || st < stone) return false;
        set({
          gold: g - gold,
          wood: w - wood,
          stone: st - stone,
        });
        return true;
      },
    }),
    {
      name: 'wordrealms-resources',
      partialize: (s) => ({
        gold: s.gold,
        wood: s.wood,
        stone: s.stone,
        totalGoldEarned: s.totalGoldEarned,
        totalWoodEarned: s.totalWoodEarned,
        totalStoneEarned: s.totalStoneEarned,
      }),
    },
  ),
);
