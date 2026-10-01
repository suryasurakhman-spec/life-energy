import { useQuery } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { SqliteWageRepository } from '@/infrastructure/sqlite/sqlite-wage-repository';

const repo = new SqliteWageRepository();

export function useCurrentWage() {
  return useQuery({
    queryKey: keys.wage.current(),
    queryFn: () => repo.findCurrent(),
  });
}

export function useRealHourlyWage(): number {
  const { data } = useCurrentWage();
  return data ? data.realWageCached / 100 : 0;
}
