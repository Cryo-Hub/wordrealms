import { useTranslation } from '../../../i18n';

type BuildingSlotProps = {
  slotId: number;
  size: number;
  onBuildClick: (slotId: number) => void;
};

export function BuildingSlot({ slotId, size, onBuildClick }: BuildingSlotProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onBuildClick(slotId)}
      className="group relative flex flex-col items-center justify-center gap-0.5 rounded-[8px] border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/80 text-[var(--text-muted)] transition hover:border-[var(--border-gold)] hover:bg-[var(--bg-stone)] hover:text-[var(--gold-light)] active:scale-95"
      style={{ width: size, height: size }}
    >
      <span className="text-2xl font-light leading-none text-slate-500 group-hover:text-amber-400">+</span>
      <span className="text-[10px] font-medium uppercase leading-tight tracking-wide">
        {t('building.slot_build')}
      </span>
      <span className="pointer-events-none absolute -top-7 left-1/2 hidden w-max -translate-x-1/2 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-0.5 font-cinzel text-[10px] text-[var(--text-secondary)] shadow-md group-hover:block">
        {t('building.slot_tooltip')}
      </span>
    </button>
  );
}
