import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/infrastructure/sqlite/db';
import migrations from '@/infrastructure/sqlite/drizzle/migrations/migrations';
import { SqliteFxRepository } from '@/infrastructure/sqlite/sqlite-fx-repository';
import { fetchEcbDaily } from '@/infrastructure/fx/ecb-rates';
import { refreshFxRates } from '@/application/refresh-fx-rates';
import { FX_RATE_KEY } from '@/presentation/hooks/useFxRate';

// Keep the splash screen visible until fonts and DB are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: dbReady, error: dbError } = useMigrations(db, migrations);

  useEffect(() => {
    if ((fontsLoaded || fontError) && (dbReady || dbError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady, dbError]);

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

  if ((!fontsLoaded && !fontError) || (!dbReady && !dbError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
