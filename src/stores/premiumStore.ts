import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkPremiumStatus } from '../services/revenuecat/purchaseService';

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 30;

export type PremiumState = {
  isPremium: boolean;
  isLoading: boolean;
  battlePassLevel: number;
  battlePassXP: number;
  claimedRewards: string[];
  hintTokens: number;
  /** YYYY-MM-DD — letzte tägliche Auffüllung für Premium +2 Hints */
  lastHintRefillDate: string;
  checkPremium: () => Promise<void>;
  setPremium: (v: boolean) => void;
  purchasePremium: () => void;
  addBattlePassXP: (amount: number) => void;
  claimReward: (rewardId: string) => void;
  addHints: (n: number) => void;
  /** Verbraucht 1 Token wenn vorhanden */
  useHint: () => boolean;
  /** Premium: +2 Hints pro Kalendertag (einmal) */
  refillPremiumHintsIfNeeded: () => void;
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function applyXp(state: PremiumState, amount: number): Partial<PremiumState> {
  let { battlePassLevel, battlePassXP } = state;
  let xp = battlePassXP + amount;
  while (xp >= XP_PER_LEVEL && battlePassLevel < MAX_LEVEL) {
    xp -= XP_PER_LEVEL;
    battlePassLevel += 1;
  }
  if (battlePassLevel >= MAX_LEVEL) {
    battlePassLevel = MAX_LEVEL;
    xp = Math.min(xp, XP_PER_LEVEL - 1);
  }
  return { battlePassLevel, battlePassXP: xp };
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      isLoading: true,
      battlePassLevel: 1,
      battlePassXP: 0,
      claimedRewards: [],
      hintTokens: 3,
      lastHintRefillDate: '',

      setPremium: (v) => set({ isPremium: v }),

      checkPremium: async () => {
        set({ isLoading: true });
        try {
          const rc = await checkPremiumStatus();
          set((s) => ({
            isPremium: rc || s.isPremium,
            isLoading: false,
          }));
        } catch {
          set({ isLoading: false });
        }
      },

      purchasePremium: () => {
        set({ isPremium: true });
      },

      addBattlePassXP: (amount) => {
        if (amount <= 0) return;
        set((s) => applyXp(s, amount));
      },

      claimReward: (rewardId) => {
        set((s) => {
          if (s.claimedRewards.includes(rewardId)) return s;
          return { claimedRewards: [...s.claimedRewards, rewardId] };
        });
      },

      addHints: (n) => {
        if (n <= 0) return;
        set((s) => ({ hintTokens: s.hintTokens + n }));
      },

      useHint: () => {
        const s = get();
        if (s.hintTokens <= 0) return false;
        set({ hintTokens: s.hintTokens - 1 });
        return true;
      },

      refillPremiumHintsIfNeeded: () => {
        const day = todayStr();
        const s = get();
        if (!s.isPremium) return;
        if (s.lastHintRefillDate === day) return;
        set({
          lastHintRefillDate: day,
          hintTokens: s.hintTokens + 2,
        });
      },
    }),
    {
      name: 'wordrealms-premium',
      partialize: (s) => ({
        isPremium: s.isPremium,
        battlePassLevel: s.battlePassLevel,
        battlePassXP: s.battlePassXP,
        claimedRewards: s.claimedRewards,
        hintTokens: s.hintTokens,
        lastHintRefillDate: s.lastHintRefillDate,
      }),
    },
  ),
);
