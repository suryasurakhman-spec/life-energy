import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NoopPurchaseService } from '@/infrastructure/revenuecat/noop-purchase-service';
import type { Package } from '@/application/ports/purchase-service.port';

const service = new NoopPurchaseService();

const CUSTOMER_INFO_KEY = ['purchases', 'customerInfo'] as const;
const OFFERINGS_KEY     = ['purchases', 'offerings'] as const;

export function useCustomerInfo() {
  return useQuery({
    queryKey: CUSTOMER_INFO_KEY,
    queryFn:  () => service.getCustomerInfo(),
  });
}

export function useOfferings() {
  return useQuery({
    queryKey: OFFERINGS_KEY,
    queryFn:  () => service.getOfferings(),
  });
}

export function usePurchasePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pkg: Package) => service.purchasePackage(pkg),
    onSuccess: (info) => {
      qc.setQueryData(CUSTOMER_INFO_KEY, info);
    },
  });
}

export function useRestorePurchases() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => service.restorePurchases(),
    onSuccess: (info) => {
      qc.setQueryData(CUSTOMER_INFO_KEY, info);
    },
  });
}
