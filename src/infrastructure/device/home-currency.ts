import { getLocales } from 'expo-localization';

/**
 * The phone's home currency (ISO 4217), e.g. regionCode "US" → "USD".
 * Falls back to USD when the device reports none.
 */
export function detectHomeCurrency(): string {
  return getLocales()[0]?.currencyCode ?? 'USD';
}
