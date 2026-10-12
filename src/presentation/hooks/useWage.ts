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

/** Every wage profile, newest first — past logs are costed at the wage in force when they were made. */
export function useWageHistory() {
  return useQuery({
    queryKey: keys.wage.history(),
    queryFn: () => repo.findAll(),
  });
}
