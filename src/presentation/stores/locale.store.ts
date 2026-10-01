import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import type { Locale } from '@/lib/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en-US',
      setLocale: (locale) => {
        // Arabic is RTL. The change takes effect on the next app restart,
        // but setting it now ensures the layout is correct after cold start.
        I18nManager.forceRTL(locale === 'ar');
        set({ locale });
      },
    }),
    {
      name: 'life-energy-locale',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
