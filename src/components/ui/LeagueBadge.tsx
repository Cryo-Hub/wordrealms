import type { CSSProperties } from 'react';
import { getLeague, getLeagueFloor, getProgressToNextLeague, type League } from '../../core/game/leagueSystem';

const LEAGUE_COLOR: Record<League, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
  Diamond: '#b9f2ff',
};

const LEAGUE_LABEL: Record<League, string> = {
  Bronze: 'Bronze',
  Silver: 'Silver',
  Gold: 'Gold',
  Platinum: 'Platinum',
  Diamond: 'Diamond',
};

type LeagueBadgeProps = {
  elo: number;
  size?: 'sm' | 'lg';
  className?: string;
};

export function LeagueBadge({ elo, size = 'sm', className = '' }: LeagueBadgeProps) {
  const league = getLeague(elo);
  const color = LEAGUE_COLOR[league];
  const { next, percent } = getProgressToNextLeague(elo);
  const nextLabel = next ? LEAGUE_LABEL[next] : null;
  const needElo = next ? Math.max(0, getLeagueFloor(next) - elo) : 0;

  const scale = size === 'lg' ? 1.35 : 1;
  const shieldW = size === 'sm' ? 48 : 56 * scale;
  const shieldH = size === 'sm' ? 54 : 64 * scale;

  return (
    <div
      className={`flex flex-col items-center ${size === 'sm' ? 'w-[48px]' : ''} ${className}`}
      style={{ '--league-glow': color } as CSSProperties}
    >
      <div
        className="relative flex flex-col items-center justify-center rounded-[12px] px-2 py-2"
        style={{
          boxShadow: `0 0 24px color-mix(in srgb, ${color} 55%, transparent), 0 0 48px color-mix(in srgb, ${color} 25%, transparent)`,
          animation: 'league-glow 2.4s ease-in-out infinite',
        }}
      >
        <svg
          width={shieldW}
          height={shieldH}
          viewBox="0 0 56 64"
          aria-hidden
          className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <linearGradient id={`shield-grad-${league}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <path
            d="M28 4 L48 12 L48 34 Q48 48 28 58 Q8 48 8 34 L8 12 Z"
            fill={`url(#shield-grad-${league})`}
            stroke={color}
            strokeWidth={1.5}
          />
          <text x="28" y="38" textAnchor="middle" className="font-cinzel" fill="#0f0a06" fontSize="14" fontWeight={700}>
            {league[0]}
          </text>
        </svg>
        <p
          className={`font-cinzel font-bold tabular-nums ${size === 'lg' ? 'text-lg' : 'text-xs'}`}
          style={{ color }}
        >
          {elo} ELO
        </p>
      </div>

      <div className={`mt-2 w-full max-w-[200px] ${size === 'lg' ? 'max-w-[260px]' : ''}`}>
        <div className="h-1.5 w-full overflow-hidden rounded-full border border-[#2a2018] bg-[#080608]">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        {nextLabel ? (
          <p className="mt-1 text-center font-body text-[10px] text-[var(--text-muted)]">
            {needElo} ELO to {nextLabel}
          </p>
        ) : (
          <p className="mt-1 text-center font-body text-[10px] text-[var(--text-muted)]">Peak rank</p>
        )}
      </div>

      <style>{`
        @keyframes league-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
      `}</style>
    </div>
  );
}
