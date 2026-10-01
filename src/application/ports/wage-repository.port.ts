import type { PayPeriod } from '@/domain/wage/wage';

export interface WageProfileInput {
  id: string;
  effectiveFrom: Date;
  netPayMinor: bigint;
  currency: string;
  payPeriod: PayPeriod;
  paidHoursPerWeek: number;
  jobCostsMinor: bigint;
  jobHoursPerMonth: number;
  realWageCached: number; // cents per hour
}

export interface WageProfileRecord extends WageProfileInput {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface WageRepository {
  save(profile: WageProfileInput): Promise<void>;
  findCurrent(): Promise<WageProfileRecord | null>;
  findAll(): Promise<WageProfileRecord[]>;
}
