export interface LifeEnergyInput {
  priceMinor: bigint;
  realHourlyWage: number; // dollars per hour
}

export interface LifeEnergyResult {
  totalMinutes: number;
  hours: number;
  minutes: number;
}

export function lifeEnergy({ priceMinor, realHourlyWage }: LifeEnergyInput): LifeEnergyResult {
  const priceUSD = Number(priceMinor) / 100;
  const totalHours = priceUSD / realHourlyWage;
  const totalMinutes = totalHours * 60;
  return {
    totalMinutes,
    hours: Math.floor(totalHours),
    minutes: Math.round(totalMinutes % 60),
  };
}

export function formatLifeEnergy(
  { totalMinutes, workDayMinutes = 480 }:
  { totalMinutes: number; workDayMinutes?: number }
): string {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} m`;
  const hours = totalMinutes / 60;
  if (hours >= 40) {
    const days = (totalMinutes / workDayMinutes).toFixed(1);
    return `${days} work days`;
  }
  if (hours >= 10) return `${Math.floor(hours)} h`;
  const h = Math.floor(hours);
  const m = Math.round(totalMinutes % 60);
  return m > 0 ? `${h} h ${m} m` : `${h} h`;
}
