import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { de } from './translations/de';
import { en } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { pl } from './translations/pl';
import { tr } from './translations/tr';

export type UiLang = 'en' | 'de' | 'fr' | 'es' | 'pl' | 'tr';

const BUNDLES: Record<UiLang, Record<string, string>> = {
  en,
  de,
  fr,
  es,
  pl,
  tr,
};

const UI_LANGS = new Set<string>(['en', 'de', 'fr', 'es', 'pl', 'tr']);

function normalizeLang(code: string): UiLang {
  return UI_LANGS.has(code) ? (code as UiLang) : 'en';
}

function applyVars(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

/** Übersetzung für beliebige Sprachcodes (nicht-UI → Englisch). */
export function translate(
  key: string,
  lang: string,
  vars?: Record<string, string | number>,
): string {
  const L = normalizeLang(lang);
  const raw = BUNDLES[L][key] ?? BUNDLES.en[key] ?? key;
  return applyVars(raw, vars);
}

/**
 * Außerhalb von React: aktuelle Sprache aus dem Store.
 * In Komponenten besser `useTranslation().t` nutzen (re-rendert bei Wechsel).
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const lang = useSettingsStore.getState().language;
  return translate(key, lang, vars);
}

export function useTranslation(): {
  t: (key: string, vars?: Record<string, string | number>) => string;
  language: string;
} {
  const language = useSettingsStore((s) => s.language);
  const fn = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, language, vars),
    [language],
  );
  return { t: fn, language };
}
