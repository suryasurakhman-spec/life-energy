import { Redirect } from 'expo-router';
import { useHasProAccess } from '@/presentation/hooks/useEntitlement';
import { WallChartScreen } from '@/presentation/screens/month/WallChartScreen';

export default function WallChartRoute() {
  // A deep link skips the Month screen's paywall check, so the route checks again.
  const { hasAccess, isLoading } = useHasProAccess();
  if (isLoading) return null;
  return hasAccess ? <WallChartScreen /> : <Redirect href="/paywall" />;
}
