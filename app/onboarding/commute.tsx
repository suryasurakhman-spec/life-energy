import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';

export default function CommuteScreen() {
  const t = useTranslation();
  const { setCommute } = useOnboardingStore();
  const [minutes, setMinutes] = useState('0');
  const [cost, setCost] = useState('0');

  function handleNext() {
    const mins = parseInt(minutes || '0', 10);
    const costCents = Math.round(parseFloat(cost || '0') * 100);
    setCommute(mins, BigInt(costCents));
    router.push('/onboarding/reveal');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: 24, gap: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.commute.title}
        </Text>
        <Text style={{ fontSize: 17, color: palette.sand500, lineHeight: 26 }}>
          {t.onboarding.commute.subtitle}
        </Text>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.commute.minutes.toUpperCase()}
          </Text>
          <View style={{ borderWidth: 1, borderColor: palette.sand200, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF' }}>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              style={{ fontSize: 20, paddingVertical: 14, color: palette.sand900 }}
              accessibilityLabel={t.onboarding.commute.minutes}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.commute.cost.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: palette.sand200, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 20, color: palette.sand700, marginRight: 4 }}>$</Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              style={{ flex: 1, fontSize: 20, paddingVertical: 14, color: palette.sand900 }}
              accessibilityLabel={t.onboarding.commute.cost}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleNext}
          style={{ backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.commute.next}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>{t.onboarding.commute.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
