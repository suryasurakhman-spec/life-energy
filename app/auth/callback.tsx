/**
 * Where the sign-in email link lands (beapp://auth/callback?code=…).
 * Exchanges the code for a session; the root layout's auth gate then moves on.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeSignIn } from '@/infrastructure/supabase/supabase-auth';
import { parseAuthCallback } from '@/infrastructure/supabase/auth-callback';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

export default function AuthCallback() {
  const t = useTranslation();
  const params = useLocalSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const result = parseAuthCallback(params);
    if (!result || 'error' in result) {
      setFailed(true);
      return;
    }
    completeSignIn(result.code)
      .then(() => router.replace('/'))
      .catch(() => setFailed(true));
    // Run once for the link that opened this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: space.xl, gap: space.xl, justifyContent: 'center', alignItems: 'center' }}>
        {failed ? (
          <>
            <Text style={{ fontSize: fontSize.body, color: palette.sand900, textAlign: 'center', lineHeight: 26 }} accessibilityLiveRegion="polite">
              {t.auth.linkFailed}
            </Text>
            <Pressable
              onPress={() => router.replace('/sign-in')}
              style={{ backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignSelf: 'stretch', alignItems: 'center' }}
              accessibilityRole="button"
              accessibilityLabel={t.auth.title}
            >
              <Text style={{ color: palette.white, fontSize: fontSize.body, fontWeight: '600' }}>{t.auth.title}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={palette.amber600} />
            <Text style={{ fontSize: fontSize.body, color: palette.sand500 }}>{t.auth.completing}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
