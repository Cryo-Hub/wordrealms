import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationBar } from '../components/ui/NavigationBar';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { BATTLE_PASS_REWARDS, type BattlePassReward } from '../core/game/battlePassData';
import { usePremiumStore } from '../stores/premiumStore';
import { useResourceStore } from '../stores/resourceStore';
import type { RootScreen } from '../types/navigation';
import { PaywallModal } from '../components/game/PaywallModal';
import { purchaseBattlePass, restorePurchases } from '../services/revenuecat';

const XP_MAX = 100;

type BattlePassScreenProps = {
  navigate: (s: RootScreen) => void;
};

function levelRewards(level: number): { free: BattlePassReward; premium: BattlePassReward } {
  const free = BATTLE_PASS_REWARDS.find((r) => r.level === level && r.track === 'free')!;
  const premium = BATTLE_PASS_REWARDS.find((r) => r.level === level && r.track === 'premium')!;
  return { free, premium };
}

export function BattlePassScreen({ navigate }: BattlePassScreenProps) {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const battlePassLevel = usePremiumStore((s) => s.battlePassLevel);
  const battlePassXP = usePremiumStore((s) => s.battlePassXP);
  const claimedRewards = usePremiumStore((s) => s.claimedRewards);
  const claimReward = usePremiumStore((s) => s.claimReward);
  const addHints = usePremiumStore((s) => s.addHints);
  const addResources = useResourceStore((s) => s.addResources);
  const [toast, setToast] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const checkPremium = usePremiumStore((s) => s.checkPremium);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  const applyReward = useCallback(
    (r: BattlePassReward) => {
      switch (r.type) {
        case 'gold':
          addResources(r.amount ?? 0, 0, 0);
          break;
        case 'wood':
          addResources(0, r.amount ?? 0, 0);
          break;
        case 'stone':
          addResources(0, 0, r.amount ?? 0);
          break;
        case 'hint':
          addHints(r.amount ?? 0);
          break;
        default:
          break;
      }
      claimReward(r.id);
      if (r.type === 'skin' || r.type === 'badge' || r.type === 'avatar' || r.type === 'border') {
        showToast(`Unlocked: ${r.label}`);
      } else {
        showToast(`Claimed: ${r.label}`);
      }
    },
    [addHints, addResources, claimReward, showToast],
  );

  const canClaim = (r: BattlePassReward): boolean => {
    if (claimedRewards.includes(r.id)) return false;
    if (battlePassLevel < r.level) return false;
    if (r.track === 'premium' && !isPremium) return false;
    return true;
  };

  const onClaim = (r: BattlePassReward) => {
    if (r.track === 'premium' && !isPremium) {
      setPaywall(true);
      return;
    }
    if (claimedRewards.includes(r.id)) return;
    if (battlePassLevel < r.level) return;
    if (!canClaim(r)) return;
    applyReward(r);
  };

  const xpPct = useMemo(() => (battlePassXP / XP_MAX) * 100, [battlePassXP]);

  const tabNav = (t: RootScreen) => {
    if (t === 'home' || t === 'game' || t === 'world' || t === 'league') navigate(t);
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-y-auto pb-28 pt-[72px]">
      <ResourceBar />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 px-4 pb-4"
      >
        <h1 className="text-center font-cinzel text-lg font-bold text-[#c9a227]">
          ⚔️ BATTLE PASS · Season 1
        </h1>
        <div className="rounded-[10px] border border-[#2a2018] bg-[#080608] p-3">
          <p className="text-center font-num text-sm text-[#a89880]">
            Level {battlePassLevel} · {battlePassXP}/{XP_MAX} XP
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a1208]">
            <div className="h-full bg-[#c9a227]" style={{ width: `${Math.min(100, xpPct)}%` }} />
          </div>
        </div>
        {!isPremium ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={purchaseBusy}
              className="relative rounded-[10px] border border-[#c9a227] bg-gradient-to-r from-[#3d3510] to-[#2a2018] px-4 py-3 text-center font-cinzel font-bold text-[#f0e6cc] shadow-[0_0_24px_rgba(201,162,39,0.45)] disabled:opacity-60"
              onClick={() => void (async () => {
                setPurchaseBusy(true);
                try {
                  const r = await purchaseBattlePass();
                  if (!r.ok) {
                    if (r.cancelled) showToast('Purchase cancelled');
                    else setPaywall(true);
                  } else {
                    showToast('Premium unlocked');
                    await checkPremium();
                  }
                } finally {
                  setPurchaseBusy(false);
                }
              })()}
            >
              {purchaseBusy ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" aria-hidden />
                  Processing…
                </span>
              ) : (
                'UNLOCK — 9,99€/month'
              )}
            </button>
            <button
              type="button"
              disabled={purchaseBusy}
              className="text-center font-cinzel text-xs text-[#8a7060] underline underline-offset-2"
              onClick={() => void (async () => {
                setPurchaseBusy(true);
                try {
                  const ok = await restorePurchases();
                  await checkPremium();
                  if (ok) showToast('Purchases restored');
                } finally {
                  setPurchaseBusy(false);
                }
              })()}
            >
              Restore Purchases
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-[#6b8f6b]">✅ Premium Active</p>
        )}

        <div className="space-y-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((lvl) => {
            const { free, premium } = levelRewards(lvl);
            return (
              <div
                key={lvl}
                className="rounded-[10px] border border-[#2a2018] bg-[rgba(12,9,6,0.9)] p-3"
              >
                <p className="font-cinzel text-xs font-bold text-[#c9a227]">Level {lvl}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <RewardRow
                    r={free}
                    claimed={claimedRewards.includes(free.id)}
                    claimable={canClaim(free)}
                    onClaim={() => onClaim(free)}
                  />
                  <div className={!isPremium ? 'blur-sm' : ''}>
                    <RewardRow
                      r={premium}
                      claimed={claimedRewards.includes(premium.id)}
                      claimable={canClaim(premium)}
                      premiumLocked={!isPremium && battlePassLevel >= lvl}
                      onClaim={() => onClaim(premium)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {toast ? (
        <div className="fixed bottom-28 left-1/2 z-[100] -translate-x-1/2 rounded-[8px] border border-[#2a2018] bg-[#1a1208] px-4 py-2 text-sm text-[#f0e6cc]">
          {toast}
        </div>
      ) : null}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
      <NavigationBar active="home" onNavigate={tabNav} />
    </div>
  );
}

function RewardRow({
  r,
  claimed,
  claimable,
  premiumLocked,
  onClaim,
}: {
  r: BattlePassReward;
  claimed: boolean;
  claimable: boolean;
  premiumLocked?: boolean;
  onClaim: () => void;
}) {
  const label = `${r.icon} ${r.label}${r.amount != null ? ` (${r.amount})` : ''}`;
  const unlockPremium = premiumLocked && r.track === 'premium';
  return (
    <div className="flex flex-col gap-1 rounded-[8px] border border-[#2a2018] p-2">
      <p className="text-[10px] uppercase text-[#6b6358]">{r.track}</p>
      <p className="font-body text-xs text-[#e8dcc8]">{label}</p>
      <button
        type="button"
        disabled={claimed || (!claimable && !unlockPremium)}
        onClick={onClaim}
        className={`mt-1 rounded-[6px] py-1.5 text-xs font-semibold ${
          claimed
            ? 'bg-[#3d3510] text-[#c9a227]'
            : unlockPremium
              ? 'bg-[#3d3510] text-[#c9a227] shadow-[0_0_12px_rgba(201,162,39,0.4)]'
              : claimable
                ? 'bg-[#1e3d1e] text-[#a8d4a8]'
                : 'bg-[#1a1510] text-[#5c5448]'
        }`}
      >
        {claimed ? 'Claimed' : unlockPremium ? 'UNLOCK' : claimable ? 'Claim' : 'Locked'}
      </button>
    </div>
  );
}
