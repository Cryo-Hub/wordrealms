import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / ms);
}

export type DailyState = {
  currentStreak: number;
  lastPlayedDate: string;
  todayCompleted: boolean;
  totalWordsAllTime: number;
  wordsFoundToday: number;
  wordsTodayDate: string;
  completeToday: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addWordsCount: (n: number) => void;
  bumpWordsToday: (n: number) => void;
  hydrateFromDate: () => void;
};

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastPlayedDate: '',
      todayCompleted: false,
      totalWordsAllTime: 0,
      wordsFoundToday: 0,
      wordsTodayDate: '',
      hydrateFromDate: () => {
        const today = formatLocalDate(new Date());
        const { lastPlayedDate, wordsTodayDate } = get();
        if (wordsTodayDate !== today) {
          set({ wordsFoundToday: 0, wordsTodayDate: today });
        }
        if (!lastPlayedDate) {
          set({ todayCompleted: false });
          return;
        }
        if (lastPlayedDate === today) {
          set({ todayCompleted: true });
          return;
        }
        const last = parseLocalDate(lastPlayedDate);
        const diff = daysBetween(last, new Date());
        if (diff >= 2) {
          set({ currentStreak: 0, todayCompleted: false });
        } else {
          set({ todayCompleted: false });
        }
      },
      completeToday: () => {
        const today = formatLocalDate(new Date());
        const { lastPlayedDate, currentStreak } = get();
        if (lastPlayedDate === today) {
          set({ todayCompleted: true });
          return;
        }
        let nextStreak = 1;
        if (lastPlayedDate) {
          const last = parseLocalDate(lastPlayedDate);
          const diff = daysBetween(last, new Date());
          if (diff === 1) nextStreak = currentStreak + 1;
          else nextStreak = 1;
        }
        set({
          lastPlayedDate: today,
          todayCompleted: true,
          currentStreak: nextStreak,
        });
      },
      incrementStreak: () => {
        set((s) => ({ currentStreak: s.currentStreak + 1 }));
      },
      resetStreak: () => set({ currentStreak: 0 }),
      addWordsCount: (n) =>
        set((s) => ({ totalWordsAllTime: s.totalWordsAllTime + n })),
      bumpWordsToday: (n) => {
        const today = formatLocalDate(new Date());
        set((s) => {
          const reset = s.wordsTodayDate !== today;
          return {
            wordsTodayDate: today,
            wordsFoundToday: (reset ? 0 : s.wordsFoundToday) + n,
          };
        });
      },
    }),
    { name: 'wordrealms-daily' },
  ),
);
