import { Stack } from 'expo-router';
import { dark } from '@/theme/colors';
import { useTranslation } from '@/lib/i18n';

export default function MonthStack() {
  const t = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: dark.surface },
        headerTintColor: dark.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="wall-chart" options={{ title: t.wallChart.title }} />
      <Stack.Screen name="crossover" options={{ title: t.crossover.title }} />
      <Stack.Screen name="income" options={{ title: t.income.title }} />
    </Stack>
  );
}
