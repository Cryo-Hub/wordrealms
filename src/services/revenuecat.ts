import {
  ErrorCode,
  Purchases,
  PurchasesError,
  type CustomerInfo,
} from '@revenuecat/purchases-js';
import { usePremiumStore } from '../stores/premiumStore';

/** Platzhalter bis der echte Key in VITE_REVENUECAT_API_KEY gesetzt ist */
const API_KEY_PLACEHOLDER = 'YOUR_RC_API_KEY';

/** Echter Key aus der Umgebung (nicht der Platzhalter) */
export function isRevenueCatConfigured(): boolean {
  const k = import.meta.env.VITE_REVENUECAT_API_KEY ?? '';
  return k.length > 0 && k !== API_KEY_PLACEHOLDER;
}

let lastConfiguredUserId: string | null = null;

/**
 * Einmalig konfigurieren; bei anderem App-User `changeUser`.
 */
export function initRevenueCat(userId: string): void {
  if (!isRevenueCatConfigured() || !userId) return;
  const key = import.meta.env.VITE_REVENUECAT_API_KEY as string;
  try {
    if (Purchases.isConfigured()) {
      if (lastConfiguredUserId !== userId) {
        void Purchases.getSharedInstance()
          .changeUser(userId)
          .then(() => {
            lastConfiguredUserId = userId;
          })
          .catch(() => {});
      }
      return;
    }
    Purchases.configure({ apiKey: key, appUserId: userId });
    lastConfiguredUserId = userId;
  } catch {
    /* ignore */
  }
}

function hasActiveEntitlement(info: CustomerInfo): boolean {
  return Object.values(info.entitlements.active).some((e) => e.isActive);
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    try {
      return usePremiumStore.getState().isPremium;
    } catch {
      return false;
    }
  }
  try {
    if (!Purchases.isConfigured()) {
      return usePremiumStore.getState().isPremium;
    }
    const info = await Purchases.getSharedInstance().getCustomerInfo();
    return hasActiveEntitlement(info);
  } catch {
    return usePremiumStore.getState().isPremium;
  }
}

export type PurchaseBattlePassResult = { ok: true } | { ok: false; cancelled: boolean };

export async function purchaseBattlePass(): Promise<PurchaseBattlePassResult> {
  if (!isRevenueCatConfigured()) {
    return { ok: false, cancelled: false };
  }
  try {
    if (!Purchases.isConfigured()) {
      return { ok: false, cancelled: false };
    }
    const p = Purchases.getSharedInstance();
    const offerings = await p.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      return { ok: false, cancelled: false };
    }
    await p.purchase({ rcPackage: pkg, skipSuccessPage: true });
    usePremiumStore.getState().purchasePremium();
    return { ok: true };
  } catch (e) {
    if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, cancelled: false };
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    return usePremiumStore.getState().isPremium;
  }
  try {
    if (!Purchases.isConfigured()) {
      return usePremiumStore.getState().isPremium;
    }
    const info = await Purchases.getSharedInstance().getCustomerInfo();
    const active = hasActiveEntitlement(info);
    if (active) {
      usePremiumStore.getState().setPremium(true);
    }
    return active;
  } catch {
    return false;
  }
}

export async function getPremiumPrice(): Promise<string> {
  if (!isRevenueCatConfigured()) {
    return '9,99€/month';
  }
  try {
    if (!Purchases.isConfigured()) {
      return '9,99€/month';
    }
    const offerings = await Purchases.getSharedInstance().getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    const price = pkg?.webBillingProduct?.price?.formattedPrice;
    if (price) return price;
    return '9,99€/month';
  } catch {
    return '9,99€/month';
  }
}
