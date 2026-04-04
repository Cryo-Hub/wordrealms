import { useEffect, useState } from 'react';
import { useResourceStore } from '../../stores/resourceStore';
import { useTranslation } from '../../i18n';

const COOLDOWN_KEY = 'wordrealms-rewarded-ad';
const HOUR = 60 * 60 * 1000;

export function RewardedAdButton() {
  const { t } = useTranslation();
  const addResources = useResourceStore((s) => s.addResources);
  const [modal, setModal] = useState(false);
  const [count, setCount] = useState(3);

  const canUse = () => {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
    return Date.now() - last > HOUR;
  };

  const [ready, setReady] = useState(canUse());

  useEffect(() => {
    if (!modal) return;
    setCount(3);
    const t0 = Date.now();
    const iv = window.setInterval(() => {
      const left = 3 - Math.floor((Date.now() - t0) / 1000);
      setCount(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(iv);
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        addResources(100, 50, 25);
        setModal(false);
        setReady(false);
      }
    }, 200);
    return () => window.clearInterval(iv);
  }, [modal, addResources]);

  return (
    <>
      <button type="button" disabled={!ready} onClick={() => setModal(true)} className="btn-secondary mt-3 w-full min-h-[48px] disabled:opacity-40">
        {t('world.watch_ad')}
      </button>
      {modal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <div className="diablo-modal p-8 text-center">
            <p className="font-title text-lg text-[var(--text-primary)]">{t('world.ad_playing')}</p>
            <p className="mt-4 font-num text-4xl text-[var(--gold-primary)]">{count}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
