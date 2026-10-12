import { randomUUID } from 'expo-crypto';
import type { ConversionRepository, ConversionInput } from './ports/conversion-repository.port';

export type RecordConversionInput = Omit<ConversionInput, 'id'>;

/** Every scanned or typed price the user sees is kept in `conversions` (PRD data model). */
export async function recordConversion(
  repo: ConversionRepository,
  input: RecordConversionInput,
): Promise<void> {
  await repo.save({ ...input, id: randomUUID() });
}
