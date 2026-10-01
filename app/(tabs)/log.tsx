import { LogScreen } from '@/presentation/screens/log/LogScreen';
import { useRealHourlyWage } from '@/presentation/hooks/useWage';

export default function LogTab() {
  const realHourlyWage = useRealHourlyWage();
  return <LogScreen realHourlyWage={realHourlyWage} />;
}
