import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

function isValidWord(word, letters) {
  const available = {};
  for (const l of letters) {
    const u = l.toUpperCase();
    available[u] = (available[u] || 0) + 1;
  }
  for (const ch of word.toUpperCase()) {
    available[ch] = (available[ch] || 0) - 1;
    if (available[ch] < 0) return false;
  }
  return true;
}

function validateAndClean(levels) {
  const clean = [];
  for (const lvl of levels) {
    if (!Array.isArray(lvl.letters) || !lvl.center) continue;
    lvl.grid_words = (lvl.grid_words || []).filter(w =>
      w && w.word &&
      isValidWord(w.word, lvl.letters) &&
      w.word.toUpperCase().includes(lvl.center.toUpperCase())
    );
    lvl.bonus_words = (lvl.bonus_words || []).filter(w =>
      w && w.word &&
      isValidWord(w.word, lvl.letters) &&
      w.word.toUpperCase().includes(lvl.center.toUpperCase())
    );
    if (lvl.grid_words.length >= 3) clean.push(lvl);
  }
  return clean;
}

async function generateBatch(startId, count) {
  const prompt = `Generate exactly ${count} EXPERT English word puzzles for a mobile word game.
Level IDs: ${startId} to ${startId + count - 1}.
Difficulty: EXPERT — challenging but real English vocabulary.

CRITICAL RULES — every single one must be followed:
1. Every word MUST contain the center letter
2. Every word uses ONLY the 7 given letters (exact multiset)
3. EACH letter appears EXACTLY ONCE in the letters array
4. Word length: 3-7 letters only
5. No proper nouns, no abbreviations
6. Every level has DIFFERENT letter combinations
7. Center letter varies across levels
8. grid_words: 8-12 words, all valid English
9. bonus_words: 3-6 words
10. At least 5 grid_words must be 5+ letters
11. At least 2 grid_words must be 6-7 letters

SELF-CHECK before outputting each level:
- For every word, count each letter used vs letters array
- If any letter in word exceeds its count in letters[] → remove that word
- Then verify grid_words.length >= 3 after filtering

Output ONLY a valid JSON array, no markdown, no explanation.
Start with [ and end with ]

Example of one level (do NOT copy these exact letters/words):
{"id":401,"level":401,"difficulty":"expert",
"letters":["S","P","L","E","N","D","I"],"center":"I",
"grid_words":[{"word":"SPINED","length":6},{"word":"PILED","length":5},
{"word":"LINED","length":5},{"word":"DINES","length":5},
{"word":"SPEND","length":5},{"word":"PLIED","length":5},
{"word":"SPINE","length":5},{"word":"SNIDE","length":5}],
"bonus_words":[{"word":"PINE","length":4},{"word":"DIES","length":4},{"word":"NIPS","length":4}],
"intersection_letters":["I","N","E","D","L"],
"hint":"Think of sharp and elongated shapes",
"theme":"form"}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text.trim();
  try {
    const parsed = JSON.parse(text);
    return validateAndClean(parsed);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return validateAndClean(parsed);
      } catch {
        console.error('JSON parse failed for batch at', startId);
        return [];
      }
    }
    console.error('No JSON array found in response for batch at', startId);
    return [];
  }
}

async function main() {
  const filePath = path.join(__dirname, '../src/data/puzzles-en-401-500.json');
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log('Existing strong levels: ' + existing.length);
  const needed = 100 - existing.length;
  console.log('Need to generate: ' + needed + ' new levels');

  if (needed <= 0) {
    console.log('Already at 100 levels — nothing to do!');
    return;
  }

  let allNew = [];
  const batchSize = 20;
  let attempts = 0;
  const maxAttempts = 12;
  let startId = 501; // Use IDs outside existing range to avoid collisions

  while (allNew.length < needed && attempts < maxAttempts) {
    attempts++;
    const toGenerate = Math.min(batchSize, needed - allNew.length + 3);
    const batchStartId = startId + (attempts - 1) * batchSize;

    console.log(`\nBatch ${attempts}: generating ${toGenerate} levels (IDs ${batchStartId}+)...`);

    const batch = await generateBatch(batchStartId, toGenerate);
    const validBatch = batch.slice(0, toGenerate);
    allNew = [...allNew, ...validBatch];

    console.log(`Got ${validBatch.length} valid. Total: ${allNew.length}/${needed}`);

    if (allNew.length < needed && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  const finalNew = allNew.slice(0, needed);
  console.log(`\nUsing ${finalNew.length} new levels.`);

  // Combine and renumber 401-500
  let idCounter = 401;
  const combined = [...existing, ...finalNew].map(lvl => ({
    ...lvl,
    id: idCounter,
    level: idCounter++,
    difficulty: 'expert',
  }));

  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));
  console.log(`\n✅ Done! puzzles-en-401-500.json now has ${combined.length} levels`);

  // Quick sanity check
  const weak = combined.filter(l => l.grid_words.length < 3);
  if (weak.length > 0) {
    console.warn(`⚠️  ${weak.length} levels still have <3 grid_words: ${weak.map(l=>l.level).join(',')}`);
  } else {
    console.log('✅ All levels have ≥3 grid_words');
  }
}

main().catch(console.error);
