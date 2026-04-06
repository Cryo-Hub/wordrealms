import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();
const DATA_DIR = path.join(__dirname, '../src/data');
const WORDLIST_DIR = path.join(__dirname, 'wordlists');
const PROGRESS_FILE = path.join(__dirname, 'overnight-progress.json');
const LOG_FILE = path.join(__dirname, '../OVERNIGHT_LOG.txt');

function log(msg) {
  const line = new Date().toISOString() + ' ' + msg;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Load progress
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Seeded random
function seededRandom(seed) {
  let s = seed + 0x6D2B79F5;
  return function() {
    s = Math.imul(s ^ s >>> 15, s | 1);
    s ^= s + Math.imul(s ^ s >>> 7, s | 61);
    return ((s ^ s >>> 14) >>> 0) / 4294967296;
  };
}

// Validate word against letter set
function isValidWord(word, letters) {
  const available = {};
  for (const l of letters) {
    available[l] = (available[l] || 0) + 1;
  }
  for (const ch of word) {
    available[ch] = (available[ch] || 0) - 1;
    if (available[ch] < 0) return false;
  }
  return true;
}

// Build crossword grid
function buildCrossword(words) {
  const SIZE = 15;
  const grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  const placed = [];
  const sorted = [...words].sort((a, b) => b.length - a.length);

  // Place first word in center
  const first = sorted[0];
  const r0 = 7;
  const c0 = Math.floor((SIZE - first.length) / 2);
  for (let i = 0; i < first.length; i++) grid[r0][c0 + i] = first[i];
  placed.push({ word: first, row: r0, col: c0, direction: 'across',
    revealed: Array(first.length).fill(false) });

  for (const word of sorted.slice(1)) {
    let best = null;
    let bestScore = -1;
    for (const pw of placed) {
      for (let wi = 0; wi < word.length; wi++) {
        for (let pi = 0; pi < pw.word.length; pi++) {
          if (word[wi] !== pw.word[pi]) continue;
          const isAcross = pw.direction === 'across';
          const newDir = isAcross ? 'down' : 'across';
          const row = isAcross ? pw.row - wi : pw.row + pi;
          const col = isAcross ? pw.col + pi : pw.col - wi;
          if (row < 0 || col < 0) continue;
          if (newDir === 'across' && col + word.length > SIZE) continue;
          if (newDir === 'down' && row + word.length > SIZE) continue;
          let valid = true;
          let score = 0;
          for (let k = 0; k < word.length; k++) {
            const r = newDir === 'across' ? row : row + k;
            const c = newDir === 'across' ? col + k : col;
            if (grid[r][c] !== null && grid[r][c] !== word[k]) { valid = false; break; }
            if (grid[r][c] === word[k]) score++;
          }
          if (valid) {
            if (score > bestScore) { bestScore = score; best = { row, col, dir: newDir }; }
          }
        }
      }
    }
    if (best && bestScore >= 1) {
      const { row, col, dir } = best;
      for (let k = 0; k < word.length; k++) {
        const r = dir === 'across' ? row : row + k;
        const c = dir === 'across' ? col + k : col;
        grid[r][c] = word[k];
      }
      placed.push({ word, row, col, direction: dir,
        revealed: Array(word.length).fill(false) });
    }
  }
  return placed;
}

// Count intersections
function countIntersections(placed) {
  let count = 0;
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      if (a.direction === b.direction) continue;
      const across = a.direction === 'across' ? a : b;
      const down = a.direction === 'down' ? a : b;
      if (down.col >= across.col && down.col < across.col + across.word.length &&
          across.row >= down.row && across.row < down.row + down.word.length) {
        count++;
      }
    }
  }
  return count;
}

// Generate one level
function generateLevel(seed, wordList, difficulty, levelId) {
  const rng = seededRandom(seed);
  const vowels = ['A','E','I','O','U'];
  const allChars = wordList.join('').split('');
  const consonantFreq = {};
  for (const c of allChars) {
    if (!vowels.includes(c)) consonantFreq[c] = (consonantFreq[c]||0) + 1;
  }
  const topConsonants = Object.entries(consonantFreq)
    .sort((a,b) => b[1]-a[1]).slice(0,18).map(e => e[0]);

  for (let attempt = 0; attempt < 80; attempt++) {
    const letters = [];
    const used = new Set();
    const numVowels = difficulty === 'beginner' ? 3 : 2;

    while (letters.filter(l => vowels.includes(l)).length < numVowels) {
      const v = vowels[Math.floor(rng() * vowels.length)];
      if (!used.has(v)) { used.add(v); letters.push(v); }
    }
    while (letters.length < 7) {
      const c = topConsonants[Math.floor(rng() * topConsonants.length)];
      if (c && !used.has(c)) { used.add(c); letters.push(c); }
    }
    if (letters.length !== 7) continue;

    const validWords = wordList.filter(w => isValidWord(w, letters));
    if (validWords.length < 10) continue;

    const vowelScore = {};
    for (const v of vowels.filter(v => letters.includes(v))) {
      vowelScore[v] = validWords.filter(w => w.includes(v)).length;
    }
    const center = Object.entries(vowelScore).sort((a,b) => b[1]-a[1])[0]?.[0];
    if (!center) continue;

    const centerWords = validWords.filter(w => w.includes(center));
    if (centerWords.length < 8) continue;

    const sorted = [...centerWords].sort((a,b) => b.length - a.length);
    const minLen = difficulty === 'expert' ? 4 : 3;
    const gridCandidates = sorted.filter(w => w.length >= minLen);
    if (gridCandidates.length < 6) continue;

    const gridWords = gridCandidates.slice(0, Math.min(12, gridCandidates.length));
    if (gridWords.filter(w => w.length >= 5).length < 3) continue;

    const placed = buildCrossword(gridWords);
    if (placed.length < 4) continue;

    const intersections = countIntersections(placed);
    if (intersections < 2) continue;

    const placedSet = new Set(placed.map(p => p.word));
    const bonusWords = centerWords.filter(w => !placedSet.has(w)).slice(0, 8);

    // Shuffle letters (center first)
    const others = letters.filter(l => l !== center);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    const difficultyLabel =
      levelId <= 200 ? 'beginner' :
      levelId <= 500 ? 'intermediate' :
      levelId <= 750 ? 'advanced' : 'expert';

    return {
      id: levelId, level: levelId,
      difficulty: difficultyLabel,
      letters: [center, ...others],
      center,
      grid_words: placed.map(p => ({ word: p.word, length: p.word.length })),
      bonus_words: bonusWords.map(w => ({ word: w, length: w.length })),
      grid_word_count: placed.length,
      bonus_word_count: bonusWords.length,
      total_words: placed.length + bonusWords.length,
      crossword_grid: { placedWords: placed, gridSize: 15 },
      intersection_count: intersections,
      intersection_letters: [],
      hint: '',
      theme: 'adventure',
    };
  }
  return null;
}

// Add hints via API (batches of 20)
const HINTS = {
  en: w => `Think about ${w}`,
  de: w => `Denke an ${w}`,
  fr: w => `Pensez à ${w}`,
  es: w => `Piensa en ${w}`,
  pl: w => `Pomyśl o ${w}`,
  tr: w => `Düşün: ${w}`,
};
const THEMES = ['nature','adventure','food','animals',
  'science','history','fantasy','travel','sports','home'];

async function addHintsViaAPI(levels, lang) {
  try {
    const prompt = `For each puzzle level below, add a short hint in ${lang} (4-6 words, describes topic without revealing words) and a theme (one of: nature/adventure/food/animals/science/history/fantasy/travel/sports/home).
Also remove any proper nouns or offensive words from grid_words and bonus_words.
Return ONLY the JSON array with hint and theme added. No explanation.

${JSON.stringify(levels.map(l => ({
  id: l.id,
  grid_words: l.grid_words.map(w => w.word),
  bonus_words: l.bonus_words.map(w => w.word),
})))}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');
    const enhanced = JSON.parse(match[0]);

    for (const e of enhanced) {
      const lvl = levels.find(l => l.id === e.id);
      if (!lvl) continue;
      lvl.hint = e.hint || HINTS[lang]('words and patterns');
      lvl.theme = THEMES.includes(e.theme) ? e.theme : 'adventure';
      // Apply word cleaning if API returned cleaned arrays
      if (e.grid_words?.length >= 4) {
        const cleanSet = new Set(e.grid_words);
        lvl.grid_words = lvl.grid_words.filter(w => cleanSet.has(w.word));
        lvl.crossword_grid.placedWords =
          lvl.crossword_grid.placedWords.filter(p => cleanSet.has(p.word));
        lvl.grid_word_count = lvl.grid_words.length;
      }
    }
  } catch(e) {
    log('API hint failed, using defaults: ' + e.message);
    for (const lvl of levels) {
      if (!lvl.hint) {
        lvl.hint = HINTS[lang]('words and patterns');
        lvl.theme = THEMES[lvl.id % THEMES.length];
      }
    }
  }
}

// MAIN
const TARGETS = {
  en: { start: 501, end: 1000 },
  de: { start: 201, end: 1000 },
  fr: { start: 1,   end: 1000 },
  es: { start: 1,   end: 1000 },
  pl: { start: 1,   end: 1000 },
  tr: { start: 1,   end: 1000 },
};

const wordlists = {};
for (const lang of Object.keys(TARGETS)) {
  const p = path.join(WORDLIST_DIR, lang + '.json');
  if (fs.existsSync(p)) {
    wordlists[lang] = JSON.parse(fs.readFileSync(p, 'utf8'));
    log(lang.toUpperCase() + ' wordlist: ' + wordlists[lang].length + ' words');
  } else {
    log('ERROR: ' + lang + ' wordlist missing! Run download script first.');
    process.exit(1);
  }
}

const stats = {};

for (const [lang, target] of Object.entries(TARGETS)) {
  log('Starting ' + lang.toUpperCase() +
    ': levels ' + target.start + '-' + target.end);

  const wordList = wordlists[lang];
  const usedLetterSets = new Set();
  stats[lang] = { generated: 0, rejected: 0 };

  // Load existing protected files to avoid duplicate letter sets
  const protectedRanges = {
    en: [[1,100],[101,200],[201,300],[301,400],[401,500]],
    de: [[1,100],[101,200]],
  };
  if (protectedRanges[lang]) {
    for (const [s, e] of protectedRanges[lang]) {
      const keepFile = path.join(DATA_DIR, `puzzles-${lang}-${s}-${e}.json`);
      if (fs.existsSync(keepFile)) {
        try {
          const existing = JSON.parse(fs.readFileSync(keepFile,'utf8'));
          for (const lvl of existing) {
            usedLetterSets.add([...lvl.letters].sort().join(''));
          }
        } catch(e) {}
      }
    }
  }

  let levelId = target.start;
  let batchLevels = [];
  let seed = lang.charCodeAt(0) * 10000 + target.start;

  while (levelId <= target.end) {
    const progressKey = lang + '_' + levelId;
    if (progress[progressKey]) {
      levelId++;
      stats[lang].generated++;
      continue;
    }

    const diff = levelId <= 200 ? 'beginner' :
      levelId <= 500 ? 'intermediate' :
      levelId <= 750 ? 'advanced' : 'expert';

    let level = null;
    let seedAttempt = 0;
    while (!level && seedAttempt < 200) {
      const candidate = generateLevel(seed + seedAttempt, wordList, diff, levelId);
      if (candidate) {
        const letterKey = [...candidate.letters].sort().join('');
        if (!usedLetterSets.has(letterKey)) {
          usedLetterSets.add(letterKey);
          level = candidate;
        }
      }
      seedAttempt++;
    }

    if (!level) {
      log('SKIP: ' + lang + ' level ' + levelId + ' — no valid level after 200 attempts');
      stats[lang].rejected++;
      levelId++;
      seed += 200;
      continue;
    }

    batchLevels.push(level);
    progress[progressKey] = true;
    seed += seedAttempt + 1;

    // Every 20 levels: add hints via API
    if (batchLevels.length % 20 === 0) {
      await addHintsViaAPI(batchLevels.slice(-20), lang);
      await new Promise(r => setTimeout(r, 500)); // rate limit pause
    }

    // Every 100 levels: save file
    const batchEnd = levelId;
    const batchStart = batchEnd - batchLevels.length + 1;
    if (batchLevels.length === 100 || levelId === target.end) {
      const filename = `puzzles-${lang}-${batchStart}-${batchEnd}.json`;
      const filepath = path.join(DATA_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(batchLevels, null, 2));
      saveProgress();
      log('SAVED: ' + filename +
        ' (' + batchLevels.length + ' levels, ' +
        stats[lang].generated + '/' + (target.end - target.start + 1) + ')');
      batchLevels = [];
    }

    stats[lang].generated++;
    levelId++;
  }

  log('COMPLETE: ' + lang.toUpperCase() +
    ' — ' + stats[lang].generated + ' generated, ' +
    stats[lang].rejected + ' rejected');
}

// Write final report
const report = [
  'OVERNIGHT GENERATION REPORT',
  'Generated: ' + new Date().toISOString(),
  '='.repeat(50),
  ...Object.entries(stats).map(([lang, s]) =>
    lang.toUpperCase() + ': ' + s.generated + ' levels, ' + s.rejected + ' rejected'
  ),
  '='.repeat(50),
  'All done!',
].join('\n');

fs.writeFileSync(
  path.join(__dirname, '../OVERNIGHT_REPORT.txt'), report
);
log('All generation complete! See OVERNIGHT_REPORT.txt');
