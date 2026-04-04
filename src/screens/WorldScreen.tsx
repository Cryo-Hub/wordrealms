import { useMemo, useState } from 'react';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { IsometricWorld } from '../components/world/IsometricWorld/IsometricWorld';
import { NavigationBar } from '../components/ui/NavigationBar';
import { RewardedAdButton } from '../components/monetization/RewardedAdButton';
import { useResourceStore } from '../stores/resourceStore';
import { useWorldStore } from '../stores/worldStore';
import { BUILDINGS, type BuildingType } from '../core/world/buildingConfig';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';
import { buildingDescKey, buildingNameKey } from '../i18n/buildingKeys';

type WorldScreenProps = {
  navigate: (s: RootScreen) => void;
};

function kingdomLevel(count: number): number {
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

export function WorldScreen({ navigate }: WorldScreenProps) {
  const { t } = useTranslation();
  const gold = useResourceStore((s) => s.gold);
  const wood = useResourceStore((s) => s.wood);
  const stone = useResourceStore((s) => s.stone);
  const slots = useWorldStore((s) => s.slots);
  const built = Object.values(slots).filter(Boolean).length;
  const [detail, setDetail] = useState<BuildingType | null>(null);

  const cheapest = useMemo(() => {
    let min = Infinity;
    for (const k of Object.keys(BUILDINGS) as BuildingType[]) {
      const c = BUILDINGS[k].cost;
      min = Math.min(min, c.gold + c.wood + c.stone);
    }
    return min;
  }, []);

  const poor = gold + wood + stone < cheapest;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col pb-36 pt-[72px]">
      <ResourceBar />
      <div className="flex w-full flex-1 flex-col gap-4 px-4">
        <h1 className="wr-screen-title text-2xl">{t('world.title')}</h1>
        <p className="text-center font-num text-sm text-[var(--text-secondary)]">
          {t('world.resources_line', { g: gold, w: wood, s: stone })}
        </p>
        <p className="text-center font-cinzel text-xs font-semibold text-[#6b5510]">
          {t('world.level', { n: kingdomLevel(built) })} · {t('world.buildings_count', { n: built })}
        </p>
        <div className="fantasy-card mx-auto w-full !p-0">
          <IsometricWorld onBuildingSelect={(t) => setDetail(t)} />
        </div>
        {poor ? <RewardedAdButton /> : null}
      </div>

      {detail ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="diablo-modal w-full max-w-sm p-6 text-center">
            <p className="text-4xl drop-shadow-[0_8px_16px_rgba(201,162,39,0.25)]">{BUILDINGS[detail].emoji}</p>
            <h2 className="mt-2 font-title text-lg text-[var(--gold-primary)]">{t(buildingNameKey(detail))}</h2>
            <p className="mt-2 font-body text-sm text-[var(--text-secondary)]">{t(buildingDescKey(detail))}</p>
            <button type="button" className="btn-secondary mt-4 w-full min-h-[48px]" onClick={() => setDetail(null)}>
              {t('world.building_detail_close')}
            </button>
          </div>
        </div>
      ) : null}

      <NavigationBar active="world" onNavigate={navigate} />
    </div>
  );
}
