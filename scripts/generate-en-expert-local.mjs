import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load and filter the word list to 3-7 letter lowercase words
const rawWords = require('an-array-of-english-words');
const WORDS = rawWords.filter(w => w.length >= 3 && w.length <= 7 && /^[a-z]+$/.test(w));
console.log(`Dictionary: ${WORDS.length} words (3-7 letters)`);

// Build a sorted-letters → words index for fast lookup
const byLetterKey = new Map();
for (const word of WORDS) {
  const key = word.split('').sort().join('');
  if (!byLetterKey.has(key)) byLetterKey.set(key, []);
  byLetterKey.get(key).push(word);
}

// All subsets of `letters` of length 3-7, as sorted strings
function* subsets(letters) {
  const n = letters.length;
  for (let size = 3; size <= Math.min(7, n); size++) {
    yield* combos(letters, size);
  }
}

function* combos(arr, k, start = 0, current = []) {
  if (current.length === k) {
    yield current.slice().sort().join('');
    return;
  }
  for (let i = start; i < arr.length; i++) {
    current.push(arr[i]);
    yield* combos(arr, k, i + 1, current);
    current.pop();
  }
}

// Find all valid words for a given 7-letter set
function findWords(letters) {
  const found = new Set();
  for (const key of subsets(letters)) {
    const ws = byLetterKey.get(key);
    if (ws) for (const w of ws) found.add(w);
  }
  return [...found];
}

const VOWELS = new Set('aeiou');
const CONSONANTS = new Set('bcdfghjklmnpqrstvwxyz');

// Common-ish letters only — avoids impossible combos like JQXZKVWF
const COMMON_CONSONANTS = 'bcdfglmnprst'.split('');
const COMMON_VOWELS = 'aeiou'.split('');
const LESS_COMMON = 'hjkvwxy'.split('');

function pickLetters(rng) {
  const letters = new Set();
  // 2-3 vowels
  const vowelCount = 2 + (rng() < 0.4 ? 1 : 0);
  while (letters.size < vowelCount) {
    letters.add(COMMON_VOWELS[Math.floor(rng() * COMMON_VOWELS.length)]);
  }
  // Fill to 7 with consonants (mostly common, occasional rare)
  const pool = [...COMMON_CONSONANTS, ...COMMON_CONSONANTS, ...LESS_COMMON];
  let tries = 0;
  while (letters.size < 7 && tries < 50) {
    letters.add(pool[Math.floor(rng() * pool.length)]);
    tries++;
  }
  return [...letters];
}

// Pick center letter: the one that appears in the most found words
function pickCenter(letters, words) {
  const counts = {};
  for (const l of letters) counts[l] = 0;
  for (const w of words) {
    for (const l of new Set(w.split(''))) {
      if (counts[l] !== undefined) counts[l]++;
    }
  }
  return letters.reduce((best, l) => counts[l] > counts[best] ? l : best, letters[0]);
}

// Simple seeded PRNG (xorshift32)
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) / 4294967296);
  };
}

// Theme/hint pairs to vary the metadata
const THEMES = [
  { theme: 'nature', hint: 'Think of the natural world' },
  { theme: 'motion', hint: 'Think of movement and action' },
  { theme: 'mind', hint: 'Think of thought and perception' },
  { theme: 'craft', hint: 'Think of making and building' },
  { theme: 'sound', hint: 'Think of noise and music' },
  { theme: 'light', hint: 'Think of brightness and shadow' },
  { theme: 'space', hint: 'Think of place and position' },
  { theme: 'time', hint: 'Think of moments and duration' },
  { theme: 'form', hint: 'Think of shapes and structure' },
  { theme: 'life', hint: 'Think of living and growing' },
];

function generateLevel(id, rng) {
  const MAX_TRIES = 200;
  for (let t = 0; t < MAX_TRIES; t++) {
    const letters = pickLetters(rng);
    const allWords = findWords(letters);

    // Need a healthy pool to work with
    if (allWords.length < 15) continue;

    const center = pickCenter(letters, allWords);
    const centered = allWords.filter(w => w.includes(center));

    // Need enough words containing the center letter
    if (centered.length < 10) continue;

    // Sort: longer words first (better for grid)
    centered.sort((a, b) => b.length - a.length || a.localeCompare(b));

    // Split into grid words (aim for 8-12) and bonus
    // Prefer words 4+ letters for grid, shorter for bonus
    const longWords = centered.filter(w => w.length >= 4);
    const shortWords = centered.filter(w => w.length === 3);

    if (longWords.length < 6) continue;

    // Pick grid words: up to 12, prefer longer
    const gridCandidates = longWords.slice(0, 20);
    const gridWords = gridCandidates.slice(0, Math.min(12, gridCandidates.length));

    if (gridWords.length < 8) continue;

    // Need at least 5 words of 5+ letters
    const fivePlus = gridWords.filter(w => w.length >= 5);
    if (fivePlus.length < 5) continue;

    // Need at least 2 words of 6-7 letters
    const sixPlus = gridWords.filter(w => w.length >= 6);
    if (sixPlus.length < 2) continue;

    // Bonus words: some long remaining + short words
    const bonusCandidates = [
      ...longWords.slice(gridWords.length, gridWords.length + 4),
      ...shortWords.slice(0, 3),
    ];
    const bonusWords = bonusCandidates.slice(0, Math.min(6, Math.max(3, bonusCandidates.length)));

    if (bonusWords.length < 3) continue;

    const meta = THEMES[Math.floor(rng() * THEMES.length)];

    // Build intersection_letters: letters appearing in 3+ grid words
    const letterFreq = {};
    for (const w of gridWords) {
      for (const ch of new Set(w.split(''))) {
        letterFreq[ch] = (letterFreq[ch] || 0) + 1;
      }
    }
    const intersection = Object.entries(letterFreq)
      .filter(([, c]) => c >= 3)
      .map(([ch]) => ch.toUpperCase());

    return {
      id,
      level: id,
      difficulty: 'expert',
      letters: letters.map(l => l.toUpperCase()),
      center: center.toUpperCase(),
      grid_words: gridWords.map(w => ({ word: w.toUpperCase(), length: w.length })),
      bonus_words: bonusWords.map(w => ({ word: w.toUpperCase(), length: w.length })),
      intersection_letters: intersection,
      hint: meta.hint,
      theme: meta.theme,
    };
  }
  return null; // couldn't generate a valid level with this seed
}

async function main() {
  const filePath = path.join(__dirname, '../src/data/puzzles-en-401-500.json');
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`Existing strong levels: ${existing.length}`);
  const needed = 100 - existing.length;
  console.log(`Need to generate: ${needed} new levels\n`);

  if (needed <= 0) {
    console.log('Already at 100 levels — nothing to do!');
    return;
  }

  const generated = [];
  let seed = 0xdeadbeef;
  let attempts = 0;
  const MAX_SEED_TRIES = 5000;

  while (generated.length < needed && attempts < MAX_SEED_TRIES) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    attempts++;
    const rng = makeRng(seed);
    const level = generateLevel(0 /* id assigned later */, rng);
    if (level) {
      generated.push(level);
      if (generated.length % 10 === 0) {
        process.stdout.write(`  ${generated.length}/${needed} levels generated (${attempts} attempts)\n`);
      }
    }
  }

  console.log(`\nGenerated ${generated.length} levels in ${attempts} seed attempts.`);

  // Combine existing + new, renumber 401-500
  let idCounter = 401;
  const combined = [...existing, ...generated.slice(0, needed)].map(lvl => ({
    ...lvl,
    id: idCounter,
    level: idCounter++,
    difficulty: 'expert',
  }));

  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));
  console.log(`\n✅ puzzles-en-401-500.json now has ${combined.length} levels`);

  // Sanity checks
  const weak = combined.filter(l => l.grid_words.length < 3);
  const noCenter = combined.filter(l =>
    l.grid_words.some(w => !w.word.includes(l.center))
  );
  console.log(`✅ Weak levels (< 3 grid_words): ${weak.length}`);
  console.log(`✅ Words missing center letter: ${noCenter.length}`);
  console.log(`   Avg grid_words per level: ${(combined.reduce((s,l)=>s+l.grid_words.length,0)/combined.length).toFixed(1)}`);
  console.log(`   Avg 6+ letter words per level: ${(combined.reduce((s,l)=>s+l.grid_words.filter(w=>w.length>=6).length,0)/combined.length).toFixed(1)}`);
}

main().catch(console.error);
