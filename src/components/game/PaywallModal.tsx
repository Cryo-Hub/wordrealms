import { motion } from 'framer-motion';
import { usePremiumStore } from '../../stores/premiumStore';

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
};

const LS_PAYWALL_DAY = 'wordrealms-paywall-shown';

export function shouldShowPaywallAuto(puzzlesCompleted: number, bpLevel: number): boolean {
  try {
    const day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(LS_PAYWALL_DAY) === day) return false;
  } catch {
    /* ignore */
  }
  return puzzlesCompleted >= 3 || bpLevel >= 5;
}

export function markPaywallShownToday(): void {
  try {
    localStorage.setItem(LS_PAYWALL_DAY, new Date().toISOString().slice(0, 10));
  } catch {
    /* ignore */
  }
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const purchasePremium = usePremiumStore((s) => s.purchasePremium);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <motion.div
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="fantasy-card w-full max-w-sm border border-[#c9a227] p-6 text-center shadow-[0_0_32px_rgba(201,162,39,0.25)]"
      >
        <h2 className="font-cinzel text-xl font-bold text-[#c9a227]">⚔️ Unlock Battle Pass</h2>
        <ul className="mt-4 space-y-2 text-left font-body text-sm text-[#e8dcc8]">
          <li>• Premium rewards on every level</li>
          <li>• Exclusive skins &amp; frames</li>
          <li>• Bonus hints every day</li>
          <li>• ⚡ Unlimited Free Play energy</li>
        </ul>
        <p className="mt-4 font-num text-lg text-[#f0e6cc]">9,99€/month</p>
        <button
          type="button"
          className="fantasy-button mt-4 w-full min-h-[48px] shadow-[0_0_20px_rgba(201,162,39,0.35)]"
          onClick={() => {
            purchasePremium();
            markPaywallShownToday();
            onClose();
          }}
        >
          UNLOCK
        </button>
        <button type="button" className="btn-secondary mt-3 w-full py-2 text-sm" onClick={onClose}>
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
}
