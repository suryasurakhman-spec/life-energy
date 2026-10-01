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
