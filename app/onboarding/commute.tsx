import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { currencySymbol } from '@/lib/format';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

export default function CommuteScreen() {
  const t = useTranslation();
  const { setCommute, currency, commuteMinutesPerDay, commuteCostMinor } = useOnboardingStore();
  const [minutes, setMinutes] = useState(String(commuteMinutesPerDay ?? 0));
  const [cost, setCost] = useState(String(Number(commuteCostMinor ?? 0n) / 100));

  function handleNext() {
    const mins = parseInt(minutes || '0', 10);
    const costCents = Math.round(parseFloat(cost || '0') * 100);
    setCommute(mins, BigInt(costCents));
    router.push('/onboarding/choice');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: space.xl, gap: space.xl }}>
        <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.commute.title}
        </Text>
        <Text style={{ fontSize: fontSize.body, color: palette.sand500, lineHeight: 26 }}>
          {t.onboarding.commute.subtitle}
        </Text>

        <View style={{ gap: space.sm }}>
          <Text style={{ fontSize: fontSize.md, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.commute.minutes.toUpperCase()}
          </Text>
          <View style={{ borderWidth: 1, borderColor: palette.sand200, borderRadius: radius.md, paddingHorizontal: space.lg, backgroundColor: palette.white }}>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              style={{ fontSize: fontSize.xl, paddingVertical: space.md, color: palette.sand900 }}
              accessibilityLabel={t.onboarding.commute.minutes}
            />
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <Text style={{ fontSize: fontSize.md, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.commute.cost.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: palette.sand200, borderRadius: radius.md, paddingHorizontal: space.lg, backgroundColor: palette.white }}>
            <Text style={{ fontSize: fontSize.xl, color: palette.sand700, marginRight: space.xs }}>{currencySymbol(currency)}</Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              style={{ flex: 1, fontSize: fontSize.xl, paddingVertical: space.md, color: palette.sand900 }}
              accessibilityLabel={t.onboarding.commute.cost}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleNext}
          style={{ backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.commute.next}
        >
          <Text style={{ color: palette.white, fontSize: fontSize.body, fontWeight: '600' }}>{t.onboarding.commute.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
