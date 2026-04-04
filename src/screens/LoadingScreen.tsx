import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';

const TITLE = 'WordRealms';

export function LoadingScreen() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [letters, setLetters] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - t0;
      setProgress(Math.min(1, elapsed / 2000));
      setLetters(Math.min(TITLE.length, Math.floor(elapsed / 200)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div className="wr-auth-castle-fixed" aria-hidden>
        <div className="wr-auth-castle-ken" />
        <div className="wr-auth-castle-overlay" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-title text-3xl font-bold tracking-[0.05em] text-[var(--gold-primary)] [text-shadow:0_0_24px_rgba(201,162,39,0.4)]">
          {TITLE.slice(0, letters)}
          {letters < TITLE.length ? (
            <span className="inline-block w-2 animate-pulse text-[var(--gold-light)]">|</span>
          ) : null}
        </h1>
        <p className="mt-2 font-body text-sm italic text-[var(--text-secondary)]">{t('loading.building')}</p>
      </div>
      <div className="mt-10 h-2 w-56 overflow-hidden rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-stone)]">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold-primary)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
    </>
  );
}
