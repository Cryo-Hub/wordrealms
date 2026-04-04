const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY ?? '';
export const revenueCatMockMode = !apiKey;

export type Package = { identifier: string; priceString: string };
export type Offering = { identifier: string; availablePackages: Package[] };
export type EntitlementInfo = { identifier: string; isActive: boolean };

export async function getOfferings(): Promise<Offering | null> {
  if (revenueCatMockMode) {
    return {
      identifier: 'default',
      availablePackages: [{ identifier: 'monthly', priceString: '9.99€' }],
    };
  }
  return null;
}

export async function purchasePackage(_pkg: Package): Promise<boolean> {
  if (revenueCatMockMode) {
    window.alert('Premium (Demo): RevenueCat API-Key fehlt.');
    return false;
  }
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  if (revenueCatMockMode) return false;
  return false;
}
