import { useEffect, useState } from 'react';
import { usePremiumStore } from '../../stores/premiumStore';
import type { RootScreen } from '../../types/navigation';
import { useTranslation } from '../../i18n';

const DISMISS_KEY = 'wordrealms-premium-dismiss';

type PremiumBannerProps = {
  navigate: (s: RootScreen) => void;
};

export function PremiumBanner({ navigate }: PremiumBannerProps) {
  const { t } = useTranslation();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored && Date.now() - Number(stored) < 24 * 60 * 60 * 1000) setHidden(true);
    else setHidden(false);
  }, []);

  if (isPremium || hidden) return null;

  return (
    <div className="fantasy-card mx-auto mb-1 flex max-w-[430px] items-center gap-2 !py-2 !px-3 text-xs text-[#c9a227]">
      <button
        type="button"
        className="min-h-[44px] flex-1 text-left font-cinzel font-medium"
        onClick={() => navigate('shop')}
      >
        {t('premium.banner')}
      </button>
      <button
        type="button"
        className="btn-icon min-h-[44px] min-w-[44px] px-2"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
          setHidden(true);
        }}
        aria-label={t('premium.dismiss')}
      >
        ✕
      </button>
    </div>
  );
}
