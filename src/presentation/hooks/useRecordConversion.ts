import { useCallback } from 'react';
import { recordConversion, type RecordConversionInput } from '@/application/record-conversion';
import { SqliteConversionRepository } from '@/infrastructure/sqlite/sqlite-conversion-repository';

const repo = new SqliteConversionRepository();

/** Fire-and-forget: a failed history write must never block the lens or the sheet. */
export function useRecordConversion() {
  return useCallback((input: RecordConversionInput) => {
    recordConversion(repo, input).catch(() => {});
  }, []);
}
