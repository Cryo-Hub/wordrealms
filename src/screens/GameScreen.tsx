import { useEffect } from 'react';
import { DailyPuzzle } from '../components/daily/DailyPuzzle';
import { NavigationBar } from '../components/ui/NavigationBar';
import { useGameStore } from '../stores/gameStore';
import type { RootScreen } from '../types/navigation';

/** Abstand zum fixierten Navigations-Bar (Höhe + Safe Area), damit Inhalt nicht darunter liegt. */
const NAV_SAFE_BOTTOM = 'calc(4.75rem + env(safe-area-inset-bottom, 0px))';

type GameScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function GameScreen({ navigate }: GameScreenProps) {
  const resetSession = useGameStore((s) => s.resetSession);
  const startSession = useGameStore((s) => s.startSession);

  useEffect(() => {
    resetSession();
    startSession();
  }, [resetSession, startSession]);

  return (
    <div
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-full flex-col md:max-w-[480px]"
      style={{ paddingBottom: NAV_SAFE_BOTTOM }}
    >
      <DailyPuzzle onNavigate={navigate} />
      <NavigationBar active="game" onNavigate={navigate} />
    </div>
  );
}
