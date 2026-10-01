import { useCustomerInfo } from './usePurchases';

export const PRO_ENTITLEMENT = 'pro_v2';

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
