import type { PuzzleConfig } from './puzzleGenerator';
import type { SupportedLanguage } from './dictionaryManager';
import { SUPPORTED_LANGUAGES } from './dictionaryManager';
import { WHEEL_LETTER_COUNT } from './wheelEngine';

/** Mulberry32 — schnell, deterministisch */
export function seededRandom(seed: number) {
  let s = seed + 0x6d2b79f5;
  return function () {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

const vowels = ['A', 'E', 'I', 'O', 'U'];
const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W'];

const HINTS = [
  'Think about nature',
  'Think about movement',
  'Think about strength',
  'Think about light',
  'Think about time',
  'Think about space',
  'Think about water',
  'Think about fire',
  'Think about earth',
  'Think about sky',
  'Think about animals',
  'Think about food',
  'Think about adventure',
  'Think about wisdom',
  'Think about power',
];

const THEMES = [
  'nature',
  'adventure',
  'battle',
  'magic',
  'elements',
  'animals',
  'food',
  'science',
  'history',
  'mythology',
];

const wordLists: Partial<Record<SupportedLanguage, string[]>> = {};
const loadingPromises: Partial<Record<SupportedLanguage, Promise<void>>> = {};

async function loadDictionaryWords(lang: SupportedLanguage): Promise<readonly string[]> {
  switch (lang) {
    case 'de':
      return (await import('./dictionaries/de')).WORDS;
    case 'fr':
      return (await import('./dictionaries/fr')).WORDS;
    case 'es':
      return (await import('./dictionaries/es')).WORDS;
    case 'pl':
      return (await import('./dictionaries/pl')).WORDS;
    case 'tr':
      return (await import('./dictionaries/tr')).WORDS;
    default:
      return [];
  }
}

function normalizeWord(w: string): string {
  return w
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase();
}

function isAsciiLetters(w: string): boolean {
  return /^[A-Z]+$/.test(w);
}

async function loadWordListForLang(lang: SupportedLanguage): Promise<string[]> {
  if (wordLists[lang] && wordLists[lang]!.length >= 100) return wordLists[lang]!;

  if (lang === 'en') {
    const mod = await import('an-array-of-english-words');
    const arr = mod.default as readonly string[];
    wordLists.en = arr
      .filter((w) => w.length >= 3 && w.length <= 15 && /^[a-z]+$/.test(w))
      .map((w) => w.toUpperCase());
    return wordLists.en!;
  }

  const words = await loadDictionaryWords(lang);
  const out: string[] = [];
  for (const raw of words) {
    const u = normalizeWord(String(raw));
    if (u.length < 3 || u.length > 15) continue;
    if (!isAsciiLetters(u)) continue;
    out.push(u);
  }
  wordLists[lang] = out;
  return out;
}

/** Lädt Wortlisten lazy (nicht beim Modul-Import). Bei zu wenig Wörtern → EN-Fallback. */
export async function preloadProceduralWordList(lang: string): Promise<void> {
  const l = (SUPPORTED_LANGUAGES as readonly string[]).includes(lang) ? (lang as SupportedLanguage) : 'en';
  if (wordLists[l] && wordLists[l]!.length >= 400) return;

  if (loadingPromises[l]) {
    await loadingPromises[l];
    return;
  }
  loadingPromises[l] = (async () => {
    await loadWordListForLang(l);
    if ((wordLists[l]?.length ?? 0) < 400 && l !== 'en') {
      await loadWordListForLang('en');
      wordLists[l] = wordLists.en!;
    }
  })();
  await loadingPromises[l];
  delete loadingPromises[l];
}

function getWordList(lang: SupportedLanguage): string[] {
  const list = wordLists[lang] ?? wordLists.en;
  if (!list || list.length === 0) {
    throw new Error(`Procedural words not loaded for ${lang} — call preloadProceduralWordList first`);
  }
  return list;
}

function findWordsFromLetters(letters: string[], dictionary: string[]): string[] {
  const available: Record<string, number> = {};
  for (const l of letters) {
    available[l] = (available[l] ?? 0) + 1;
  }
  return dictionary.filter((word) => {
    const up = word.toUpperCase();
    const needed: Record<string, number> = {};
    for (let i = 0; i < up.length; i++) {
      const ch = up[i]!;
      needed[ch] = (needed[ch] ?? 0) + 1;
      if ((needed[ch] ?? 0) > (available[ch] ?? 0)) return false;
    }
    return true;
  });
}

function getHintForSeed(seed: number): string {
  return HINTS[((seed % HINTS.length) + HINTS.length) % HINTS.length]!;
}

function getThemeForSeed(seed: number): string {
  return THEMES[((seed % THEMES.length) + THEMES.length) % THEMES.length]!;
}

function lettersWithCenterFirst(center: string, pool: string[]): string[] {
  const rest = pool.filter((c) => c !== center);
  const rng = seededRandom(pool.join('').split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  return [center, ...rest];
}

function fallbackLevel(seed: number): PuzzleConfig {
  const letters = lettersWithCenterFirst('A', ['S', 'T', 'A', 'R', 'E', 'N', 'D', 'L', 'G']);
  const validWords = ['STAR', 'RATE', 'TEAR', 'NEAR', 'EAST', 'DARE', 'SAND', 'READ', 'DEAN', 'EARN'];
  const grid_words = validWords.slice(0, 8);
  const bonusWords = validWords.slice(8);
  return {
    letters,
    center: 'A',
    validWords: [...grid_words, ...bonusWords],
    grid_words,
    bonusWords,
    hint: getHintForSeed(seed),
    theme: getThemeForSeed(seed),
    date: `free-${seed}`,
  };
}

/**
 * Deterministisches Level. Vorher `preloadProceduralWordList(lang)` aufrufen.
 */
export function generateLevel(seed: number, lang: string = 'en'): PuzzleConfig {
  const L = (SUPPORTED_LANGUAGES as readonly string[]).includes(lang) ? (lang as SupportedLanguage) : 'en';
  const dict = getWordList(L);

  const rng = seededRandom(seed);

  let attempts = 0;
  while (attempts < 1000) {
    attempts++;

    const numVowels = rng() < 0.5 ? 2 : 3;
    const letterList: string[] = [];
    const usedVowels = new Set<string>();
    const usedConsonants = new Set<string>();

    while (letterList.filter((l) => vowels.includes(l)).length < numVowels) {
      const v = vowels[Math.floor(rng() * vowels.length)]!;
      if (!usedVowels.has(v)) {
        usedVowels.add(v);
        letterList.push(v);
      }
    }
    while (letterList.length < WHEEL_LETTER_COUNT) {
      const c = consonants[Math.floor(rng() * consonants.length)]!;
      if (!usedConsonants.has(c)) {
        usedConsonants.add(c);
        letterList.push(c);
      }
    }

    const validWords = findWordsFromLetters(letterList, dict);
    if (validWords.length < 12) continue;

    const letterFreq: Record<string, number> = {};
    for (const w of validWords) {
      const seen = new Set<string>();
      for (let i = 0; i < w.length; i++) {
        const ch = w[i]!;
        if (!seen.has(ch)) {
          seen.add(ch);
          letterFreq[ch] = (letterFreq[ch] ?? 0) + 1;
        }
      }
    }

    const vowelsInLetters = letterList.filter((l) => vowels.includes(l));
    const center =
      [...vowelsInLetters].sort((a, b) => (letterFreq[b] ?? 0) - (letterFreq[a] ?? 0))[0] ?? letterList[0]!;

    const centerWords = validWords.filter((w) => w.includes(center));
    if (centerWords.length < 8) continue;

    const sorted = [...centerWords].sort((a, b) => b.length - a.length);
    const gridCount = Math.min(12, Math.max(6, Math.floor(sorted.length * 0.7)));
    const gridWords = sorted.slice(0, gridCount);
    const bonusWords = sorted.slice(gridCount, gridCount + 6);

    if (gridWords.length < 6) continue;

    const displayLetters = lettersWithCenterFirst(center, letterList);

    return {
      letters: displayLetters,
      center,
      validWords: [...gridWords, ...bonusWords],
      grid_words: gridWords,
      bonusWords,
      hint: getHintForSeed(seed),
      theme: getThemeForSeed(seed),
      date: `free-${seed}`,
    };
  }

  return fallbackLevel(seed);
}

export async function generateLevels(startSeed: number, count: number, lang: string = 'en'): Promise<PuzzleConfig[]> {
  await preloadProceduralWordList(lang);
  const levels: PuzzleConfig[] = [];
  let seed = startSeed;
  while (levels.length < count) {
    levels.push(generateLevel(seed, lang));
    seed++;
  }
  return levels;
}
