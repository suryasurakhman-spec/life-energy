import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeCurrency } from '@/presentation/stores/currency.store';

/** Monthly job costs on the wizard's full path, in minor units. */
export interface ExtraJobCosts {
  meals: bigint;
  clothes: bigint;
  childcare: bigint;
  decompression: bigint;
  health: bigint;
}

/** Unpaid hours the job takes each week, per kind (full path). */
export interface ExtraWeeklyHours {
  gettingReady: number;
  decompressing: number;
  overtime: number;
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
  extraWeeklyHours: ExtraWeeklyHours;

  // Actions
  setCurrency: (c: string) => void;
  setPayPeriod: (p: PayPeriod) => void;
  setNetPay: (minor: bigint) => void;
  setPaidHours: (hrs: number) => void;
  setCommute: (minutes: number, costMinor: bigint) => void;
  setExtraJobCosts: (costs: ExtraJobCosts, extraJobHoursPerMonth: number, weekly: ExtraWeeklyHours) => void;
  clearExtraJobCosts: () => void;
  reset: () => void;
}

const defaults = {
  currency: homeCurrency(), // Profile override, else expo-localization; USD when neither
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
  extraWeeklyHours: { gettingReady: 0, decompressing: 0, overtime: 0 },
};

const noExtras = {
  workMealsMinor: 0n,
  workClothesMinor: 0n,
  childcareMinor: 0n,
  decompressionMinor: 0n,
  healthMinor: 0n,
  extraJobHoursPerMonth: 0,
  extraWeeklyHours: { gettingReady: 0, decompressing: 0, overtime: 0 },
};

// Kept on the phone so editing the wage later starts from the last answers.
export const useOnboardingStore = create<OnboardingState>()(persist((set) => ({
  ...defaults,
  setCurrency: (currency) => set({ currency }),
  setPayPeriod: (payPeriod) => set({ payPeriod }),
  setNetPay: (netPayMinor) => set({ netPayMinor }),
  setPaidHours: (paidHoursPerWeek) => set({ paidHoursPerWeek }),
  setCommute: (commuteMinutesPerDay, commuteCostMinor) =>
    set({ commuteMinutesPerDay, commuteCostMinor }),
  setExtraJobCosts: (costs, extraJobHoursPerMonth, extraWeeklyHours) =>
    set({
      workMealsMinor: costs.meals,
      workClothesMinor: costs.clothes,
      childcareMinor: costs.childcare,
      decompressionMinor: costs.decompression,
      healthMinor: costs.health,
      extraJobHoursPerMonth,
      extraWeeklyHours,
    }),
  // Quick path: drop anything entered on the full path earlier, so the reveal matches the choice.
  clearExtraJobCosts: () => set(noExtras),
  reset: () => set({ ...defaults, currency: homeCurrency() }),
}), {
  name: 'life-energy-wizard',
  // Currency comes from the currency store each time the wizard opens.
  partialize: ({ currency: _c, ...answers }) => answers,
  storage: createJSONStorage(() => AsyncStorage, {
    // JSON has no bigint: money is stored as {"$bigint": "4990"}.
    replacer: (_k, v) => (typeof v === 'bigint' ? { $bigint: v.toString() } : v),
    reviver: (_k, v) => (v && typeof v === 'object' && '$bigint' in v ? BigInt((v as { $bigint: string }).$bigint) : v),
  }),
}));
