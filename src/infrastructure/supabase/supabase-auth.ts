import * as Linking from 'expo-linking';
import { supabase } from './supabase-client';
import { AUTH_CALLBACK_PATH } from './auth-callback';
import { signOutOfGoogle } from './social-auth';
import type { Session, User } from '@supabase/supabase-js';

/** Email a one-time sign-in link that opens the app at auth/callback. */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: Linking.createURL(AUTH_CALLBACK_PATH) },
  });
  if (error) throw error;
}

/** Finish sign-in with the code from the email link (PKCE). */
export async function completeSignIn(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

/** Forget the session on this phone. Local scope works offline; data on the phone stays. */
export async function signOut(): Promise<void> {
  await signOutOfGoogle();
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return { unsubscribe: () => data.subscription.unsubscribe() };
}
