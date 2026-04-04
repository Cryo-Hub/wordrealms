import { motion } from 'framer-motion';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { NavigationBar } from '../components/ui/NavigationBar';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';
import { useWorldStore } from '../stores/worldStore';
import { useDailyStore } from '../stores/dailyStore';
import { useLeagueStore } from '../stores/leagueStore';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import { BUILDINGS, type BuildingType } from '../core/world/buildingConfig';
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
  const empty = 10 - built;
  const wordsToday = useDailyStore((s) => s.wordsFoundToday);
  const streak = useDailyStore((s) => s.currentStreak);
  const elo = useLeagueStore((s) => s.elo);
  const progress = Math.min(1, wordsToday / 5);

  const emojis = builtList.map((bt) => BUILDINGS[bt].emoji).join(' ');

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden pb-24 pt-[72px]">
      <ResourceBar />

      <div className="relative flex w-full flex-1 flex-col gap-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 shrink-0" />
          <div className="flex min-w-0 flex-1 justify-center" />
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <LeagueBadge elo={elo} size="sm" className="scale-90" />
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
              aria-label="Settings"
              className="btn-icon text-lg"
              onClick={() => navigate('settings')}
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
          onClick={() => navigate('world')}
          className="fantasy-card flex w-full flex-col gap-2 text-left transition active:scale-[0.99]"
        >
          <h2 className="wr-section-title text-base">{t('home.your_world')}</h2>
          <p className="text-center text-5xl">{emojis || '🏰'}</p>
          <p className="wr-body text-sm">{empty > 0 ? t('home.empty_slots', { n: empty }) : t('home.kingdom_complete')}</p>
          <p className="wr-label font-num">{t('home.buildings', { n: built })}</p>
        </button>
      </div>

      <NavigationBar active="home" onNavigate={navigate} />
    </div>
  );
}
