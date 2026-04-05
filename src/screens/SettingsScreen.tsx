import { useState, useCallback } from 'react';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { LanguageGrid } from '../components/settings/LanguageGrid';
import { useSettingsStore } from '../stores/settingsStore';
import { useDailyStore } from '../stores/dailyStore';
import { useWorldStore } from '../stores/worldStore';
import { resetAllProgress } from '../lib/resetProgress';
import { BUILDINGS, type BuildingType } from '../core/world/buildingConfig';
import { getTotalPuzzlesPlayed } from '../core/game/puzzleArchive';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';

type SettingsScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function SettingsScreen({ navigate }: SettingsScreenProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguageSetting = useSettingsStore((s) => s.setLanguageSetting);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);
  const totalWords = useDailyStore((s) => s.totalWordsAllTime);
  const streak = useDailyStore((s) => s.currentStreak);
  const slots = useWorldStore((s) => s.slots);
  const built = Object.values(slots).filter(Boolean) as BuildingType[];
  const [confirmReset, setConfirmReset] = useState(false);
  const [langToast, setLangToast] = useState(false);

  const onPickLanguage = useCallback(
    (code: string) => {
      setLanguageSetting(code);
      setLangToast(true);
      window.setTimeout(() => setLangToast(false), 2200);
    },
    [setLanguageSetting],
  );

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] pb-8 pt-[72px]">
      <ResourceBar />
      {langToast ? (
        <div className="fixed left-1/2 top-20 z-[90] -translate-x-1/2 rounded-[8px] border border-[var(--gold-dim)] bg-[var(--bg-elevated)] px-4 py-2 font-cinzel text-sm text-[var(--gold-light)] shadow-lg">
          {t('settings.language_updated')}
        </div>
      ) : null}

      <header className="flex w-full items-center gap-3 border-b border-[var(--border-subtle)] px-4 pb-3">
        <button type="button" className="btn-icon text-lg" onClick={() => navigate('home')} aria-label={t('settings.back')}>
          ←
        </button>
        <h1 className="font-title text-xl font-bold text-[var(--text-primary)]">{t('settings.title')}</h1>
      </header>

      <div className="mt-2 w-full px-4">
        <OrnamentDivider size="sm" />
      </div>

      <div className="mt-4 flex w-full flex-col gap-6 px-4">
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.language')}
          </h2>
          <LanguageGrid selected={language} onSelect={onPickLanguage} />
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.sound')}
          </h2>
          <label className="fantasy-card flex min-h-[48px] items-center justify-between !px-4 !py-3">
            <span className="font-body text-[var(--text-primary)]">{t('settings.sound_effects')}</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="h-5 w-5 rounded-[8px] accent-amber-500"
            />
          </label>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.haptic')}
          </h2>
          <label className="fantasy-card flex min-h-[48px] items-center justify-between !px-4 !py-3">
            <span className="font-body text-[var(--text-primary)]">{t('settings.haptic_feedback')}</span>
            <input
              type="checkbox"
              checked={hapticEnabled}
              onChange={(e) => setHapticEnabled(e.target.checked)}
              className="h-5 w-5 rounded-[8px] accent-amber-500"
            />
          </label>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.stats')}
          </h2>
          <div className="fantasy-card space-y-2 font-body text-sm text-[var(--text-secondary)]">
            <p>{t('settings.total_words', { n: totalWords })}</p>
            <p>{t('settings.total_buildings', { n: built.length })}</p>
            <p>{t('settings.current_streak', { n: streak })}</p>
            <p>{t('settings.puzzle_archive_days', { n: getTotalPuzzlesPlayed() })}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {t('settings.built_emojis', {
                list: built.map((bt) => BUILDINGS[bt].emoji).join(' ') || '—',
              })}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.reset')}
          </h2>
          <button type="button" onClick={() => setConfirmReset(true)} className="btn-danger w-full min-h-[48px]">
            {t('settings.reset_button')}
          </button>
        </section>
      </div>

      {confirmReset ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="diablo-modal w-full max-w-sm p-6">
            <h2 className="font-title text-lg text-[var(--gold-primary)]">{t('settings.reset')}</h2>
            <OrnamentDivider size="sm" className="my-3" />
            <p className="font-body text-[var(--text-primary)]">{t('settings.reset_confirm')}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-secondary flex-1 py-3" onClick={() => setConfirmReset(false)}>
                {t('settings.reset_cancel')}
              </button>
              <button type="button" className="btn-danger flex-1 py-3" onClick={() => resetAllProgress()}>
                {t('settings.reset_ok')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
