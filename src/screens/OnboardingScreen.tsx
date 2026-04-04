import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageGrid } from '../components/settings/LanguageGrid';
import { useSettingsStore } from '../stores/settingsStore';
import { useTranslation } from '../i18n';

const ONBOARD_KEY = 'onboarding_complete';

type OnboardingScreenProps = {
  onFinish: () => void;
};

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARD_KEY) === '1';
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const [slide, setSlide] = useState(0);
  const language = useSettingsStore((s) => s.language);
  const setLanguageSetting = useSettingsStore((s) => s.setLanguageSetting);

  const finish = () => {
    localStorage.setItem(ONBOARD_KEY, '1');
    onFinish();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-8 pt-12">
      <AnimatePresence mode="wait">
        {slide === 0 ? (
          <motion.div
            key="s0"
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            className="mx-auto flex max-w-[430px] flex-1 flex-col items-center text-center"
          >
            <span className="text-7xl drop-shadow-[0_0_24px_rgba(212,160,23,0.35)]" aria-hidden>
              🏰
            </span>
            <h1 className="mt-6 font-title text-2xl font-bold text-[var(--gold-primary)]">
              {t('onboarding.slide1.title')}
            </h1>
            <p className="mt-2 font-body text-[var(--text-secondary)]">{t('onboarding.slide1.subtitle')}</p>
            <button type="button" onClick={() => setSlide(1)} className="fantasy-button mt-auto w-full max-w-sm">
              {t('onboarding.lets_go')}
            </button>
          </motion.div>
        ) : null}

        {slide === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            className="mx-auto flex max-w-[430px] flex-1 flex-col"
          >
            <h2 className="text-center font-title text-xl text-[var(--gold-primary)]">{t('onboarding.slide2.title')}</h2>
            <MiniWheelIllustration />
            <p className="mt-4 text-center font-body text-sm text-[var(--text-secondary)]">{t('onboarding.slide2.text')}</p>
            <div className="diablo-card mt-4 border border-[var(--border-subtle)] p-3 font-body text-xs text-[var(--text-secondary)]">
              <p className="font-cinzel font-semibold text-[var(--text-primary)]">{t('onboarding.slide2.rewards_title')}</p>
              <ul className="mt-2 space-y-1">
                <li>{t('rewards.letters3')}</li>
                <li>{t('rewards.letters4')}</li>
                <li>{t('rewards.letters5')}</li>
              </ul>
            </div>
            <div className="mt-auto flex gap-2">
              <button type="button" onClick={finish} className="btn-secondary flex-1 py-3">
                {t('onboarding.skip')}
              </button>
              <button type="button" onClick={() => setSlide(2)} className="fantasy-button min-w-0 flex-1 py-3">
                {t('onboarding.slide2.got_it')}
              </button>
            </div>
          </motion.div>
        ) : null}

        {slide === 2 ? (
          <motion.div
            key="s2"
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            className="mx-auto flex max-w-[430px] flex-1 flex-col items-center text-center"
          >
            <h2 className="font-title text-xl text-[var(--gold-primary)]">{t('onboarding.slide3.title')}</h2>
            <p className="mt-6 text-5xl" aria-hidden>
              🏠 🪚 ⛏️
            </p>
            <p className="mt-6 font-body text-[var(--text-secondary)]">{t('onboarding.slide3.text')}</p>
            <div className="mt-auto flex w-full max-w-sm gap-2">
              <button type="button" onClick={finish} className="btn-secondary flex-1 py-3">
                {t('onboarding.skip')}
              </button>
              <button type="button" onClick={() => setSlide(3)} className="fantasy-button min-w-0 flex-1 py-3">
                {t('onboarding.slide3.amazing')}
              </button>
            </div>
          </motion.div>
        ) : null}

        {slide === 3 ? (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            className="mx-auto flex w-full max-w-[430px] flex-1 flex-col"
          >
            <h2 className="text-center font-title text-xl text-[var(--gold-primary)]">{t('onboarding.slide4.title')}</h2>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">{t('onboarding.slide4.text')}</p>
            <div className="mt-4">
              <LanguageGrid
                selected={language}
                onSelect={(c) => {
                  setLanguageSetting(c);
                }}
              />
            </div>
            <button type="button" onClick={finish} className="fantasy-button mt-6 w-full min-h-[52px]">
              {t('onboarding.slide4.start')}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MiniWheelIllustration() {
  const r = 28;
  const cx = 100;
  const cy = 100;
  const slots = [
    { x: cx, y: cy },
    { x: cx, y: cy - 58 },
    { x: cx + 50, y: cy - 28 },
    { x: cx + 50, y: cy + 28 },
    { x: cx, y: cy + 58 },
    { x: cx - 50, y: cy + 28 },
    { x: cx - 50, y: cy - 28 },
  ];
  return (
    <svg viewBox="0 0 200 200" className="mx-auto mt-6 h-48 w-48" aria-hidden>
      <circle cx={cx} cy={cy} r={78} fill="var(--bg-stone)" stroke="var(--border-subtle)" strokeWidth={2} />
      {slots.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={r}
          fill="var(--bg-card)"
          stroke="var(--border-gold)"
          strokeOpacity={0.35}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
