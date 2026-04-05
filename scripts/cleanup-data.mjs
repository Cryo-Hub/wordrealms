import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/data');

const toDelete = [
  'levels_1_100_corrected_full.json',
  'levels_101_200_intermediate.json',
  'levels_201_300_intermediate_advanced.json',
  'levels_301_400_advanced.json',
  'levels_401_500_expert.json',
  'wordrealms_de_levels_1_100_beginner_fixed_unique_letters.json',
  'wordrealms_de_levels_101_200_fortgeschritten_fixed_unique_letters.json',
];

// Safety check: verify all puzzles-*.json exist first
const required = [
  'puzzles-en-1-100.json',
  'puzzles-en-101-200.json',
  'puzzles-en-201-300.json',
  'puzzles-en-301-400.json',
  'puzzles-en-401-500.json',
  'puzzles-de-1-100.json',
  'puzzles-de-101-200.json',
];

for (const f of required) {
  if (!fs.existsSync(path.join(dir, f))) {
    console.error('❌ ABORT: ' + f + ' missing — not deleting anything!');
    process.exit(1);
  }
}

// All safe — delete old files
for (const f of toDelete) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('🗑️  Deleted: ' + f);
  }
}
console.log('✅ Cleanup complete — src/data is now clean!');
