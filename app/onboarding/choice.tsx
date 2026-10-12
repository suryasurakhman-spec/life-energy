import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { light, palette } from '@/theme/colors';

/** PRD first-run step 5: quick path straight to the reveal, or the full job-cost path. */
export default function ChoiceScreen() {
  const t = useTranslation();
  const { clearExtraJobCosts } = useOnboardingStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>
            {t.onboarding.choice.title}
          </Text>
          <Text style={{ fontSize: 17, color: palette.sand500, lineHeight: 26 }}>
            {t.onboarding.choice.body}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => router.push('/onboarding/costs')}
            style={{ backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={t.onboarding.choice.full}
          >
            <Text style={{ color: light.onAccent, fontSize: 17, fontWeight: '600' }}>{t.onboarding.choice.full}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              clearExtraJobCosts();
              router.push('/onboarding/reveal');
            }}
            style={{ borderWidth: 1, borderColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={t.onboarding.choice.quick}
          >
            <Text style={{ color: palette.amber700, fontSize: 17, fontWeight: '600' }}>{t.onboarding.choice.quick}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
