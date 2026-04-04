/** Normalisiert Whitespace-getrennte Wortlisten (min. 3 Zeichen). */
export function parseWordBlock(s: string): string[] {
  const out = new Set<string>();
  for (const w of s.trim().toLowerCase().split(/\s+/)) {
    if (w.length >= 3) out.add(w);
  }
  return [...out];
}
