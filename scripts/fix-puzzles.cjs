const fs = require('fs');

function isValidWord(word, letters) {
  const available = {};
  for (const l of letters) {
    available[l.toUpperCase()] = (available[l.toUpperCase()] || 0) + 1;
  }
  for (const ch of word.toUpperCase()) {
    available[ch] = (available[ch] || 0) - 1;
    if (available[ch] < 0) return false;
  }
  return true;
}

/** In-place fix auf den kanonischen puzzles-en-*.json Dateien. */
const files = [
  'src/data/puzzles-en-101-200.json',
  'src/data/puzzles-en-201-300.json',
  'src/data/puzzles-en-301-400.json',
  'src/data/puzzles-en-401-500.json',
];

for (const dest of files) {
  const data = JSON.parse(fs.readFileSync(dest, 'utf8'));
  let totalRemoved = 0;

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
    totalRemoved += before - (lvl.grid_words.length + lvl.bonus_words.length);
    if (lvl.grid_words.length < 3) {
      console.warn('⚠️  Level ' + lvl.level + ' only has ' +
        lvl.grid_words.length + ' grid_words!');
    }
  }

  fs.writeFileSync(dest, JSON.stringify(data, null, 2));
  console.log('✅ ' + dest + ' — removed ' + totalRemoved + ' invalid words');
}
