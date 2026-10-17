import { Redirect } from 'expo-router';
import { useHasProAccess } from '@/presentation/hooks/useEntitlement';
import { CrossoverScreen } from '@/presentation/screens/month/CrossoverScreen';

export default function CrossoverRoute() {
  // A deep link skips the Month screen's paywall check, so the route checks again.
  const { hasAccess, isLoading } = useHasProAccess();
  if (isLoading) return null;
  return hasAccess ? <CrossoverScreen /> : <Redirect href="/paywall" />;
}
