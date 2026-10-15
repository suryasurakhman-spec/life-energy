import { useCustomerInfo } from './usePurchases';

import { PRO_ENTITLEMENT_ID } from '@/infrastructure/revenuecat/revenuecat-purchase-service';

export const PRO_ENTITLEMENT = PRO_ENTITLEMENT_ID;

export function useEntitlement(entitlementId: string) {
  const { data: info, isLoading, isError } = useCustomerInfo();
  return {
    hasAccess: info?.activeEntitlements.includes(entitlementId) ?? false,
    isLoading,
    isError,
  };
}

export function useHasProAccess() {
  return useEntitlement(PRO_ENTITLEMENT);
}
