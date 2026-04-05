import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENERGY_UNLIMITED_THRESHOLD, useEnergyStore } from '../../stores/energyStore';
import { usePremiumStore } from '../../stores/premiumStore';
import { useTranslation } from '../../i18n';

type EnergyBarProps = {
  compact?: boolean;
};

export function EnergyBar({ compact }: EnergyBarProps) {
  const { t } = useTranslation();
  const energy = useEnergyStore((s) => s.energy);
  const maxEnergy = useEnergyStore((s) => s.maxEnergy);
  const watchAdForEnergy = useEnergyStore((s) => s.watchAdForEnergy);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const unlimited = isPremium && energy >= ENERGY_UNLIMITED_THRESHOLD;
  const displaySlots = maxEnergy;
  const filled = unlimited ? maxEnergy : Math.min(energy, maxEnergy);

  const openAdPrompt = () => {
    if (unlimited || isPremium) return;
    setModal(true);
  };

  const runAd = () => {
    setBusy(true);
    void watchAdForEnergy().then(() => {
      setBusy(false);
      setModal(false);
    });
  };

  return (
    <>
      <div
        className={`flex items-center gap-0.5 ${compact ? 'text-lg' : 'text-xl'}`}
        title={t('energy.bar_title')}
      >
        {unlimited ? (
          <span className="font-num font-semibold text-[#c9a227]">∞</span>
        ) : (
          Array.from({ length: displaySlots }).map((_, i) => {
            const on = i < filled;
            return (
              <motion.button
                key={i}
                type="button"
                initial={false}
                animate={{ scale: on ? 1 : 0.92, opacity: on ? 1 : 0.35 }}
                className="min-h-[44px] min-w-[44px] p-1 leading-none"
                onClick={() => {
                  if (!on && !isPremium) openAdPrompt();
                }}
                aria-label={on ? t('energy.slot_filled') : t('energy.slot_empty')}
              >
                {on ? '⚡' : '⚫'}
              </motion.button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {modal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              className="fantasy-card max-w-sm p-6 text-center"
            >
              <p className="font-cinzel text-lg text-[#c9a227]">{t('energy.ad_title')}</p>
              <button
                type="button"
                disabled={busy}
                className="fantasy-button mt-4 w-full"
                onClick={runAd}
              >
                {t('energy.ad_confirm')}
              </button>
              <button type="button" className="btn-secondary mt-2 w-full py-2 text-sm" onClick={() => setModal(false)}>
                {t('energy.ad_cancel')}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
