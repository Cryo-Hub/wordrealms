import { useEffect, useState } from 'react';
import { ResourceBar } from '../components/game/ResourceBar/ResourceBar';
import {
  getPremiumPrice,
  purchasePremium,
  restorePurchases,
} from '../services/revenuecat/purchaseService';
import { usePremiumStore } from '../stores/premiumStore';
import type { RootScreen } from '../types/navigation';
import { useTranslation } from '../i18n';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';

type ShopScreenProps = {
  navigate: (s: RootScreen) => void;
};

export function ShopScreen({ navigate }: ShopScreenProps) {
  const { t } = useTranslation();
  const { isPremium, checkPremium } = usePremiumStore();
  const [price, setPrice] = useState('');

  useEffect(() => {
    void getPremiumPrice().then(setPrice);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col pb-8 pt-[72px]">
      <ResourceBar />
      <header className="flex w-full items-center gap-3 border-b border-[#2a2018] px-4 pb-3">
        <button type="button" className="btn-icon text-lg" onClick={() => navigate('home')}>
          ←
        </button>
        <h1 className="wr-screen-title text-left text-xl">{t('shop.title')}</h1>
      </header>
      <div className="w-full px-4">
        <OrnamentDivider size="sm" />
      </div>

      <div className="mt-2 w-full flex-1 px-4">
        {isPremium ? (
          <div className="fantasy-card text-center">
            <p className="wr-section-title text-xl">{t('shop.already_premium')}</p>
            <p className="wr-body mt-2 text-sm">{t('shop.all_active')}</p>
          </div>
        ) : (
          <div className="fantasy-card mt-2">
            <div className="text-center">
              <p className="text-4xl">👑</p>
              <h2 className="wr-section-title mt-2 text-center text-lg">{t('shop.tagline')}</h2>
            </div>
            <ul className="mt-4 space-y-2 font-body text-sm text-[#8a7060]">
              <li>✓ {t('shop.benefit1')}</li>
              <li>✓ {t('shop.benefit2')}</li>
              <li>✓ {t('shop.benefit3')}</li>
              <li>✓ {t('shop.benefit4')}</li>
              <li>✓ {t('shop.benefit5')}</li>
            </ul>
            <p className="mt-4 text-center font-num text-lg font-semibold text-[#c9a227]">
              {price || t('shop.price')}
            </p>
            <button
              type="button"
              onClick={async () => {
                const ok = await purchasePremium();
                if (ok) await checkPremium();
              }}
              className="fantasy-button mt-4 w-full min-h-[48px]"
            >
              {t('shop.go_premium')}
            </button>
            <button
              type="button"
              onClick={() => void restorePurchases().then(() => checkPremium())}
              className="mt-3 w-full font-cinzel text-sm text-[#6a5848] underline underline-offset-2"
            >
              {t('shop.restore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
