import { create } from 'zustand';
import { detectHomeCurrency } from '@/infrastructure/device/home-currency';

/** Monthly job costs on the wizard's full path, in minor units. */
export interface ExtraJobCosts {
  meals: bigint;
  clothes: bigint;
  childcare: bigint;
  decompression: bigint;
  health: bigint;
}

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
  healthMinor: bigint;
  extraJobHoursPerMonth: number;

  // Actions
  setCurrency: (c: string) => void;
  setPayPeriod: (p: PayPeriod) => void;
  setNetPay: (minor: bigint) => void;
  setPaidHours: (hrs: number) => void;
  setCommute: (minutes: number, costMinor: bigint) => void;
  setExtraJobCosts: (costs: ExtraJobCosts, extraJobHoursPerMonth: number) => void;
  clearExtraJobCosts: () => void;
  reset: () => void;
}

const defaults = {
  currency: detectHomeCurrency(), // expo-localization; USD when the device reports none
  payPeriod: 'monthly' as PayPeriod,
  netPayMinor: null,
  paidHoursPerWeek: null,
  commuteMinutesPerDay: null,
  commuteCostMinor: null,
  workMealsMinor: 0n,
  workClothesMinor: 0n,
  childcareMinor: 0n,
  decompressionMinor: 0n,
  healthMinor: 0n,
  extraJobHoursPerMonth: 0,
};

const noExtras = {
  workMealsMinor: 0n,
  workClothesMinor: 0n,
  childcareMinor: 0n,
  decompressionMinor: 0n,
  healthMinor: 0n,
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
  setExtraJobCosts: (costs, extraJobHoursPerMonth) =>
    set({
      workMealsMinor: costs.meals,
      workClothesMinor: costs.clothes,
      childcareMinor: costs.childcare,
      decompressionMinor: costs.decompression,
      healthMinor: costs.health,
      extraJobHoursPerMonth,
    }),
  // Quick path: drop anything entered on the full path earlier, so the reveal matches the choice.
  clearExtraJobCosts: () => set(noExtras),
  reset: () => set(defaults),
}));
