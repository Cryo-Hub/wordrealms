import { useEffect } from 'react';
import { DailyPuzzle } from '../components/daily/DailyPuzzle';
import { NavigationBar } from '../components/ui/NavigationBar';
import { useGameStore } from '../stores/gameStore';
import type { RootScreen } from '../types/navigation';

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
    <div className="relative mx-auto flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-[430px] flex-col overflow-hidden pt-0 pb-20">
      <DailyPuzzle onNavigate={navigate} />
      <NavigationBar active="game" onNavigate={navigate} />
    </div>
  );
}
