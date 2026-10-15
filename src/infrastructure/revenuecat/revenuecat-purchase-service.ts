import Purchases, {
  PURCHASES_ERROR_CODE,
  type CustomerInfo as RcCustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import type { PurchaseService, CustomerInfo, Offering, Package } from '@/application/ports/purchase-service.port';

/** Entitlement that unlocks Pro; must match the entitlement id in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT_ID = 'pro_v2';

/** Thrown when Google Play holds the payment (e.g. cash at a shop); Pro unlocks once it clears. */
export class PaymentPendingError extends Error {}

export function toCustomerInfo(info: RcCustomerInfo): CustomerInfo {
  const active = Object.keys(info.entitlements.active);
  return {
    // "isSubscribed" means "has Pro": the one-time unlock never expires.
    isSubscribed: active.includes(PRO_ENTITLEMENT_ID),
    activeEntitlements: active,
    managementURL: info.managementURL,
  };
}

export function toPackage(pkg: PurchasesPackage): Package {
  return {
    id: pkg.identifier,
    productIdentifier: pkg.product.identifier,
    priceString: pkg.product.priceString,
    product: { title: pkg.product.title, description: pkg.product.description },
  };
}

/**
 * Google Play purchases through RevenueCat. No sign-in: RevenueCat makes an anonymous id,
 * and the purchase belongs to the user's Google account, so Restore brings it back on a new phone.
 */
export class RevenueCatPurchaseService implements PurchaseService {
  /** SDK packages from the last getOfferings, by id; purchasing needs the SDK object. */
  private packages = new Map<string, PurchasesPackage>();

  constructor(apiKey: string) {
    Purchases.configure({ apiKey });
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    return toCustomerInfo(await Purchases.getCustomerInfo());
  }

  async getOfferings(): Promise<Offering[]> {
    const current = (await Purchases.getOfferings()).current;
    if (!current) return [];
    this.packages = new Map(current.availablePackages.map((p) => [p.identifier, p]));
    return [{ id: current.identifier, packages: current.availablePackages.map(toPackage) }];
  }

  async purchasePackage(pkg: Package): Promise<CustomerInfo> {
    const rcPackage = this.packages.get(pkg.id);
    if (!rcPackage) throw new Error(`Unknown package ${pkg.id}`);
    try {
      return toCustomerInfo((await Purchases.purchasePackage(rcPackage)).customerInfo);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return this.getCustomerInfo();
      if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) throw new PaymentPendingError();
      throw e;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    return toCustomerInfo(await Purchases.restorePurchases());
  }

  async logIn(userId: string) {
    await Purchases.logIn(userId);
  }

  async logOut() {
    await Purchases.logOut();
  }
}
