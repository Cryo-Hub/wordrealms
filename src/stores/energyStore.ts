import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showRewardedAd } from '../services/adService';
import { usePremiumStore } from './premiumStore';

/** Anzeige / „unbegrenzt“ ab diesem Wert (Premium). */
export const ENERGY_UNLIMITED_THRESHOLD = 900;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type EnergyState = {
  energy: number;
  maxEnergy: number;
  lastRefillDate: string;
  totalEnergyUsed: number;
  adsWatchedForEnergy: number;
  refillDailyEnergy: () => void;
  useEnergy: () => boolean;
  addEnergy: (amount: number) => void;
  watchAdForEnergy: () => Promise<boolean>;
  premiumUnlimited: () => void;
  /** Nach Premium-Ablauf: Energie auf max begrenzen */
  clampIfNotPremium: () => void;
};

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      energy: 5,
      maxEnergy: 5,
      lastRefillDate: '',
      totalEnergyUsed: 0,
      adsWatchedForEnergy: 0,

      refillDailyEnergy: () => {
        const day = todayStr();
        const s = get();
        if (s.lastRefillDate === day) return;
        set({
          energy: s.energy >= ENERGY_UNLIMITED_THRESHOLD ? s.energy : s.maxEnergy,
          lastRefillDate: day,
          adsWatchedForEnergy: 0,
        });
      },

      useEnergy: () => {
        const s = get();
        if (s.energy >= ENERGY_UNLIMITED_THRESHOLD) return true;
        if (s.energy <= 0) return false;
        set({
          energy: s.energy - 1,
          totalEnergyUsed: s.totalEnergyUsed + 1,
        });
        return true;
      },

      addEnergy: (amount) => {
        if (amount <= 0) return;
        set((s) => {
          if (s.energy >= ENERGY_UNLIMITED_THRESHOLD) return s;
          const cap = s.maxEnergy + 5;
          return { energy: Math.min(s.energy + amount, cap) };
        });
      },

      watchAdForEnergy: async () => {
        if (usePremiumStore.getState().isPremium) return false;
        const s = get();
        if (s.adsWatchedForEnergy >= 3) return false;
        const ok = await showRewardedAd({ kind: 'energy' });
        if (ok) {
          get().addEnergy(1);
          set((st) => ({ adsWatchedForEnergy: st.adsWatchedForEnergy + 1 }));
        }
        return ok;
      },

      premiumUnlimited: () => {
        if (!usePremiumStore.getState().isPremium) return;
        set({ energy: 999 });
      },

      clampIfNotPremium: () => {
        if (usePremiumStore.getState().isPremium) return;
        set((s) => (s.energy > s.maxEnergy ? { energy: s.maxEnergy } : s));
      },
    }),
    {
      name: 'wordrealms-energy',
      partialize: (s) => ({
        energy: s.energy,
        maxEnergy: s.maxEnergy,
        lastRefillDate: s.lastRefillDate,
        totalEnergyUsed: s.totalEnergyUsed,
        adsWatchedForEnergy: s.adsWatchedForEnergy,
      }),
    },
  ),
);
