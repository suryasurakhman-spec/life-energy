/**
 * Required sign-in (FR-13): native Google (and Apple on iOS), or an emailed one-time link.
 * The email link returns to app/auth/callback.tsx; Google and Apple finish here, and the
 * root layout's auth gate moves on once the session exists.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithMagicLink } from '@/infrastructure/supabase/supabase-auth';
import {
  isAppleAvailable,
  isGoogleConfigured,
  signInWithApple,
  signInWithGoogle,
  type SocialSignInResult,
} from '@/infrastructure/supabase/social-auth';
import { GoogleSignInButton } from '@/presentation/components/GoogleSignInButton';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { buttonHeight, radius, space } from '@/theme/layout';

const emailSchema = z.string().trim().toLowerCase().email();

type Status = 'idle' | 'sending' | 'sent' | 'invalid' | 'failed';

export default function SignInScreen() {
  const t = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sentTo, setSentTo] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const [socialFailed, setSocialFailed] = useState(false);

  useEffect(() => {
    void isAppleAvailable().then(setAppleAvailable);
  }, []);

  async function social(signIn: () => Promise<SocialSignInResult>) {
    setSocialFailed(false);
    setSocialBusy(true);
    try {
      await signIn(); // cancelled just leaves the screen as it was
    } catch {
      setSocialFailed(true);
    } finally {
      setSocialBusy(false);
    }
  }

  async function send() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    try {
      await signInWithMagicLink(parsed.data);
      setSentTo(parsed.data);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  }

  const button = (label: string, onPress: () => void, primary: boolean, disabled = false) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: primary ? palette.amber600 : palette.white,
        borderWidth: primary ? 0 : 1,
        borderColor: palette.sand200,
        borderRadius: radius.md,
        padding: space.lg,
        alignItems: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={{ color: primary ? palette.white : palette.sand900, fontSize: fontSize.body, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  if (status === 'sent') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
        <View style={{ flex: 1, padding: space.xl, gap: space.xl }}>
          <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }} accessibilityRole="header">
            {t.auth.sentTitle}
          </Text>
          <Text style={{ fontSize: fontSize.body, color: palette.sand500, lineHeight: 26 }}>
            {t.auth.sentBody.replace('{email}', sentTo)}
          </Text>
          <View style={{ flex: 1 }} />
          {button(t.auth.resend, send, true)}
          {button(t.auth.useDifferent, () => setStatus('idle'), false)}
        </View>
      </SafeAreaView>
    );
  }

  const error = status === 'invalid' ? t.auth.invalidEmail : status === 'failed' ? t.auth.sendFailed : null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, padding: space.xl, gap: space.xl }}>
          <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }} accessibilityRole="header">
            {t.auth.title}
          </Text>
          <Text style={{ fontSize: fontSize.body, color: palette.sand500, lineHeight: 26 }}>{t.auth.body}</Text>

          {(isGoogleConfigured || appleAvailable) && (
            <View style={{ gap: space.md }}>
              {appleAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={radius.md}
                  style={{ height: buttonHeight }}
                  onPress={() => { if (!socialBusy) void social(signInWithApple); }}
                />
              )}
              {isGoogleConfigured && (
                <GoogleSignInButton label={t.auth.continueWithGoogle} onPress={() => void social(signInWithGoogle)} disabled={socialBusy} />
              )}
              {socialFailed && (
                <Text style={{ fontSize: fontSize.md, color: palette.error500 }} accessibilityLiveRegion="polite">{t.auth.socialFailed}</Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }} accessible={false}>
                <View style={{ flex: 1, height: 1, backgroundColor: palette.sand200 }} />
                <Text style={{ fontSize: fontSize.md, color: palette.sand500 }}>{t.auth.or}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: palette.sand200 }} />
              </View>
            </View>
          )}

          <View style={{ gap: space.sm }}>
            <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: palette.sand700 }}>{t.auth.emailLabel}</Text>
            <View style={{ borderWidth: 1, borderColor: error ? palette.error500 : palette.sand200, borderRadius: radius.md, paddingHorizontal: space.lg, backgroundColor: palette.white }}>
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (status === 'invalid' || status === 'failed') setStatus('idle');
                }}
                onSubmitEditing={send}
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor={palette.sand300}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                style={{ fontSize: fontSize.lg, paddingVertical: space.lg, color: palette.sand900 }}
                accessibilityLabel={t.auth.emailLabel}
              />
            </View>
            {error && (
              <Text style={{ fontSize: fontSize.md, color: palette.error500 }} accessibilityLiveRegion="polite">{error}</Text>
            )}
          </View>

          <View style={{ flex: 1 }} />
          {status === 'sending' ? (
            <View style={{ padding: space.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: space.sm }}>
              <ActivityIndicator color={palette.amber600} />
              <Text style={{ fontSize: fontSize.body, color: palette.sand500 }}>{t.auth.sending}</Text>
            </View>
          ) : (
            button(t.auth.send, send, true, email.trim().length === 0)
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
