import { create } from 'zustand';

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

interface OnboardingState {
  // Step values
  currency: string;
  payPeriod: PayPeriod;
  netPayMinor: bigint | null;
  paidHoursPerWeek: number | null;
  commuteMinutesPerDay: number | null;
  commuteCostMinor: bigint | null;
  // Extra job costs (full path)
  workMealsMinor: bigint;
  workClothesMinor: bigint;
  childcareMinor: bigint;
  decompressionMinor: bigint;
  extraJobHoursPerMonth: number;

  // Actions
  setCurrency: (c: string) => void;
  setPayPeriod: (p: PayPeriod) => void;
  setNetPay: (minor: bigint) => void;
  setPaidHours: (hrs: number) => void;
  setCommute: (minutes: number, costMinor: bigint) => void;
  reset: () => void;
}

const defaults = {
  currency: 'USD',
  payPeriod: 'monthly' as PayPeriod,
  netPayMinor: null,
  paidHoursPerWeek: null,
  commuteMinutesPerDay: null,
  commuteCostMinor: null,
  workMealsMinor: 0n,
  workClothesMinor: 0n,
  childcareMinor: 0n,
  decompressionMinor: 0n,
  extraJobHoursPerMonth: 0,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...defaults,
  setCurrency: (currency) => set({ currency }),
  setPayPeriod: (payPeriod) => set({ payPeriod }),
  setNetPay: (netPayMinor) => set({ netPayMinor }),
  setPaidHours: (paidHoursPerWeek) => set({ paidHoursPerWeek }),
  setCommute: (commuteMinutesPerDay, commuteCostMinor) =>
    set({ commuteMinutesPerDay, commuteCostMinor }),
  reset: () => set(defaults),
}));
