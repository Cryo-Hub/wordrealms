import { revenueCatMockMode, getOfferings, purchasePackage, restorePurchases } from './revenuecatClient';

export async function checkPremiumStatus(): Promise<boolean> {
  if (revenueCatMockMode) return false;
  return false;
}

export async function purchasePremium(): Promise<boolean> {
  if (revenueCatMockMode) {
    window.alert('Premium (Demo): Kein RevenueCat-Key konfiguriert.');
    return false;
  }
  const off = await getOfferings();
  const pkg = off?.availablePackages[0];
  if (!pkg) return false;
  return purchasePackage(pkg);
}

export async function getPremiumPrice(): Promise<string> {
  const off = await getOfferings();
  return off?.availablePackages[0]?.priceString ?? '9.99€ / month';
}

export { restorePurchases };
