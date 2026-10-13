import { useQuery } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { workDayMinutes } from '@/lib/calc';
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

/** The user's real work day in minutes (paid + job hours), used for "work days" labels and chip tiers. */
export function useWorkDayMinutes(): number {
  const { data } = useCurrentWage();
  return data ? workDayMinutes(data.paidHoursPerWeek, data.jobHoursPerMonth) : 480;
}

/** Every wage profile, newest first — past logs are costed at the wage in force when they were made. */
export function useWageHistory() {
  return useQuery({
    queryKey: keys.wage.history(),
    queryFn: () => repo.findAll(),
  });
}
