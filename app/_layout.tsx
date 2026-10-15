import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { SplashScreen, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/infrastructure/sqlite/db';
import migrations from '@/infrastructure/sqlite/drizzle/migrations/migrations';
import { SqliteFxRepository } from '@/infrastructure/sqlite/sqlite-fx-repository';
import { fetchEcbDaily } from '@/infrastructure/fx/ecb-rates';
import { refreshFxRates } from '@/application/refresh-fx-rates';
import { FX_RATE_KEY } from '@/presentation/hooks/useFxRate';
import { SplashOverlay } from '@/presentation/components/SplashOverlay';

// Keep the native splash until fonts and DB are ready; SplashOverlay then takes over and hides it.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: dbReady, error: dbError } = useMigrations(db, migrations);
  const fontsDone = fontsLoaded || !!fontError;
  const dbDone = dbReady || !!dbError;
  const [splashDone, setSplashDone] = useState(false);
  const endSplash = useCallback(() => setSplashDone(true), []);

  // Once the database is ready, refresh exchange rates if the cache is over 12 h old.
  // Offline this does nothing and the lens keeps using the last cached rates.
  useEffect(() => {
    if (!dbReady) return;
    refreshFxRates(new SqliteFxRepository(), fetchEcbDaily)
      .then((updated) => {
        if (updated) void queryClient.invalidateQueries({ queryKey: [FX_RATE_KEY] });
      })
      .catch(() => {});
  }, [dbReady]);

  if (!fontsDone || !dbDone) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* A stack, so screens opened over the tabs (paywall, currency) go back to the same tab. */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
        </QueryClientProvider>
        {!splashDone && <SplashOverlay onDone={endSplash} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
