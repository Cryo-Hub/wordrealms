import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BUILDINGS,
  BUILDING_TYPES,
  type BuildingType,
} from '../../../core/world/buildingConfig';
import { useResourceStore } from '../../../stores/resourceStore';
import { useWorldStore } from '../../../stores/worldStore';
import { useLeagueStore } from '../../../stores/leagueStore';
import { soundService } from '../../../services/soundService';
import { useTranslation } from '../../../i18n';
import { buildingDescKey, buildingNameKey } from '../../../i18n/buildingKeys';
import { OrnamentDivider } from '../../ui/OrnamentDivider';

type ConstructionModalProps = {
  slotId: number | null;
  onClose: () => void;
};

function canAfford(
  gold: number,
  wood: number,
  stone: number,
  cost: { gold: number; wood: number; stone: number },
): boolean {
  return gold >= cost.gold && wood >= cost.wood && stone >= cost.stone;
}

export function ConstructionModal({ slotId, onClose }: ConstructionModalProps) {
  const { t } = useTranslation();
  const gold = useResourceStore((s) => s.gold);
  const wood = useResourceStore((s) => s.wood);
  const stone = useResourceStore((s) => s.stone);
  const spendResources = useResourceStore((s) => s.spendResources);
  const buildStructure = useWorldStore((s) => s.buildStructure);
  const addElo = useLeagueStore((s) => s.addElo);
  const [error, setError] = useState<string | null>(null);

  if (slotId === null) return null;

  const handleConfirm = (type: BuildingType) => {
    setError(null);
    const def = BUILDINGS[type];
    const ok = spendResources(def.cost.gold, def.cost.wood, def.cost.stone);
    if (!ok) {
      setError(t('modal.cant_afford'));
      return;
    }
    buildStructure(slotId, type);
    addElo(5);
    soundService.buildingPlaced();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="construction-title"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fantasy-card relative max-h-[90vh] w-full max-w-[430px] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-icon absolute right-3 top-3"
          aria-label={t('modal.close')}
        >
          ✕
        </button>
        <h2 id="construction-title" className="font-title pr-10 text-lg text-[var(--gold-primary)]">
          {t('modal.build_heading')}
        </h2>
        <p className="mt-1 font-body text-sm text-[var(--text-secondary)]">{t('modal.choose_slot', { n: slotId + 1 })}</p>
        <OrnamentDivider size="sm" className="my-3" />

        {error ? (
          <p className="font-body text-sm text-[var(--blood-light)]" role="alert">
            {error}
          </p>
        ) : null}

        <ul className="mt-4 grid gap-3">
          {BUILDING_TYPES.map((type) => {
            const b = BUILDINGS[type];
            const affordable = canAfford(gold, wood, stone, b.cost);
            return (
              <li
                key={type}
                className={`diablo-card border border-[var(--border-subtle)] p-3 transition ${
                  affordable ? 'opacity-100' : 'opacity-55'
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-4xl">{b.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-cinzel font-semibold text-[var(--text-primary)]">{t(buildingNameKey(type))}</div>
                    <p className="mt-0.5 font-body text-sm text-[var(--text-secondary)]">{t(buildingDescKey(type))}</p>
                    <p className="mt-2 font-body text-xs text-[var(--text-muted)]">
                      🪙 {b.cost.gold} · 🪵 {b.cost.wood} · 🪨 {b.cost.stone}
                    </p>
                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => handleConfirm(type)}
                      className="fantasy-button mt-3 w-full py-2 text-sm disabled:cursor-not-allowed"
                    >
                      {t('modal.confirm')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
