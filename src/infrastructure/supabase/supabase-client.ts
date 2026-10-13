import 'react-native-url-polyfill/auto'; // supabase-js needs a full URL implementation on React Native
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { createChunkedStore } from './chunked-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** False while .env still holds the example project, so development builds can run without sign-in. */
export const isAuthConfigured =
  /^https:\/\/.+/.test(supabaseUrl) && !supabaseUrl.includes('your-project') && supabaseAnonKey.length > 0;

// Sign-in tokens live in the device keychain / keystore, chunked to stay under its size limit.
const sessionStore = createChunkedStore({
  getItem:    (key) => SecureStore.getItemAsync(key),
  setItem:    (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

export const supabase = createClient(
  isAuthConfigured ? supabaseUrl : 'https://unconfigured.invalid',
  isAuthConfigured ? supabaseAnonKey : 'unconfigured',
  {
    auth: {
      storage: sessionStore,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // the auth/callback route completes sign-in itself
      flowType: 'pkce',
    },
  },
);

// Refresh tokens only while the app is in the foreground (Supabase's React Native guidance).
AppState.addEventListener('change', (state) => {
  if (state === 'active') void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();
});
