// src/lib/format.ts
// All number, currency, hours, and date formatting for Life Energy.
// Never format numbers or dates inline in components — use this module.
import { formatLifeEnergy as domainFormatLifeEnergy } from '@/domain/price/price';

export function formatCurrency(amountMinor: bigint, currency: string): string {
  const amount = Number(amountMinor) / 100;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatHours(
  totalMinutes: number,
  opts: { estimated?: boolean; workDayMinutes?: number } = {}
): string {
  const args: { totalMinutes: number; workDayMinutes?: number } = { totalMinutes };
  if (opts.workDayMinutes !== undefined) args.workDayMinutes = opts.workDayMinutes;
  const label = domainFormatLifeEnergy(args);
  return opts.estimated ? `≈ ${label}` : label;
}

export function formatDate(date: Date, style: 'short' | 'medium' = 'medium'): string {
  return style === 'short'
    ? new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

// Legacy aliases kept for compatibility with existing callers
export { formatCurrency as formatPrice };
