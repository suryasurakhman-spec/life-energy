// src/lib/format.ts
// All number, currency, hours, and date formatting for Life Energy.
// Never format numbers or dates inline in components — use this module.
import { formatLifeEnergy } from '@/lib/calc';

export function formatCurrency(amountMinor: bigint, currency: string): string {
  const amount = Number(amountMinor) / 100;
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

// Legacy aliases kept for compatibility with existing callers
export { formatCurrency as formatPrice };
