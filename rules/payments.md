# Payments Rules

## Stack

- **RevenueCat** (`react-native-purchases`) — all in-app purchases and subscription management.
- RevenueCat is the single source of truth for entitlements. Never check purchase state from App Store / Play Store directly.
- Payment logic lives entirely in `infrastructure/revenuecat/`. No RevenueCat SDK calls in components or use cases.

---

## Release Scope

- **MVP:** No paywall. All MVP features are free.
- **v2:** Optional paywall for v2 features (categories, tabulation, Wall Chart, crossover). Decide free vs paid model before v2 build starts — see open question in PRD.
- Stub the port in MVP so the architecture is ready; no real SDK calls until v2.

---

## Port (Application Layer)

```ts
// src/application/ports/purchase-service.port.ts
export interface CustomerInfo {
  isSubscribed: boolean;
  activeEntitlements: string[];
  managementURL: string | null;
}

export interface Offering {
  id: string;
  packages: Package[];
}

export interface Package {
  id: string;
  productIdentifier: string;
  priceString: string;
  product: {
    title: string;
    description: string;
  };
}

export interface PurchaseService {
  getCustomerInfo(): Promise<CustomerInfo>;
  getOfferings(): Promise<Offering[]>;
  purchasePackage(pkg: Package): Promise<CustomerInfo>;
  restorePurchases(): Promise<CustomerInfo>;
  logIn(userId: string): Promise<void>;
  logOut(): Promise<void>;
}
```

---

## Adapter (Infrastructure Layer)

```ts
// src/infrastructure/revenuecat/revenuecat-purchase-service.ts
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { PurchaseService, CustomerInfo, Offering } from '@/application/ports/purchase-service.port';

const ENTITLEMENT_PRO = 'pro'; // match RevenueCat dashboard entitlement ID

export class RevenueCatPurchaseService implements PurchaseService {
  static configure(apiKey: string) {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    const info = await Purchases.getCustomerInfo();
    return {
      isSubscribed: ENTITLEMENT_PRO in info.entitlements.active,
      activeEntitlements: Object.keys(info.entitlements.active),
      managementURL: info.managementURL ?? null,
    };
  }

  async getOfferings(): Promise<Offering[]> {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) return [];
    return [
      {
        id: offerings.current.identifier,
        packages: offerings.current.availablePackages.map(pkg => ({
          id: pkg.identifier,
          productIdentifier: pkg.product.identifier,
          priceString: pkg.product.priceString,
          product: {
            title: pkg.product.title,
            description: pkg.product.description,
          },
        })),
      },
    ];
  }

  async purchasePackage(pkg: import('@/application/ports/purchase-service.port').Package): Promise<CustomerInfo> {
    // Must re-fetch the RC package object from offerings; our Port Package is a DTO
    const offerings = await Purchases.getOfferings();
    const rcPkg = offerings.current?.availablePackages.find(
      p => p.product.identifier === pkg.productIdentifier
    );
    if (!rcPkg) throw new Error('Package not found in current offerings');

    const { customerInfo } = await Purchases.purchasePackage(rcPkg);
    return this.mapCustomerInfo(customerInfo);
  }

  async restorePurchases(): Promise<CustomerInfo> {
    const info = await Purchases.restorePurchases();
    return this.mapCustomerInfo(info);
  }

  async logIn(userId: string) {
    await Purchases.logIn(userId);
  }

  async logOut() {
    await Purchases.logOut();
  }

  private mapCustomerInfo(info: import('react-native-purchases').CustomerInfo): CustomerInfo {
    return {
      isSubscribed: ENTITLEMENT_PRO in info.entitlements.active,
      activeEntitlements: Object.keys(info.entitlements.active),
      managementURL: info.managementURL ?? null,
    };
  }
}
```

---

## Initialization

Configure RevenueCat once at app startup, before any purchase calls:

```ts
// app/_layout.tsx
import { RevenueCatPurchaseService } from '@/infrastructure/revenuecat/revenuecat-purchase-service';
import { Platform } from 'react-native';

const RC_API_KEY = Platform.select({
  ios:     process.env.EXPO_PUBLIC_RC_API_KEY_IOS!,
  android: process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID!,
})!;

RevenueCatPurchaseService.configure(RC_API_KEY);
```

Store API keys in `.env.local` (gitignored) and expose via `EXPO_PUBLIC_` prefix.

---

## TanStack Query Hooks

```ts
// src/presentation/hooks/usePurchases.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { RevenueCatPurchaseService } from '@/infrastructure/revenuecat/revenuecat-purchase-service';
import type { Package } from '@/application/ports/purchase-service.port';

const service = new RevenueCatPurchaseService();

export function useCustomerInfo() {
  return useQuery({
    queryKey: keys.purchases.customerInfo(),
    queryFn: () => service.getCustomerInfo(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOfferings() {
  return useQuery({
    queryKey: keys.purchases.offerings(),
    queryFn: () => service.getOfferings(),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePurchasePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pkg: Package) => service.purchasePackage(pkg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.purchases.customerInfo() });
    },
  });
}

export function useRestorePurchases() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => service.restorePurchases(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.purchases.customerInfo() });
    },
  });
}
```

---

## Entitlement Checks

Use a single hook to check access. Never check `isSubscribed` ad hoc across the app.

```ts
// src/presentation/hooks/useEntitlement.ts
import { useCustomerInfo } from './usePurchases';

const ENTITLEMENT_PRO = 'pro';

export function useHasProAccess(): boolean {
  const { data } = useCustomerInfo();
  return data?.activeEntitlements.includes(ENTITLEMENT_PRO) ?? false;
}
```

Gate v2+ screens:

```tsx
function MonthScreen() {
  const hasPro = useHasProAccess();
  if (!hasPro) return <PaywallSheet />;
  return <MonthContent />;
}
```

---

## User Identity

Log the Supabase user ID into RevenueCat when the user signs in, so purchase history follows the account:

```ts
// In auth flow (v2+)
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await service.logIn(session.user.id);
}
```

Log out from RevenueCat when the user signs out:

```ts
await supabase.auth.signOut();
await service.logOut();
```

---

## Stub for MVP

Until v2, use a no-op stub so the architecture compiles without the real SDK:

```ts
// src/infrastructure/revenuecat/noop-purchase-service.ts
import type { PurchaseService, CustomerInfo } from '@/application/ports/purchase-service.port';

export class NoopPurchaseService implements PurchaseService {
  async getCustomerInfo(): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async getOfferings() { return []; }
  async purchasePackage(): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async restorePurchases(): Promise<CustomerInfo> {
    return { isSubscribed: false, activeEntitlements: [], managementURL: null };
  }
  async logIn() {}
  async logOut() {}
}
```

---

## Rules Summary

- RevenueCat SDK calls only in `infrastructure/revenuecat/`. Never in components or use cases.
- All purchase state via TanStack Query (`useCustomerInfo`, `useOfferings`).
- Single entitlement hook (`useHasProAccess`) for all gating checks.
- Link RevenueCat user ID to Supabase user ID on sign-in.
- MVP uses `NoopPurchaseService`; swap for real adapter in v2.
- API keys in `.env.local` via `EXPO_PUBLIC_` prefix, never hardcoded.
- "Restore purchases" must be accessible in Profile (App Store requirement).
