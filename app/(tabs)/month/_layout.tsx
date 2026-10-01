import { Stack } from 'expo-router';
import { dark } from '@/theme/colors';

export default function MonthStack() {
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
      <Stack.Screen name="wall-chart" options={{ title: 'Wall Chart' }} />
      <Stack.Screen name="crossover" options={{ title: 'Crossover' }} />
    </Stack>
  );
}
