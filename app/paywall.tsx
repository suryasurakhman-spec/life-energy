import { router } from 'expo-router';
import { PaywallScreen } from '@/presentation/screens/paywall/PaywallScreen';

export default function PaywallRoute() {
  return <PaywallScreen onDismiss={() => router.back()} />;
}
