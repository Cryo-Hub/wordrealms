import { create } from 'zustand';
import { calculateWordReward, rewardPointsTotal, type WordReward } from '../core/game/resourceCalculator';

export type FoundWordEntry = {
  word: string;
  points: number;
  reward: WordReward;
};

export type GameState = {
  foundWords: string[];
  /** Bonuswörter (nicht auf dem Kreuzwortgitter); wird mit `resetSession` geleert. */
  foundBonusWords: string[];
  foundEntries: FoundWordEntry[];
  sessionScore: number;
  sessionGoldEarned: number;
  sessionWoodEarned: number;
  sessionStoneEarned: number;
  isSessionActive: boolean;
  timeLeft: number;
  addFoundWord: (word: string) => void;
  /** Aufruf wenn ein gültiges Wort gefunden wurde, das nicht auf dem Gitter liegt. */
  addFoundBonusWord: (word: string) => void;
  /** Stimmt `foundBonusWords` mit `foundWords` und aktuellem Bonus-Pool ab (z. B. nach Laden). */
  syncBonusWordsFromPool: (bonusPool: readonly string[]) => void;
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
};

function sortUpperUnique(words: string[]): string[] {
  return [...new Set(words.map((w) => w.toUpperCase()))].sort((a, b) => a.localeCompare(b));
}

export const useGameStore = create<GameState>((set) => ({
  foundWords: [],
  foundBonusWords: [],
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
  addFoundBonusWord: (word) => {
    const upper = word.toUpperCase();
    set((s) => {
      if (s.foundBonusWords.some((w) => w.toUpperCase() === upper)) return s;
      return { foundBonusWords: sortUpperUnique([...s.foundBonusWords, upper]) };
    });
  },
  syncBonusWordsFromPool: (bonusPool) => {
    const pool = new Set(bonusPool.map((w) => w.toUpperCase()));
    set((s) => {
      const fromFound = s.foundWords.map((w) => w.toUpperCase()).filter((w) => pool.has(w));
      const merged = sortUpperUnique([...s.foundBonusWords, ...fromFound]);
      const prev = sortUpperUnique(s.foundBonusWords);
      if (merged.length === prev.length && merged.every((w, i) => w === prev[i])) return s;
      return { foundBonusWords: merged };
    });
  },
  startSession: () => set({ isSessionActive: true }),
  endSession: () => set({ isSessionActive: false }),
  resetSession: () =>
    set({
      foundWords: [],
      foundBonusWords: [],
      foundEntries: [],
      sessionScore: 0,
      sessionGoldEarned: 0,
      sessionWoodEarned: 0,
      sessionStoneEarned: 0,
      isSessionActive: false,
      timeLeft: 0,
    }),
}));
