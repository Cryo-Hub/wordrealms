import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/data');

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

const files = [
  'puzzles-en-1-100.json','puzzles-en-101-200.json',
  'puzzles-en-201-300.json','puzzles-en-301-400.json',
  'puzzles-en-401-500.json',
  'puzzles-de-1-100.json','puzzles-de-101-200.json',
  'puzzles-de-201-300.json','puzzles-de-301-400.json',
  'puzzles-de-401-500.json',
  'puzzles-fr-1-100.json','puzzles-fr-101-200.json',
  'puzzles-fr-201-300.json','puzzles-fr-301-400.json',
  'puzzles-fr-401-500.json',
  'puzzles-es-1-100.json','puzzles-es-101-200.json',
  'puzzles-es-201-300.json','puzzles-es-301-400.json',
  'puzzles-es-401-500.json',
  'puzzles-pl-1-100.json','puzzles-pl-101-200.json',
  'puzzles-pl-201-300.json','puzzles-pl-301-400.json',
  'puzzles-pl-401-500.json',
  'puzzles-tr-1-100.json',
  'puzzles-tr-201-300.json','puzzles-tr-301-400.json',
  'puzzles-tr-401-500.json',
];

const report = { files: [], totalLevels: 0, totalRemoved: 0, weakLevels: [] };

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    report.files.push({ file, status: 'MISSING' });
    console.log('❌ MISSING: ' + file);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let removed = 0;
  const weak = [];

  for (const lvl of data) {
    const before = lvl.grid_words.length + lvl.bonus_words.length;
    lvl.grid_words = lvl.grid_words.filter(w =>
      isValidWord(w.word, lvl.letters) &&
      w.word.toUpperCase().includes(lvl.center.toUpperCase())
    );
    lvl.bonus_words = lvl.bonus_words.filter(w =>
      isValidWord(w.word, lvl.letters) &&
      w.word.toUpperCase().includes(lvl.center.toUpperCase())
    );
    const after = lvl.grid_words.length + lvl.bonus_words.length;
    removed += before - after;
    if (lvl.grid_words.length < 3) {
      weak.push(lvl.level);
      report.weakLevels.push({ file, level: lvl.level, gridWords: lvl.grid_words.length });
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  report.files.push({
    file, status: 'OK', levels: data.length,
    removed, weakCount: weak.length
  });
  report.totalLevels += data.length;
  report.totalRemoved += removed;
  console.log((weak.length > 0 ? '⚠️ ' : '✅') + ' ' + file +
    ' — ' + data.length + ' levels, ' + removed + ' removed' +
    (weak.length ? ', ' + weak.length + ' weak: ' + weak.join(',') : ''));
}

fs.writeFileSync(
  path.join(__dirname, '../PUZZLE_VALIDATION_REPORT.json'),
  JSON.stringify(report, null, 2)
);
console.log('\nDone: ' + report.totalLevels + ' levels total, ' +
  report.totalRemoved + ' invalid words removed, ' +
  report.weakLevels.length + ' weak levels');
