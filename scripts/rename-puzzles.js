/**
 * Legacy: DE-Dateien wurden nach puzzles-de-1-100.json / puzzles-de-101-200.json kopiert;
 * alte Quellen wurden per scripts/cleanup-data.mjs entfernt.
 * Dieses Skript listet nur noch alle JSON-Dateien in src/data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'data');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
console.log('JSON files in src/data:');
files.forEach((f) => console.log(' ' + f));
