import { useTranslation } from '../../i18n';

type LeagueCardProps = {
  rank: number;
  username: string;
  wordsFound: number;
  points: number;
  isYou?: boolean;
};

export function LeagueCard({ rank, username, wordsFound, points, isYou }: LeagueCardProps) {
  const { t } = useTranslation();
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const display = username.length > 15 ? `${username.slice(0, 14)}…` : username;

  return (
    <div
      className={`fantasy-card flex min-h-[48px] items-center gap-2 !px-3 !py-2 ${
        isYou ? 'ring-1 ring-[var(--gold-primary)]/50' : ''
      }`}
    >
      <span className="w-8 text-center font-num text-sm font-bold text-[var(--text-muted)]">
        {medal ?? rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-cinzel font-medium text-[var(--text-primary)]">
          {display}
          {isYou ? (
            <span className="ml-2 rounded-[8px] bg-[var(--gold-dim)]/40 px-1.5 text-[10px] text-[var(--gold-light)]">
              {t('league.you')}
            </span>
          ) : null}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{t('league.words_short', { n: wordsFound })}</p>
      </div>
      <span className="rounded-[8px] border border-[var(--border-gold)]/40 bg-[var(--gold-dim)]/30 px-2 py-1 font-num text-xs font-semibold text-[var(--gold-light)]">
        {t('league.points_abbr', { n: points })}
      </span>
    </div>
  );
}
