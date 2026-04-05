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
      className="relative mx-auto flex h-[100dvh] min-h-0 w-full max-w-full flex-col overflow-hidden md:max-w-[480px]"
      style={{ paddingBottom: NAV_SAFE_BOTTOM }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DailyPuzzle onNavigate={navigate} />
      </div>
      <NavigationBar active="game" onNavigate={navigate} />
    </div>
  );
}
