import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { IsometricWorld } from '../components/world/IsometricWorld/IsometricWorld';
import { NavigationBar } from '../components/ui/NavigationBar';
import { useResourceStore } from '../stores/resourceStore';
import { useWorldStore } from '../stores/worldStore';
import { usePremiumStore } from '../stores/premiumStore';
import { useLeagueStore } from '../stores/leagueStore';
import { BUILDINGS, type BuildingType } from '../core/world/buildingConfig';
import { getBuildingDisplayEmoji } from '../core/game/buildingDisplay';
import { showRewardedAd } from '../services/adService';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';
import { buildingDescKey, buildingNameKey } from '../i18n/buildingKeys';

const MAX_BUILDINGS = 15;
const LS_AD_GOLD = 'wordrealms-world-ad-gold-day';
const LS_KINGDOM_5 = 'wordrealms-kingdom-toast-5';
const LS_KINGDOM_10 = 'wordrealms-kingdom-toast-10';
const LS_KINGDOM_15 = 'wordrealms-kingdom-complete';

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type WorldScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function WorldScreen({ navigate }: WorldScreenProps) {
  const { t } = useTranslation();
  const gold = useResourceStore((s) => s.gold);
  const wood = useResourceStore((s) => s.wood);
  const stone = useResourceStore((s) => s.stone);
  const addResources = useResourceStore((s) => s.addResources);
  const slots = useWorldStore((s) => s.slots);
  const built = Object.values(slots).filter(Boolean).length;
  const claimed = usePremiumStore((s) => s.claimedRewards);
  const addBattlePassXP = usePremiumStore((s) => s.addBattlePassXP);
  const addElo = useLeagueStore((s) => s.addElo);
  const [detail, setDetail] = useState<BuildingType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const cheapest = useMemo(() => {
    let min = Infinity;
    for (const k of Object.keys(BUILDINGS) as BuildingType[]) {
      const c = BUILDINGS[k].cost;
      min = Math.min(min, c.gold + c.wood + c.stone);
    }
    return min;
  }, []);

  const poor = gold + wood + stone < cheapest;

  const kingdomPct = (built / MAX_BUILDINGS) * 100;
  let rankLabel = 'Settlement';
  if (built >= 15) rankLabel = 'Kingdom';
  else if (built >= 10) rankLabel = 'Town';
  else if (built >= 5) rankLabel = 'Village';

  useEffect(() => {
    try {
      if (built >= 5 && localStorage.getItem(LS_KINGDOM_5) !== '1') {
        localStorage.setItem(LS_KINGDOM_5, '1');
        setToast('🏘️ Village rank!');
      } else if (built >= 10 && localStorage.getItem(LS_KINGDOM_10) !== '1') {
        localStorage.setItem(LS_KINGDOM_10, '1');
        setToast('🏙️ Town rank!');
      } else if (built >= 15 && localStorage.getItem(LS_KINGDOM_15) !== '1') {
        localStorage.setItem(LS_KINGDOM_15, '1');
        setCelebrate(true);
        addBattlePassXP(200);
        addElo(50);
      }
    } catch {
      /* ignore */
    }
  }, [built, addBattlePassXP, addElo]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const watchGoldAd = async () => {
    try {
      if (localStorage.getItem(LS_AD_GOLD) === today()) return;
      const ok = await showRewardedAd({ kind: 'gold', amount: 50 });
      if (ok) {
        addResources(50, 0, 0);
        localStorage.setItem(LS_AD_GOLD, today());
        setToast('+50 Gold 📺');
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-y-auto pb-36 pt-[72px]">
      <ResourceBar />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col gap-4 px-4 pb-4"
      >
        <h1 className="wr-screen-title text-2xl">{t('world.title')}</h1>
        <p className="text-center font-num text-sm text-[var(--text-secondary)]">
          {t('world.resources_line', { g: gold, w: wood, s: stone })}
        </p>
        <p className="text-center font-cinzel text-xs font-semibold text-[#6b5510]">
          {rankLabel} · {built}/{MAX_BUILDINGS} {t('world.buildings_count', { n: built })}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full border border-[#2a2018] bg-[#080608]">
          <div className="h-full bg-[#c9a227] transition-[width]" style={{ width: `${kingdomPct}%` }} />
        </div>
        <div className="fantasy-card mx-auto w-full !p-0">
          <IsometricWorld onBuildingSelect={(ty) => setDetail(ty)} />
        </div>
        {poor ? (
          <button
            type="button"
            className="rounded-[8px] border border-[#2a2018] bg-[#1a1208] px-4 py-3 text-center text-sm text-[#e8dcc8]"
            onClick={() => void watchGoldAd()}
          >
            📺 +50 Gold (watch ad, once/day)
          </button>
        ) : null}
      </motion.div>

      {toast ? (
        <div className="fixed bottom-32 left-1/2 z-[80] -translate-x-1/2 rounded-[8px] border border-[#2a2018] bg-[#1a1208] px-4 py-2 text-sm text-[#f0e6cc]">
          {toast}
        </div>
      ) : null}

      <AnimatePresence>
        {detail ? (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="diablo-modal w-full max-w-sm p-6 text-center"
            >
              <p className="text-4xl drop-shadow-[0_8px_16px_rgba(201,162,39,0.25)]">
                {getBuildingDisplayEmoji(detail, claimed)}
              </p>
              <h2 className="mt-2 font-title text-lg text-[var(--gold-primary)]">{t(buildingNameKey(detail))}</h2>
              <p className="mt-2 font-body text-sm text-[var(--text-secondary)]">{t(buildingDescKey(detail))}</p>
              <button type="button" className="btn-secondary mt-4 w-full min-h-[48px]" onClick={() => setDetail(null)}>
                {t('world.building_detail_close')}
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {celebrate ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-6"
          >
            <div className="fantasy-card max-w-sm p-8 text-center">
              <p className="font-cinzel text-2xl text-[#c9a227]">Kingdom Complete! 👑</p>
              <p className="mt-2 text-sm text-[#e8dcc8]">+200 XP · +50 ELO</p>
              <button type="button" className="fantasy-button mt-6 w-full" onClick={() => setCelebrate(false)}>
                Continue
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <NavigationBar active="world" onNavigate={navigate} />
    </div>
  );
}
