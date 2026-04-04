import { useEffect, useRef } from 'react';
import { useDailyStore } from '../../stores/dailyStore';
import { soundService } from '../../services/soundService';
import { useTranslation } from '../../i18n';

export function StreakDisplay() {
  const { t } = useTranslation();
  const streak = useDailyStore((s) => s.currentStreak);
  const prev = useRef(streak);

  useEffect(() => {
    if (streak > prev.current && streak > 0) {
      soundService.dailyStreak();
    }
    prev.current = streak;
  }, [streak]);

  const glow = streak >= 7;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 font-cinzel text-sm font-medium ${
        glow
          ? 'border-[#c9a227] bg-[rgba(107,85,16,0.22)] text-[#c9a227]'
          : 'border-[#2a2018] bg-[rgba(18,14,10,0.95)] text-[#f0e6cc]'
      }`}
    >
      <span aria-hidden>🔥</span>
      {streak === 0 ? (
        <span className="text-[#8a7060]">{t('home.streak_start')}</span>
      ) : (
        <span>{t('home.streak', { n: streak })}</span>
      )}
    </div>
  );
}
