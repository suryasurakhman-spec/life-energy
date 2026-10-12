export type ConversionSource = 'lens' | 'freeze' | 'keypad';

export interface ConversionInput {
  id: string;
  priceMinor: bigint;
  currency: string;
  /** Life-energy cost, rounded to whole minutes. */
  hoursMinutes: number;
  verdict?: string;
  source: ConversionSource;
}

export interface ConversionRepository {
  save(conversion: ConversionInput): Promise<void>;
}
