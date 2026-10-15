import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  configure: vi.fn(),
  getOfferings: vi.fn(),
  getCustomerInfo: vi.fn(),
  purchasePackage: vi.fn(),
  restorePurchases: vi.fn(),
}));
vi.mock('react-native-purchases', () => ({
  default: sdk,
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: '1', PAYMENT_PENDING_ERROR: '20' },
}));

import { PaymentPendingError, RevenueCatPurchaseService, toCustomerInfo } from './revenuecat-purchase-service';

const info = (active: string[]) => ({
  entitlements: { active: Object.fromEntries(active.map((id) => [id, {}])) },
  managementURL: null,
}) as never;

const rcPackage = {
  identifier: '$rc_lifetime',
  product: { identifier: 'pro_lifetime', priceString: '$7.99', title: 'Pro', description: 'Unlock the Month tools' },
};

describe('toCustomerInfo', () => {
  it('has Pro only with the pro_v2 entitlement', () => {
    expect(toCustomerInfo(info(['pro_v2']))).toEqual({ isSubscribed: true, activeEntitlements: ['pro_v2'], managementURL: null });
    expect(toCustomerInfo(info([])).isSubscribed).toBe(false);
  });
});

describe('RevenueCatPurchaseService', () => {
  let service: RevenueCatPurchaseService;
  beforeEach(async () => {
    vi.clearAllMocks();
    sdk.getOfferings.mockResolvedValue({ current: { identifier: 'default', availablePackages: [rcPackage] } });
    service = new RevenueCatPurchaseService('goog_test');
  });

  it('maps the current offering to packages', async () => {
    expect(await service.getOfferings()).toEqual([{
      id: 'default',
      packages: [{ id: '$rc_lifetime', productIdentifier: 'pro_lifetime', priceString: '$7.99', product: { title: 'Pro', description: 'Unlock the Month tools' } }],
    }]);
  });

  it('buys the SDK package behind a mapped package', async () => {
    const [offering] = await service.getOfferings();
    sdk.purchasePackage.mockResolvedValue({ customerInfo: info(['pro_v2']) });
    expect((await service.purchasePackage(offering!.packages[0]!)).isSubscribed).toBe(true);
    expect(sdk.purchasePackage).toHaveBeenCalledWith(rcPackage);
  });

  it('treats a cancelled purchase as no change, and a pending one as its own error', async () => {
    const [offering] = await service.getOfferings();
    sdk.getCustomerInfo.mockResolvedValue(info([]));
    sdk.purchasePackage.mockRejectedValueOnce({ code: '1' });
    expect((await service.purchasePackage(offering!.packages[0]!)).isSubscribed).toBe(false);
    sdk.purchasePackage.mockRejectedValueOnce({ code: '20' });
    await expect(service.purchasePackage(offering!.packages[0]!)).rejects.toBeInstanceOf(PaymentPendingError);
  });
});
