export {
  initRevenueCat,
  isRevenueCatConfigured,
  checkPremiumStatus,
  purchaseBattlePass,
  restorePurchases,
  getPremiumPrice,
} from '../revenuecat';

import { purchaseBattlePass } from '../revenuecat';

/** Shop-Screen: gleicher Kauf wie Battle Pass (Web Billing). */
export async function purchasePremium(): Promise<boolean> {
  const r = await purchaseBattlePass();
  return r.ok;
}
