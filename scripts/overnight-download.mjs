import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dir = path.join(__dirname, '../src/data/wordlists');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) {
      console.log('Already exists: ' + dest);
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        download(res.headers.location, dest).then(resolve);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', (e) => {
      console.error('Download failed: ' + url + ' — ' + e.message);
      file.close();
      resolve(false);
    });
  });
}

function parseWordlist(filepath, lang) {
  if (!fs.existsSync(filepath)) return [];
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  const words = [];
  for (const line of lines) {
    const word = line.split(' ')[0].trim().toUpperCase();
    if (word.length >= 3 && word.length <= 7 && /^[A-Z]+$/.test(word)) {
      words.push(word);
    }
  }
  return [...new Set(words)];
}

const sources = {
  en: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt',
  de: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt',
  fr: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fr/fr_50k.txt',
  es: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt',
  pl: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pl/pl_50k.txt',
  tr: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/tr/tr_50k.txt',
};

const counts = {};
for (const [lang, url] of Object.entries(sources)) {
  const raw = path.join(dir, lang + '.txt');
  const filtered = path.join(dir, lang + '.json');
  await download(url, raw);
  let words = parseWordlist(raw, lang);
  console.log(lang.toUpperCase() + ' raw: ' + words.length + ' words');
  if (words.length < 1500) {
    console.log('WARNING: ' + lang + ' too few words (' + words.length + '), supplementing with EN');
    const enWords = parseWordlist(path.join(dir, 'en.txt'), 'en');
    words = [...new Set([...words, ...enWords])];
  }
  fs.writeFileSync(filtered, JSON.stringify(words));
  counts[lang] = words.length;
  console.log(lang.toUpperCase() + ' filtered: ' + words.length + ' words saved');
}
console.log('Download complete:', counts);
