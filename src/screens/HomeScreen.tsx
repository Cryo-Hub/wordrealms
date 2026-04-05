import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { NavigationBar } from '../components/ui/NavigationBar';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';
import { PaywallModal, shouldShowPaywallAuto, markPaywallShownToday } from '../components/game/PaywallModal';
import { useWorldStore } from '../stores/worldStore';
import { useDailyStore } from '../stores/dailyStore';
import { useLeagueStore } from '../stores/leagueStore';
import { usePremiumStore } from '../stores/premiumStore';
import { useEnergyStore } from '../stores/energyStore';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import type { BuildingType } from '../core/world/buildingConfig';
import { getBuildingDisplayEmoji } from '../core/game/buildingDisplay';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';

type HomeScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function HomeScreen({ navigate }: HomeScreenProps) {
  const { t } = useTranslation();
  const slots = useWorldStore((s) => s.slots);
  const builtList = Object.values(slots).filter(Boolean) as BuildingType[];
  const built = builtList.length;
  const maxSlots = 15;
  const empty = maxSlots - built;
  const claimedRewards = usePremiumStore((s) => s.claimedRewards);
  const puzzlesCompleted = useDailyStore((s) => s.puzzlesCompleted);
  const bpLevel = usePremiumStore((s) => s.battlePassLevel);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const energy = useEnergyStore((s) => s.energy);
  const canFreePlay = isPremium || energy > 0;
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    if (shouldShowPaywallAuto(puzzlesCompleted, bpLevel)) {
      markPaywallShownToday();
      setPaywallOpen(true);
    }
  }, [puzzlesCompleted, bpLevel]);
  const wordsToday = useDailyStore((s) => s.wordsFoundToday);
  const streak = useDailyStore((s) => s.currentStreak);
  const elo = useLeagueStore((s) => s.elo);
  const progress = Math.min(1, wordsToday / 5);

  const emojis = builtList.map((bt) => getBuildingDisplayEmoji(bt, claimedRewards)).join(' ');

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] pb-24 pt-[72px]">
      <ResourceBar />

      <div className="relative flex w-full flex-col gap-3 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 shrink-0" />
          <div className="flex min-w-0 flex-1 justify-center" />
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <LeagueBadge elo={elo} size="sm" />
              <span className="font-num text-xs text-[var(--gold-primary)]" title={t('settings.current_streak', { n: streak })}>
                🔥 {streak}
              </span>
            </div>
            <button
              type="button"
              aria-label="Shop"
              className="btn-icon text-lg"
              onClick={() => navigate('shop')}
            >
              🛍️
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="btn-icon text-lg"
              onClick={() => navigate('profile')}
            >
              ⚙️
            </button>
          </div>
        </div>

        <h1 className="wr-screen-title px-1">{t('auth.title')}</h1>
        <OrnamentDivider size="md" />

        <p className="wr-body text-center text-sm">{t('home.words_today', { n: wordsToday })}</p>
        <div className="relative mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-[8px] border border-[#2a2018] bg-[#080608]">
          <motion.div
            className="h-full bg-[#c9a227]"
            style={{ width: `${progress * 100}%` }}
            layout
          />
          <div className="pointer-events-none absolute inset-0 wr-shimmer opacity-25" />
        </div>
        <p className="wr-label text-center">{t('home.daily_progress', { n: wordsToday })}</p>

        <button type="button" onClick={() => navigate('game')} className="fantasy-button mx-auto w-full max-w-sm min-h-[52px]">
          {t('home.play_button')}
        </button>

        <button
          type="button"
          onClick={() => navigate('freeplay')}
          disabled={!canFreePlay}
          className={`mx-auto w-full max-w-sm min-h-[48px] rounded-lg border px-4 py-3 font-cinzel text-sm font-semibold transition active:scale-[0.99] ${
            canFreePlay
              ? isPremium
                ? 'border-[#c9a227] bg-[rgba(30,24,16,0.95)] text-[#c9a227] shadow-[0_0_20px_rgba(201,162,39,0.2)]'
                : 'border-[#4a3a28] bg-[rgba(20,16,12,0.9)] text-[#f0e6cc]'
              : 'cursor-not-allowed border-[#2a2018] bg-[rgba(12,10,8,0.85)] text-[var(--text-muted)] opacity-60'
          }`}
        >
          {isPremium ? t('home.free_play_infinity') : canFreePlay ? t('home.free_play', { n: energy }) : t('home.free_play_disabled')}
        </button>

        <button
          type="button"
          onClick={() => navigate('battlepass')}
          className="fantasy-button mx-auto w-full max-w-sm min-h-[48px] text-sm normal-case tracking-normal text-[#c9a227]"
        >
          📜 Battle Pass
        </button>

        <button
          type="button"
          onClick={() => navigate('world')}
          className="fantasy-card flex w-full flex-col gap-2 text-left transition active:scale-[0.99]"
        >
          <h2 className="wr-section-title text-base">{t('home.your_world')}</h2>
          <p className="text-center text-5xl">{emojis || '🏰'}</p>
          <p className="wr-body text-sm">{empty > 0 ? t('home.empty_slots', { n: empty }) : t('home.kingdom_complete')}</p>
          <p className="wr-label font-num">{t('home.buildings', { n: built })}</p>
        </button>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <NavigationBar active="home" onNavigate={navigate} />
    </div>
  );
}
