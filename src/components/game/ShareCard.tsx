import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatPuzzleDate } from '../../core/game/puzzleGenerator';
import { useLeagueStore } from '../../stores/leagueStore';
import { LeagueBadge } from '../ui/LeagueBadge';
import { useTranslation } from '../../i18n';

export type ShareCardProps = {
  wordsFound: number;
  foundWords: string[];
  sessionGold: number;
  sessionWood: number;
  sessionStone: number;
  puzzleNumber: number;
  streakDays: number;
  onToast?: (message: string) => void;
};

export function ShareCard({
  wordsFound,
  foundWords,
  sessionGold,
  sessionWood,
  sessionStone,
  puzzleNumber,
  streakDays,
  onToast,
}: ShareCardProps) {
  const { t } = useTranslation();
  const elo = useLeagueStore((s) => s.elo);
  const captureRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const toast = useCallback(
    (message: string) => {
      if (onToast) onToast(message);
      else window.alert(message);
    },
    [onToast],
  );

  const share = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
      if (!blob) {
        toast(t('share.image_error'));
        return;
      }
      const file = new File([blob], 'wordrealms-result.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'WordRealms',
            text: 'My WordRealms result',
          });
          toast(t('share.result_image'));
          return;
        } catch {
          /* fallback */
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wordrealms-result.png';
      a.click();
      URL.revokeObjectURL(url);
      toast(t('share.result_image'));
    } catch (e) {
      console.error(e);
      toast(t('share.image_fail'));
    } finally {
      setBusy(false);
    }
  }, [toast, t]);

  const dateStr = formatPuzzleDate();
  const list = foundWords.length ? foundWords : Array.from({ length: wordsFound }, () => '—');

  return (
    <div className="mt-4 space-y-3">
      <div className="pointer-events-none fixed left-[-800px] top-0 z-0 overflow-hidden" aria-hidden>
        <div
          ref={captureRef}
          style={{
            position: 'relative',
            width: 600,
            height: 400,
            padding: 20,
            boxSizing: 'border-box',
            background: 'linear-gradient(145deg, #0f0a06 0%, #1a1208 100%)',
            border: '1px solid #c9a227',
            boxShadow: '0 0 20px rgba(201, 162, 39, 0.35)',
            fontFamily: 'system-ui, sans-serif',
            color: '#f0e6cc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 700, color: '#c9a227' }}>
              ⚔️ WordRealms
            </span>
            <span style={{ fontSize: 13, color: '#a89880', textAlign: 'right' }}>
              {dateStr}
              <br />
              Puzzle #{puzzleNumber}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <LeagueBadge elo={elo} size="lg" />
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 12, color: '#c9a227', marginBottom: 4 }}>Words found</p>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 12, maxHeight: 72, overflow: 'hidden' }}>
              {list.slice(0, 12).map((w) => (
                <li key={w} style={{ color: '#e8dcc8' }}>
                  <span style={{ color: '#c9a227' }}>✓</span> {w}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span>
              🪵 W: {sessionWood}
            </span>
            <span>
              🪨 S: {sessionStone}
            </span>
            <span>
              💰 G: {sessionGold}
            </span>
            <span>🔥 {streakDays} days</span>
          </div>
          <p
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 11,
              color: '#6b6358',
              margin: 0,
            }}
          >
            wordrealms-cyan.vercel.app
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void share()}
        className="fantasy-button w-full min-h-[48px] disabled:opacity-60"
      >
        {busy ? '…' : 'Share Results'}
      </button>
    </div>
  );
}
