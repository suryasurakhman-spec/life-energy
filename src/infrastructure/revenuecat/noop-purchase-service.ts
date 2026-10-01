import type { PurchaseService, CustomerInfo, Offering, Package } from '@/application/ports/purchase-service.port';

/** Used in MVP (no paywall). Swap for RevenueCatPurchaseService in v2. */
export class NoopPurchaseService implements PurchaseService {
  async getCustomerInfo(): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async getOfferings(): Promise<Offering[]> { return []; }
  async purchasePackage(_pkg: Package): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async restorePurchases(): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async logIn(_userId: string) {}
  async logOut() {}
}
