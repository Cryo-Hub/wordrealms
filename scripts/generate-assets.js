/**
 * Generates PNG placeholders for PWA / app store.
 * Run: node scripts/generate-assets.js
 */
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, size, size);
  grd.addColorStop(0, '#4c1d95');
  grd.addColorStop(1, '#0f172a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fbbf24';
  ctx.font = `800 ${Math.floor(size * 0.45)}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size / 2, size / 2 + size * 0.03);
  return canvas.toBuffer('image/png');
}

function drawSplash(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#1e1b4b');
  grd.addColorStop(1, '#020617');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fbbf24';
  ctx.font = `800 ${Math.floor(Math.min(w, h) * 0.12)}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WordRealms', w / 2, h / 2);
  return canvas.toBuffer('image/png');
}

writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192));
writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512));
writeFileSync(join(publicDir, 'splash-2048x2732.png'), drawSplash(2048, 2732));
writeFileSync(join(publicDir, 'splash-1668x2224.png'), drawSplash(1668, 2224));
writeFileSync(join(publicDir, 'splash-1242x2688.png'), drawSplash(1242, 2688));
writeFileSync(join(publicDir, 'splash-750x1334.png'), drawSplash(750, 1334));
console.log('Assets written to public/');
