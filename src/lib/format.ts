// src/lib/format.ts
// All number, currency, hours, and date formatting for Life Energy.
// Never format numbers or dates inline in components — use this module.
import { formatLifeEnergy } from '@/lib/calc';
import { minorDigits } from '@/domain/price/parser';

/** Minor units → major units: cents for USD, whole yen for JPY. */
export function toMajor(amountMinor: bigint, currency: string): number {
  return Number(amountMinor) / 10 ** minorDigits(currency);
}

export function formatCurrency(amountMinor: bigint, currency: string): string {
  const amount = toMajor(amountMinor, currency);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/** The symbol a currency is written with, e.g. "USD" → "$", "IDR" → "IDR", "EUR" → "€". */
export function currencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0);
  return parts.find(p => p.type === 'currency')?.value ?? currency;
}

/** An hourly wage given in major units (dollars/hour), formatted in its currency. */
export function formatHourlyWage(perHour: number, currency: string): string {
  return formatCurrency(BigInt(Math.round(perHour * 100)), currency);
}

export function formatHours(
  totalMinutes: number,
  opts: { estimated?: boolean; workDayMinutes?: number } = {}
): string {
  return formatLifeEnergy(totalMinutes, opts);
}

export function formatDate(date: Date, style: 'short' | 'medium' = 'medium'): string {
  return style === 'short'
    ? new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/** A cached rate's 'YYYY-MM-DD' date, read as a local calendar day (not UTC midnight). */
export function formatRateDate(asOf: string): string {
  const [y, m, d] = asOf.split('-').map(Number);
  return formatDate(new Date(y!, m! - 1, d!));
}

// Legacy aliases kept for compatibility with existing callers
export { formatCurrency as formatPrice };
