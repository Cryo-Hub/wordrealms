export const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'pl', 'tr'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupported = (lang: string): lang is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);

export const LANGUAGE_CHANGE_EVENT = 'wordrealms-language-changed';

let currentLanguage: SupportedLanguage = 'en';
let activeWordSet: Set<string> | null = null;
let loadedForLanguage: SupportedLanguage | null = null;

async function loadDictionaryImpl(lang: SupportedLanguage): Promise<Set<string>> {
  switch (lang) {
    case 'en': {
      const mod = await import(
        /* webpackChunkName: "dict-en" */ 'an-array-of-english-words'
      );
      const arr = mod.default as readonly string[];
      return new Set(
        arr.filter((w) => w.length >= 3).map((w) => w.toLowerCase()),
      );
    }
    case 'de': {
      const m = await import('./dictionaries/de');
      return new Set(m.WORDS.map((w) => w.toLowerCase()));
    }
    case 'fr': {
      const m = await import('./dictionaries/fr');
      return new Set(m.WORDS.map((w) => w.toLowerCase()));
    }
    case 'es': {
      const m = await import('./dictionaries/es');
      return new Set(m.WORDS.map((w) => w.toLowerCase()));
    }
    case 'pl': {
      const m = await import('./dictionaries/pl');
      return new Set(m.WORDS.map((w) => w.toLowerCase()));
    }
    case 'tr': {
      const m = await import('./dictionaries/tr');
      return new Set(m.WORDS.map((w) => w.toLowerCase()));
    }
    default:
      return loadDictionaryImpl('en');
  }
}

export function loadDictionary(lang: string): Promise<Set<string>> {
  const l = isSupported(lang) ? lang : 'en';
  return loadDictionaryImpl(l);
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

/** Session-Cache für Online-Wörterbuch-Abfragen (nicht-EN). */
const validatedCache = new Map<string, boolean>();

const API_LANG_CODE: Record<SupportedLanguage, string> = {
  en: 'en',
  de: 'de',
  fr: 'fr',
  es: 'es',
  pl: 'pl',
  tr: 'tr',
};

export function setLanguage(lang: string): void {
  if (!isSupported(lang)) return;
  if (currentLanguage !== lang) {
    currentLanguage = lang as SupportedLanguage;
    activeWordSet = null;
    loadedForLanguage = null;
    validatedCache.clear();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
    }
  }
}

export async function ensureDictionaryLoaded(): Promise<void> {
  const lang = currentLanguage;
  if (activeWordSet && loadedForLanguage === lang) return;
  const set = await loadDictionaryImpl(lang);
  activeWordSet = set;
  loadedForLanguage = lang;
}

export function isValidWord(word: string): boolean {
  const w = word.trim().toLowerCase();
  if (w.length < 3) return false;
  if (!activeWordSet || loadedForLanguage !== currentLanguage) {
    void ensureDictionaryLoaded();
    return false;
  }
  return activeWordSet.has(w);
}

function abortSignalAfterMs(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

/**
 * Online-Validierung über Free Dictionary API (nicht-EN).
 * Englisch: lokales Set (nach ensureDictionaryLoaded).
 * Ergebnisse werden pro Session gecacht.
 */
export async function validateWordOnline(word: string, lang: string): Promise<boolean> {
  const w = word.trim().toLowerCase();
  if (w.length < 3) return false;

  if (lang === 'en') {
    await ensureDictionaryLoaded();
    return activeWordSet?.has(w) ?? false;
  }
  if (!isSupported(lang)) return false;

  const langCode = API_LANG_CODE[lang as SupportedLanguage];
  const cacheKey = `${langCode}:${w}`;
  const hit = validatedCache.get(cacheKey);
  if (hit !== undefined) return hit;

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${encodeURIComponent(w)}`,
      { signal: abortSignalAfterMs(3000) },
    );
    const ok = res.ok;
    validatedCache.set(cacheKey, ok);
    return ok;
  } catch {
    validatedCache.set(cacheKey, false);
    return false;
  }
}

/** Nur nach `ensureDictionaryLoaded()` sinnvoll. */
export function getLoadedWordSet(): Set<string> | null {
  return activeWordSet;
}

export function __setActiveDictionaryForTests(set: Set<string>, lang: SupportedLanguage): void {
  activeWordSet = set;
  loadedForLanguage = lang;
  currentLanguage = lang;
}
