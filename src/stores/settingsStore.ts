import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setLanguage as applyDictionaryLanguage } from '../core/game/dictionaryManager';
import { clearMultisetPoolCache } from '../core/game/puzzleGenerator';

/** Früher unterstützt, UI entfernt — beim Laden auf Englisch zurücksetzen. */
const REMOVED_LANGUAGE_CODES = new Set(['it', 'pt', 'nl', 'sv']);

export type SettingsState = {
  language: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  setLanguageSetting: (lang: string) => void;
  setSoundEnabled: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      soundEnabled: true,
      hapticEnabled: true,
      setLanguageSetting: (lang) => {
        const next = REMOVED_LANGUAGE_CODES.has(lang) ? 'en' : lang;
        applyDictionaryLanguage(next);
        clearMultisetPoolCache();
        set({ language: next });
      },
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHapticEnabled: (v) => set({ hapticEnabled: v }),
    }),
    {
      name: 'wordrealms-settings',
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as object) } as SettingsState;
        if (REMOVED_LANGUAGE_CODES.has(merged.language)) {
          merged.language = 'en';
        }
        return merged;
      },
    },
  ),
);
