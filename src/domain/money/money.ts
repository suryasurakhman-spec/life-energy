export interface Money {
  readonly amountMinor: bigint;
  readonly currency: string;
}

export const money = (amountMinor: bigint, currency: string): Money =>
  ({ amountMinor, currency });

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  return money(a.amountMinor - b.amountMinor, a.currency);
}

export function toDecimal(m: Money): number {
  return Number(m.amountMinor) / 100;
}
