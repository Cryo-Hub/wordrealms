import { formatPuzzleDate, getPuzzleNumber } from '../../core/game/puzzleGenerator';
import { useTranslation } from '../../i18n';

type ShareCardProps = {
  wordsFound: number;
  sessionGold: number;
  sessionWood: number;
  sessionStone: number;
};

export function ShareCard({
  wordsFound,
  sessionGold,
  sessionWood,
  sessionStone,
}: ShareCardProps) {
  const { t } = useTranslation();
  const pts = sessionGold + sessionWood + sessionStone;
  const puzzleLine = `${formatPuzzleDate()} · ${t('game.puzzle_number', { n: getPuzzleNumber() })}`;

  const text = [
    t('share.title'),
    puzzleLine,
    t('share.words_line', { n: wordsFound }),
    t('share.points_line', { n: pts }),
    `[G] ${sessionGold} [W] ${sessionWood} [S] ${sessionStone}`,
    t('share.play_at'),
  ].join('\n');

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('share.title'), text });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
    window.alert(t('share.copied'));
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="diablo-card border border-[var(--border-subtle)] p-4 text-left font-mono text-xs text-[var(--text-secondary)]">
        <p className="font-cinzel font-bold text-[var(--gold-primary)]">{t('share.title')}</p>
        <p className="mt-1 text-[var(--text-muted)]">{puzzleLine}</p>
        <p className="mt-2 font-body">{t('share.words_line', { n: wordsFound })}</p>
        <p className="font-body">{t('share.points_line', { n: pts })}</p>
        <p className="font-body">
          [G] {sessionGold} [W] {sessionWood} [S] {sessionStone}
        </p>
        <p className="mt-2 text-[var(--text-muted)]">{t('share.url')}</p>
      </div>
      <button type="button" onClick={() => void share()} className="fantasy-button w-full min-h-[48px]">
        {t('complete.share')}
      </button>
    </div>
  );
}
