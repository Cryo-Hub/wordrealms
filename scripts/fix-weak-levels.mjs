import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'puzzles-en-301-400.json',
  'puzzles-en-401-500.json',
];

for (const file of files) {
  const filePath = path.join(__dirname, '../src/data', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const strong = data.filter(lvl => lvl.grid_words.length >= 3);
  const weak = data.filter(lvl => lvl.grid_words.length < 3);

  console.log(file + ': ' + data.length + ' total, ' +
    strong.length + ' strong, ' + weak.length + ' weak removed');

  fs.writeFileSync(filePath, JSON.stringify(strong, null, 2));
}
