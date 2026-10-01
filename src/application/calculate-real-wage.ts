import { randomUUID } from 'expo-crypto';
import { calculateRealWage as domainCalc, type WageInput } from '@/domain/wage/wage';
import { isOk } from '@/lib/result';
import type { WageRepository, WageProfileInput } from './ports/wage-repository.port';

export type { WageInput };

export async function saveRealWage(
  repo: WageRepository,
  input: WageInput,
): Promise<number> {
  const result = domainCalc(input);
  if (!isOk(result)) throw result.error;

  const realWageCached = Math.round(result.value.realHourly * 100); // cents per hour

  const profile: WageProfileInput = {
    id:               randomUUID(),
    effectiveFrom:    new Date(),
    netPayMinor:      input.netPayMinor,
    currency:         'USD',
    payPeriod:        input.payPeriod ?? 'monthly',
    paidHoursPerWeek: input.paidHoursPerWeek ?? 40,
    jobCostsMinor:    input.jobCostsMinor,
    jobHoursPerMonth: input.jobHoursPerMonth,
    realWageCached,
  };

  await repo.save(profile);
  return result.value.realHourly;
}
