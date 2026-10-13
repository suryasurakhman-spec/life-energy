import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
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
import { useAuthStore } from '@/presentation/stores/auth.store';
import { isAuthConfigured } from '@/infrastructure/supabase/supabase-client';

// Keep the splash screen visible until fonts and DB are ready.
SplashScreen.preventAutoHideAsync();

// Sign-in is required (FR-13). Development builds without a Supabase project skip it.
const AUTH_REQUIRED = isAuthConfigured || !__DEV__;
if (!AUTH_REQUIRED) console.warn('Supabase is not configured in .env — skipping sign-in (development only).');

/** Routes reachable without a session: sign-in itself, its email-link callback, and the dev exam. */
const PUBLIC_ROUTES = new Set(['sign-in', 'auth', 'dev-exam']);

/** Send signed-out users to sign-in, and signed-in users away from it. */
function useAuthGate(ready: boolean) {
  const { isSignedIn, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => initialize(), [initialize]);

  useEffect(() => {
    if (!ready || !AUTH_REQUIRED || isLoading) return;
    const top = segments[0] ?? '';
    if (!isSignedIn && !PUBLIC_ROUTES.has(top)) router.replace('/sign-in');
    else if (isSignedIn && top === 'sign-in') router.replace('/');
  }, [ready, isSignedIn, isLoading, segments, router]);

  return !AUTH_REQUIRED || !isLoading;
}

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
  const authReady = useAuthGate(fontsDone && dbDone);

  useEffect(() => {
    if (fontsDone && dbDone && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsDone, dbDone, authReady]);

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

  if (!fontsDone || !dbDone || !authReady) {
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
