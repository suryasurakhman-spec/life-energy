import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectHomeCurrency } from '@/infrastructure/device/home-currency';

interface CurrencyState {
  /** Currency the user picked in Profile; null means use the device's (expo-localization). */
  override: string | null;
  setOverride: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (currency) => set({ override: currency }),
    }),
    {
      name: 'life-energy-currency',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** The home currency: the user's override, else the device's. */
export function homeCurrency(): string {
  return useCurrencyStore.getState().override ?? detectHomeCurrency();
}

/** Currencies the price parser can read, in the order the picker lists them. */
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD', 'JPY', 'CNY', 'KRW', 'IDR', 'MXN',
] as const;
