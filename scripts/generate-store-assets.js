/**
 * App-Store- und PWA-Assets (Icons, Splash, Screenshots, iOS AppIcon).
 * Voraussetzung: npm install canvas
 * Ausführung: node scripts/generate-store-assets.js
 */
import { createCanvas } from 'canvas';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const assetsDir = join(publicDir, 'assets');
const iosIconSet = join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

function drawIconPng(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0a06';
  ctx.fillRect(0, 0, size, size);
  const fontPx = Math.floor(size * 0.42);
  ctx.font = `${fontPx}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏰', size / 2, size / 2 + size * 0.02);
  return canvas.toBuffer('image/png');
}

function drawSplash(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0a06';
  ctx.fillRect(0, 0, w, h);
  const fs = Math.floor(Math.min(w, h) * 0.055);
  ctx.fillStyle = '#c9a227';
  ctx.font = `700 ${fs}px system-ui, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WordRealms', w / 2, h / 2 - fs * 0.8);
  ctx.fillStyle = '#8a7060';
  ctx.font = `${Math.floor(fs * 0.45)}px system-ui, sans-serif`;
  ctx.fillText('Build your kingdom one word at a time', w / 2, h / 2 + fs * 0.5);
  return canvas.toBuffer('image/png');
}

function drawScreenshot(w, h, line1, line2) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0a06';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c9a227';
  ctx.font = `700 ${Math.floor(w * 0.055)}px Cinzel, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(line1, w / 2, h / 2 - w * 0.04);
  if (line2) {
    ctx.fillStyle = '#a89880';
    ctx.font = `${Math.floor(w * 0.032)}px system-ui, sans-serif`;
    ctx.fillText(line2, w / 2, h / 2 + w * 0.06);
  }
  return canvas.toBuffer('image/png');
}

mkdirSync(assetsDir, { recursive: true });

writeFileSync(join(assetsDir, 'icon-1024.png'), drawIconPng(1024));
writeFileSync(join(assetsDir, 'icon-512.png'), drawIconPng(512));
writeFileSync(join(assetsDir, 'icon-192.png'), drawIconPng(192));

writeFileSync(join(assetsDir, 'splash-2732x2048.png'), drawSplash(2732, 2048));
writeFileSync(join(assetsDir, 'splash-2048x2732.png'), drawSplash(2048, 2732));
writeFileSync(join(assetsDir, 'splash-1290x2796.png'), drawSplash(1290, 2796));
writeFileSync(join(assetsDir, 'splash-1179x2556.png'), drawSplash(1179, 2556));

writeFileSync(
  join(assetsDir, 'screenshot-1.png'),
  drawScreenshot(1290, 2796, 'Build your kingdom one word at a time', ''),
);
writeFileSync(
  join(assetsDir, 'screenshot-2.png'),
  drawScreenshot(1290, 2796, 'Compete in weekly leagues', ''),
);
writeFileSync(
  join(assetsDir, 'screenshot-3.png'),
  drawScreenshot(1290, 2796, 'Daily puzzles · Streak rewards', ''),
);

if (existsSync(dirname(iosIconSet))) {
  mkdirSync(iosIconSet, { recursive: true });
  const iosSizes = [
    ['Icon-20@2x.png', 40],
    ['Icon-20@3x.png', 60],
    ['Icon-29@2x.png', 58],
    ['Icon-29@3x.png', 87],
    ['Icon-40@2x.png', 80],
    ['Icon-40@3x.png', 120],
    ['Icon-60@2x.png', 120],
    ['Icon-60@3x.png', 180],
    ['Icon-1024.png', 1024],
  ];
  for (const [name, sz] of iosSizes) {
    writeFileSync(join(iosIconSet, name), drawIconPng(sz));
  }
  const contents = {
    images: [
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@3x.png', scale: '3x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@3x.png', scale: '3x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@3x.png', scale: '3x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@3x.png', scale: '3x' },
      { size: '1024x1024', idiom: 'ios-marketing', filename: 'Icon-1024.png', scale: '1x' },
    ],
    info: { version: 1, author: 'xcode' },
  };
  writeFileSync(join(iosIconSet, 'Contents.json'), JSON.stringify(contents, null, 2));
}

console.log('Store assets written to public/assets/' + (existsSync(iosIconSet) ? ' and ios/.../AppIcon.appiconset/' : ''));
