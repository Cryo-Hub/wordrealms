import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ScreenErrorBoundary } from './components/ui/ScreenErrorBoundary';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { LoadingScreen } from './screens/LoadingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { OnboardingScreen, isOnboardingComplete } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { WorldScreen } from './screens/WorldScreen';
import { LeagueScreen } from './screens/LeagueScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';

const BattlePassScreen = lazy(async () => {
  const m = await import('./screens/BattlePassScreen');
  return { default: m.BattlePassScreen };
});
const ProfileScreen = lazy(async () => {
  const m = await import('./screens/ProfileScreen');
  return { default: m.ProfileScreen };
});
const FreePlayScreen = lazy(async () => {
  const m = await import('./screens/FreePlayScreen');
  return { default: m.FreePlayScreen };
});
import { useDailyStore } from './stores/dailyStore';
import { useLeagueStore } from './stores/leagueStore';
import { useSettingsStore } from './stores/settingsStore';
import { usePremiumStore } from './stores/premiumStore';
import { useEnergyStore } from './stores/energyStore';
import { setLanguage, ensureDictionaryLoaded } from './core/game/dictionaryManager';
import { ensureAuth, GUEST_USER_ID_KEY, getCurrentUser } from './services/supabase/auth';
import { isSupabaseConfigured, supabase } from './services/supabase/client';
import { ensureProfileForUser } from './services/supabase/userProfileService';
import { loadUserProfile } from './services/supabase/database';
import {
  scheduleDailyReminder,
  showLeagueReset,
  syncPermissionFromBrowser,
} from './services/notificationService';
import { InstallPromptBanner } from './components/ui/InstallPromptBanner';
import { initRevenueCat } from './services/revenuecat';
import type { RootScreen } from './types/navigation';

const queryClient = new QueryClient();

const AUTH_STARTUP_TIMEOUT_MS = 5000;

type Gate = 'load' | 'auth' | 'onboard' | 'main';

function ensureLocalGuestId(): void {
  try {
    if (!localStorage.getItem(GUEST_USER_ID_KEY)) {
      localStorage.setItem(GUEST_USER_ID_KEY, crypto.randomUUID());
    }
  } catch {
    /* ignore */
  }
}

function FantasyShell({ children }: { children: ReactNode }) {
  const embers = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);
  return (
    <div className="wr-page-bg min-h-screen">
      <div className="wr-embers" aria-hidden>
        {embers.map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="wr-shell-vignette" aria-hidden />
      <div className="wr-content">{children}</div>
    </div>
  );
}

async function resolveStartupGate(): Promise<Gate> {
  if (isSupabaseConfigured) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await ensureProfileForUser(session.user.id);
      } catch {
        /* weiter ohne Profil */
      }
      return !isOnboardingComplete() ? 'onboard' : 'main';
    }
    return 'auth';
  }

  const u = await getCurrentUser();
  if (!u) return 'auth';
  return !isOnboardingComplete() ? 'onboard' : 'main';
}

function AppRoutes() {
  const [gate, setGate] = useState<Gate>('load');
  const [screen, setScreen] = useState<RootScreen>('home');
  const hydrateFromDate = useDailyStore((s) => s.hydrateFromDate);
  const checkPremium = usePremiumStore((s) => s.checkPremium);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const refillDailyEnergy = useEnergyStore((s) => s.refillDailyEnergy);
  const premiumUnlimitedEnergy = useEnergyStore((s) => s.premiumUnlimited);
  const clampEnergyIfNotPremium = useEnergyStore((s) => s.clampIfNotPremium);

  useEffect(() => {
    hydrateFromDate();
  }, [hydrateFromDate]);

  useEffect(() => {
    refillDailyEnergy();
  }, [refillDailyEnergy]);

  useEffect(() => {
    if (isPremium) premiumUnlimitedEnergy();
    else clampEnergyIfNotPremium();
  }, [isPremium, premiumUnlimitedEnergy, clampEnergyIfNotPremium]);

  useEffect(() => {
    const decayed = useLeagueStore.getState().resetWeeklyIfNeeded();
    if (decayed) showLeagueReset();
  }, []);

  useEffect(() => {
    syncPermissionFromBrowser();
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleDailyReminder();
    }
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      void (async () => {
        try {
          const p = await loadUserProfile();
          if (p?.elo != null) useLeagueStore.setState({ elo: p.elo });
        } catch {
          /* ignore */
        }
      })();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    void checkPremium();
  }, [checkPremium]);

  useEffect(() => {
    if (gate !== 'main') return;
    void (async () => {
      const u = await getCurrentUser();
      if (u?.id) initRevenueCat(u.id);
    })();
  }, [gate]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const t0 = Date.now();
      try {
        if (isSupabaseConfigured) {
          await ensureAuth();
        }
        const lang = useSettingsStore.getState().language;
        setLanguage(lang);
        await ensureDictionaryLoaded();
      } catch (e) {
        console.error(e);
      }

      const authOutcome = await Promise.race([
        resolveStartupGate().then((g) => ({ kind: 'ok' as const, g })),
        new Promise<{ kind: 'timeout' }>((resolve) => {
          setTimeout(() => resolve({ kind: 'timeout' }), AUTH_STARTUP_TIMEOUT_MS);
        }),
      ]);

      let nextGate: Gate = 'auth';
      if (!alive) return;

      if (authOutcome.kind === 'timeout') {
        ensureLocalGuestId();
        nextGate = !isOnboardingComplete() ? 'onboard' : 'main';
      } else {
        nextGate = authOutcome.g;
      }

      const dt = Date.now() - t0;
      if (dt < 1500) await new Promise((r) => setTimeout(r, 1500 - dt));
      if (!alive) return;
      setGate(nextGate);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goMain = () => setGate('main');

  if (gate === 'load') {
    return <LoadingScreen />;
  }
  if (gate === 'auth') {
    return (
      <AuthScreen
        onAuthed={() => {
          void (async () => {
            if (isSupabaseConfigured) {
              const { data } = await supabase.auth.getUser();
              if (data.user) {
                try {
                  await ensureProfileForUser(data.user.id);
                } catch {
                  /* ignore */
                }
              }
            }
            const u = await getCurrentUser();
            if (!u) return;
            if (!isOnboardingComplete()) setGate('onboard');
            else setGate('main');
          })();
        }}
      />
    );
  }
  if (gate === 'onboard') {
    return (
      <FantasyShell>
        <OnboardingScreen onFinish={goMain} />
      </FantasyShell>
    );
  }

  const navigate = (s: RootScreen) => setScreen(s);

  const isPlayScreen = screen === 'game' || screen === 'freeplay';

  useEffect(() => {
    if (gate !== 'main') return;
    usePremiumStore.getState().refillDailyHintsIfNeeded();
  }, [gate]);

  return (
    <FantasyShell>
      {screen !== 'game' && screen !== 'freeplay' ? <OfflineIndicator /> : null}
      <InstallPromptBanner />
      <div
        className={
          isPlayScreen
            ? 'min-h-0 h-[100dvh] w-full overflow-x-hidden overflow-y-hidden text-[var(--text-primary)] antialiased'
            : 'min-h-screen max-h-[100dvh] w-full overflow-x-hidden overflow-y-auto text-[var(--text-primary)] antialiased'
        }
      >
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={
                isPlayScreen
                  ? 'min-h-0 h-full w-full overflow-x-hidden overflow-y-hidden'
                  : 'w-full overflow-x-hidden overflow-y-visible'
              }
            >
              <ScreenErrorBoundary>
                {screen === 'home' ? (
                  <HomeScreen navigate={navigate} />
                ) : screen === 'game' ? (
                  <GameScreen navigate={navigate} />
                ) : screen === 'freeplay' ? (
                  <FreePlayScreen navigate={navigate} />
                ) : screen === 'world' ? (
                  <WorldScreen navigate={navigate} />
                ) : screen === 'league' ? (
                  <LeagueScreen navigate={navigate} />
                ) : screen === 'settings' ? (
                  <SettingsScreen navigate={navigate} />
                ) : screen === 'shop' ? (
                  <ShopScreen navigate={navigate} />
                ) : screen === 'battlepass' ? (
                  <BattlePassScreen navigate={navigate} />
                ) : screen === 'profile' ? (
                  <ProfileScreen navigate={navigate} />
                ) : (
                  <HomeScreen navigate={navigate} />
                )}
              </ScreenErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </FantasyShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
