import { create } from 'zustand';
import { checkPremiumStatus } from '../services/revenuecat/purchaseService';

export type PremiumState = {
  isPremium: boolean;
  isLoading: boolean;
  checkPremium: () => Promise<void>;
  setPremium: (v: boolean) => void;
};

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  isLoading: true,
  setPremium: (v) => set({ isPremium: v }),
  checkPremium: async () => {
    set({ isLoading: true });
    try {
      const v = await checkPremiumStatus();
      set({ isPremium: v, isLoading: false });
    } catch {
      set({ isPremium: false, isLoading: false });
    }
  },
}));
