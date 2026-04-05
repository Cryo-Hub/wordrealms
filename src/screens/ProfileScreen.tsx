import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationBar } from '../components/ui/NavigationBar';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';
import { LanguageGrid } from '../components/settings/LanguageGrid';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import { useDailyStore } from '../stores/dailyStore';
import { useLeagueStore } from '../stores/leagueStore';
import { useResourceStore } from '../stores/resourceStore';
import { useWorldStore } from '../stores/worldStore';
import { usePremiumStore } from '../stores/premiumStore';
import { purchaseBattlePass, restorePurchases } from '../services/revenuecat';
import { useSettingsStore } from '../stores/settingsStore';
import { loadUserProfile, saveUserProfile } from '../services/supabase/database';
import { getCurrentUser } from '../services/supabase/auth';
import { isSupabaseConfigured } from '../services/supabase/client';
import { updateProfile } from '../services/supabase/userProfileService';
import { syncPermissionFromBrowser, scheduleDailyReminder } from '../services/notificationService';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';
import { getLeague } from '../core/game/leagueSystem';

const AVATARS = ['⚔️', '🛡️', '👑', '🐉', '🔥', '⚡', '🌙', '🏹', '🪓', '🧙', '🗡️', '🦅'];

const LS_USERNAME = 'wr-profile-username';
const LS_AVATAR = 'wr-profile-avatar';
const LS_FIRST = 'wr-first-launch';
const LS_NOTIF = 'wr-settings-notifications';

function firstLaunchMs(): number {
  try {
    const x = localStorage.getItem(LS_FIRST);
    if (x) return parseInt(x, 10);
    const n = Date.now();
    localStorage.setItem(LS_FIRST, String(n));
    return n;
  } catch {
    return Date.now();
  }
}

type ProfileScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function ProfileScreen({ navigate }: ProfileScreenProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguageSetting = useSettingsStore((s) => s.setLanguageSetting);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);

  const totalWords = useDailyStore((s) => s.totalWordsAllTime);
  const bestStreak = useDailyStore((s) => s.bestStreakEver);
  const puzzlesCompleted = useDailyStore((s) => s.puzzlesCompleted);
  const streak = useDailyStore((s) => s.currentStreak);
  const elo = useLeagueStore((s) => s.elo);
  const tg = useResourceStore((s) => s.totalGoldEarned);
  const tw = useResourceStore((s) => s.totalWoodEarned);
  const ts = useResourceStore((s) => s.totalStoneEarned);
  const slots = useWorldStore((s) => s.slots);
  const built = useMemo(() => Object.values(slots).filter(Boolean).length, [slots]);

  const bpLevel = usePremiumStore((s) => s.battlePassLevel);
  const bpXp = usePremiumStore((s) => s.battlePassXP);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const checkPremium = usePremiumStore((s) => s.checkPremium);

  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem(LS_USERNAME) ?? '';
    } catch {
      return '';
    }
  });
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem(LS_AVATAR) ?? '⚔️';
    } catch {
      return '⚔️';
    }
  });
  const [notif, setNotif] = useState(() => {
    try {
      return localStorage.getItem(LS_NOTIF) !== '0';
    } catch {
      return true;
    }
  });
  const [resetOpen, setResetOpen] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [miniToast, setMiniToast] = useState<string | null>(null);

  const seasonEnd = useMemo(() => {
    const d = new Date(firstLaunchMs());
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString();
  }, []);

  useEffect(() => {
    void (async () => {
      const remote = await loadUserProfile();
      if (remote?.username) setUsername(remote.username);
      if (remote?.avatar) setAvatar(remote.avatar);
    })();
  }, []);

  const persistUsername = useCallback(
    (u: string) => {
      try {
        localStorage.setItem(LS_USERNAME, u);
      } catch {
        /* ignore */
      }
      void (async () => {
        const user = await getCurrentUser();
        if (user && isSupabaseConfigured) {
          try {
            await updateProfile(user.id, { username: u });
          } catch (e) {
            console.error(e);
          }
        }
        await saveUserProfile({ username: u, avatar, elo, league: getLeague(elo) });
      })();
    },
    [avatar, elo],
  );

  const persistAvatar = useCallback(
    (a: string) => {
      setAvatar(a);
      try {
        localStorage.setItem(LS_AVATAR, a);
      } catch {
        /* ignore */
      }
      void saveUserProfile({ username, avatar: a, elo, league: getLeague(elo) });
    },
    [username, elo],
  );

  const tabNav = (s: RootScreen) => {
    if (s === 'home' || s === 'game' || s === 'world' || s === 'league') navigate(s);
  };

  const resetAll = () => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-y-auto pb-28 pt-[72px]">
      <ResourceBar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 px-4 pb-4"
      >
        <h1 className="wr-screen-title text-xl">Profile</h1>
        <OrnamentDivider size="sm" />

        <section className="fantasy-card space-y-3">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">PLAYER INFO</h2>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className={`rounded-lg border p-2 text-2xl ${avatar === a ? 'border-[#c9a227]' : 'border-[#2a2018]'}`}
                onClick={() => persistAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <label className="block font-body text-xs text-[#a89880]">Username</label>
          <input
            className="w-full rounded-[8px] border border-[#2a2018] bg-[#080608] px-3 py-2 font-body text-[#f0e6cc]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => persistUsername(username.trim())}
          />
          <p className="text-xs text-[#6b6358]">
            Member since {new Date(firstLaunchMs()).toLocaleDateString()}
          </p>
        </section>

        <section className="fantasy-card space-y-2">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">STATS</h2>
          <p className="font-body text-sm">Total words: {totalWords}</p>
          <p className="font-body text-sm">Best streak: {bestStreak}</p>
          <p className="font-body text-sm">Puzzles completed: {puzzlesCompleted}</p>
          <p className="font-body text-sm">
            Totals earned — G: {tg} W: {tw} S: {ts}
          </p>
          <p className="font-body text-sm">Buildings: {built}</p>
          <p className="font-body text-sm">Current streak: {streak}</p>
          <div className="flex items-center gap-3">
            <LeagueBadge elo={elo} size="sm" />
          </div>
        </section>

        <section className="fantasy-card space-y-2">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">BATTLE PASS</h2>
          <p className="font-body text-sm">
            Level {bpLevel} · {bpXp}/100 XP
          </p>
          <p className="text-xs text-[#6b6358]">Season ends: {seasonEnd}</p>
          <button type="button" className="fantasy-button w-full py-2 text-sm" onClick={() => navigate('battlepass')}>
            View Battle Pass
          </button>
        </section>

        <section className="fantasy-card space-y-3">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">SETTINGS</h2>
          <LanguageGrid selected={language} onSelect={setLanguageSetting} />
          <label className="flex items-center justify-between gap-2 font-body text-sm">
            <span>Sound</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-2 font-body text-sm">
            <span>Haptics</span>
            <input
              type="checkbox"
              checked={hapticEnabled}
              onChange={(e) => setHapticEnabled(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-2 font-body text-sm">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={notif}
              onChange={(e) => {
                setNotif(e.target.checked);
                try {
                  localStorage.setItem(LS_NOTIF, e.target.checked ? '1' : '0');
                } catch {
                  /* ignore */
                }
                syncPermissionFromBrowser();
                if (e.target.checked && typeof Notification !== 'undefined') {
                  void Notification.requestPermission().then(() => scheduleDailyReminder());
                }
              }}
            />
          </label>
        </section>

        <section className="fantasy-card space-y-2">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">PREMIUM</h2>
          {!isPremium ? (
            <button
              type="button"
              disabled={purchaseBusy}
              className="fantasy-button relative w-full disabled:opacity-60"
              onClick={() => void (async () => {
                setPurchaseBusy(true);
                try {
                  const r = await purchaseBattlePass();
                  if (!r.ok) {
                    if (r.cancelled) {
                      setMiniToast('Purchase cancelled');
                      window.setTimeout(() => setMiniToast(null), 2200);
                    }
                  } else {
                    await checkPremium();
                  }
                } finally {
                  setPurchaseBusy(false);
                }
              })()}
            >
              {purchaseBusy ? 'Processing…' : 'Unlock Battle Pass'}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[#6b8f6b]">✅ Premium Active · Restore Purchases</p>
              <button
                type="button"
                disabled={purchaseBusy}
                className="btn-secondary w-full py-2 text-sm"
                onClick={() => void (async () => {
                  setPurchaseBusy(true);
                  try {
                    await restorePurchases();
                    await checkPremium();
                  } finally {
                    setPurchaseBusy(false);
                  }
                })()}
              >
                Restore Purchases
              </button>
            </div>
          )}
        </section>

        <section className="fantasy-card space-y-2">
          <h2 className="font-cinzel text-sm font-bold text-[#c9a227]">LEGAL</h2>
          <button
            type="button"
            className="w-full text-left font-body text-sm text-[#a89880] underline underline-offset-2"
            onClick={() => window.open('/privacy.html', '_blank', 'noopener,noreferrer')}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className="w-full text-left font-body text-sm text-[#a89880] underline underline-offset-2"
            onClick={() => window.open('/terms.html', '_blank', 'noopener,noreferrer')}
          >
            Terms of Service
          </button>
        </section>

        <section className="fantasy-card border border-[#4a2020]">
          <h2 className="font-cinzel text-sm font-bold text-[#c45c5c]">DANGER ZONE</h2>
          <button type="button" className="mt-2 w-full rounded-[8px] border border-[#6b2a2a] py-2 text-sm text-[#e8a0a0]" onClick={() => setResetOpen(true)}>
            Reset Progress
          </button>
        </section>

        <button type="button" className="btn-secondary w-full py-2" onClick={() => navigate('home')}>
          {t('modal.close')}
        </button>
      </motion.div>

      {resetOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="fantasy-card max-w-sm p-6 text-center">
            <p className="font-body text-sm">Erase all local progress?</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setResetOpen(false)}>
                Cancel
              </button>
              <button type="button" className="fantasy-button flex-1 bg-[#5c2020]" onClick={resetAll}>
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <NavigationBar active="home" onNavigate={tabNav} />

      {miniToast ? (
        <div className="fixed bottom-28 left-1/2 z-[100] max-w-[min(100vw-2rem,20rem)] -translate-x-1/2 rounded-[8px] border border-[#2a2018] bg-[#1a1208] px-4 py-2 text-center text-sm text-[#f0e6cc]">
          {miniToast}
        </div>
      ) : null}
    </div>
  );
}
