import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { NoopPurchaseService } from '@/infrastructure/revenuecat/noop-purchase-service';
import { RevenueCatPurchaseService } from '@/infrastructure/revenuecat/revenuecat-purchase-service';
import type { Package, PurchaseService } from '@/application/ports/purchase-service.port';

// Google Play only for now; builds without the key (dev, iOS) get no purchases and stay on Free.
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const service: PurchaseService =
  Platform.OS === 'android' && androidKey ? new RevenueCatPurchaseService(androidKey) : new NoopPurchaseService();

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
