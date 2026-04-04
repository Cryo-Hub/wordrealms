import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyWeeklyEloDecay,
  getLeague,
  type League,
} from '../core/game/leagueSystem';

function sundayWeekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = x.getDate() - day;
  const sun = new Date(x.setDate(diff));
  const y = sun.getFullYear();
  const m = String(sun.getMonth() + 1).padStart(2, '0');
  const dd = String(sun.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export type LeagueState = {
  elo: number;
  /** Letzte Kalenderwoche (Sonntags-Key), für die ein Weekly-Decay angewendet wurde */
  lastWeeklyDecayWeek: string;
  /** Verhindert doppelte Liga-Punkte am selben Puzzle-Tag */
  lastEloForPuzzleDate: string;
  addElo: (delta: number) => void;
  /** Tagesgebundene ELO-Änderung (Daily einmal pro Puzzle-Datum) */
  addEloForDailyPuzzle: (puzzleDate: string, delta: number) => void;
  /** @returns true wenn ein Weekly-Decay angewendet wurde */
  resetWeeklyIfNeeded: () => boolean;
  /** Manueller Weekly-Reset (z. B. Liga-Saison) */
  resetWeekly: () => void;
  getLeague: () => League;
};

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set, get) => ({
      elo: 0,
      lastWeeklyDecayWeek: '',
      lastEloForPuzzleDate: '',

      getLeague: () => getLeague(get().elo),

      addElo: (delta) =>
        set((s) => {
          const next = Math.max(0, s.elo + delta);
          return { elo: next };
        }),

      addEloForDailyPuzzle: (puzzleDate, delta) => {
        set((s) => {
          if (s.lastEloForPuzzleDate === puzzleDate) return s;
          return {
            elo: Math.max(0, s.elo + delta),
            lastEloForPuzzleDate: puzzleDate,
          };
        });
      },

      resetWeeklyIfNeeded: () => {
        const week = sundayWeekKey(new Date());
        const { lastWeeklyDecayWeek, elo } = get();
        if (lastWeeklyDecayWeek === week) return false;
        if (lastWeeklyDecayWeek === '') {
          set({ lastWeeklyDecayWeek: week });
          return false;
        }
        const newElo = applyWeeklyEloDecay(elo);
        set({ elo: newElo, lastWeeklyDecayWeek: week });
        return true;
      },

      resetWeekly: () => {
        set((s) => ({
          elo: applyWeeklyEloDecay(s.elo),
          lastWeeklyDecayWeek: sundayWeekKey(new Date()),
        }));
      },
    }),
    {
      name: 'wordrealms-league',
      partialize: (s) => ({
        elo: s.elo,
        lastWeeklyDecayWeek: s.lastWeeklyDecayWeek,
        lastEloForPuzzleDate: s.lastEloForPuzzleDate,
      }),
    },
  ),
);
