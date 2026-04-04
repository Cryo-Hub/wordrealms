import { create } from 'zustand';
import { calculateWordReward, rewardPointsTotal, type WordReward } from '../core/game/resourceCalculator';

export type FoundWordEntry = {
  word: string;
  points: number;
  reward: WordReward;
};

export type GameState = {
  foundWords: string[];
  foundEntries: FoundWordEntry[];
  sessionScore: number;
  sessionGoldEarned: number;
  sessionWoodEarned: number;
  sessionStoneEarned: number;
  isSessionActive: boolean;
  timeLeft: number;
  addFoundWord: (word: string) => void;
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  foundWords: [],
  foundEntries: [],
  sessionScore: 0,
  sessionGoldEarned: 0,
  sessionWoodEarned: 0,
  sessionStoneEarned: 0,
  isSessionActive: false,
  timeLeft: 0,
  addFoundWord: (word) => {
    const upper = word.toUpperCase();
    const reward = calculateWordReward(upper.length);
    const points = rewardPointsTotal(reward);
    set((s) => ({
      foundWords: [...s.foundWords, upper],
      foundEntries: [
        { word: upper, points, reward },
        ...s.foundEntries,
      ],
      sessionScore: s.sessionScore + points,
      sessionGoldEarned: s.sessionGoldEarned + reward.gold,
      sessionWoodEarned: s.sessionWoodEarned + reward.wood,
      sessionStoneEarned: s.sessionStoneEarned + reward.stone,
    }));
  },
  startSession: () => set({ isSessionActive: true }),
  endSession: () => set({ isSessionActive: false }),
  resetSession: () =>
    set({
      foundWords: [],
      foundEntries: [],
      sessionScore: 0,
      sessionGoldEarned: 0,
      sessionWoodEarned: 0,
      sessionStoneEarned: 0,
      isSessionActive: false,
      timeLeft: 0,
    }),
}));
