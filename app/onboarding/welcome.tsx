import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

export default function WelcomeScreen() {
  const t = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: space.xl, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: space.lg }}>
          <Text style={{ fontSize: fontSize.hero, fontWeight: '700', color: palette.sand900, lineHeight: 40 }}>
            {t.onboarding.welcome.title}
          </Text>
          <Text style={{ fontSize: fontSize.body, color: palette.sand500, lineHeight: 26 }}>
            {t.onboarding.welcome.body1}
          </Text>
          <Text style={{ fontSize: fontSize.body, color: palette.sand500, lineHeight: 26 }}>
            {t.onboarding.welcome.body2}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/onboarding/pay')}
          style={{ backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.welcome.cta}
        >
          <Text style={{ color: palette.white, fontSize: fontSize.body, fontWeight: '600' }}>
            {t.onboarding.welcome.cta}
          </Text>
        </Pressable>

        <Text style={{ fontSize: fontSize.xs, color: palette.sand500, textAlign: 'center', marginTop: space.md, lineHeight: 16 }}>
          {t.profile.bookCredit} · Vicki Robin & Joe Dominguez
        </Text>
      </View>
    </SafeAreaView>
  );
}
