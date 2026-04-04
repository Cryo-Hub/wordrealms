import { motion } from 'framer-motion';
import type { BuildingType } from '../../../core/world/buildingConfig';
import { getBuildingDisplayEmoji } from '../../../core/game/buildingDisplay';
import { usePremiumStore } from '../../../stores/premiumStore';
import { useTranslation } from '../../../i18n';
import { buildingDescKey, buildingNameKey } from '../../../i18n/buildingKeys';

type BuildingProps = {
  type: BuildingType;
  size: number;
  onSelect?: (type: BuildingType) => void;
};

export function Building({ type, size, onSelect }: BuildingProps) {
  const { t } = useTranslation();
  const claimed = usePremiumStore((s) => s.claimedRewards);
  const emoji = getBuildingDisplayEmoji(type, claimed);
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="group relative flex cursor-pointer items-center justify-center"
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(type);
      }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        <span className="text-5xl leading-none drop-shadow-lg select-none">{emoji}</span>
      </motion.div>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-[200px] -translate-x-1/2 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 text-center text-xs shadow-xl group-hover:block group-focus-visible:block">
        <div className="font-cinzel font-semibold text-[var(--text-primary)]">{t(buildingNameKey(type))}</div>
        <div className="font-body text-[var(--text-secondary)]">{t(buildingDescKey(type))}</div>
      </div>
    </motion.div>
  );
}
