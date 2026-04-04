export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

const FLOORS: Record<League, number> = {
  Bronze: 0,
  Silver: 1000,
  Gold: 1500,
  Platinum: 2000,
  Diamond: 2500,
};

const ORDER: League[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

export function getLeagueFloor(league: League): number {
  return FLOORS[league];
}

export function getLeague(elo: number): League {
  const e = Math.max(0, elo);
  if (e >= FLOORS.Diamond) return 'Diamond';
  if (e >= FLOORS.Platinum) return 'Platinum';
  if (e >= FLOORS.Gold) return 'Gold';
  if (e >= FLOORS.Silver) return 'Silver';
  return 'Bronze';
}

/** Sieg in der wöchentlichen Wertung (obere Hälfte) vs. Niederlage. */
export function getEloChange(isTopHalf: boolean): number {
  return isTopHalf ? 25 : -15;
}

export function getProgressToNextLeague(elo: number): {
  current: League;
  next: League | null;
  percent: number;
} {
  const e = Math.max(0, elo);
  const current = getLeague(e);

  if (current === 'Diamond') {
    return { current, next: null, percent: 100 };
  }

  const idx = ORDER.indexOf(current);
  const next = ORDER[idx + 1] ?? null;
  if (!next) {
    return { current, next: null, percent: 100 };
  }

  const low = FLOORS[current];
  const high = FLOORS[next];
  const span = high - low;
  const pct = span <= 0 ? 100 : Math.min(100, Math.max(0, ((e - low) / span) * 100));

  return { current, next, percent: pct };
}

/** Nach wöchentlichem Reset: ELO um 200 senken, aber nicht unter die Untergrenze der aktuellen Liga. */
export function applyWeeklyEloDecay(elo: number): number {
  const league = getLeague(elo);
  const floor = FLOORS[league];
  return Math.max(floor, elo - 200);
}
