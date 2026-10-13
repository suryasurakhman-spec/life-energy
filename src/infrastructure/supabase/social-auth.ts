/**
 * Native Google and Apple sign-in (FR-13). Each provider's own UI returns an ID token,
 * which Supabase verifies and turns into a session (signInWithIdToken) — no browser.
 *
 * Google: Android account picker / iOS Google sheet, needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 * (and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID on iOS). Apple: iOS only; Apple has no native
 * sign-in on Android and only requires it in the iOS app.
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase-client';

export type SocialSignInResult = 'signed-in' | 'cancelled';

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

/** Google needs the web client ID everywhere (Supabase verifies tokens against it) and the iOS ID on iOS. */
const isSet = (id: string) => id.length > 0 && !id.startsWith('your-'); // .env.example placeholders
export const isGoogleConfigured =
  isSet(googleWebClientId) && (Platform.OS !== 'ios' || isSet(googleIosClientId));

let googleReady = false;
function configureGoogle() {
  if (googleReady) return;
  GoogleSignin.configure({
    webClientId: googleWebClientId,
    ...(googleIosClientId ? { iosClientId: googleIosClientId } : {}),
  });
  googleReady = true;
}

export async function signInWithGoogle(): Promise<SocialSignInResult> {
  configureGoogle();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') return 'cancelled';
    const token = response.data.idToken;
    if (!token) throw new Error('Google returned no ID token');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    if (error) throw error;
    return 'signed-in';
  } catch (e) {
    if (isErrorWithCode(e) && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) {
      return 'cancelled';
    }
    throw e;
  }
}

/** Forget the Google account choice so the picker shows next time. Best effort. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleConfigured) return;
  configureGoogle();
  await GoogleSignin.signOut().catch(() => {});
}

/** Sign in with Apple exists on iOS 13+ only. */
export async function isAppleAvailable(): Promise<boolean> {
  return Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync());
}

export async function signInWithApple(): Promise<SocialSignInResult> {
  // Apple signs a hash of a one-time value; Supabase checks it against the raw value.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) throw new Error('Apple returned no identity token');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    if (error) throw error;
    return 'signed-in';
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return 'cancelled';
    throw e;
  }
}
