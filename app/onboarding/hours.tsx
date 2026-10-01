import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';

export default function HoursScreen() {
  const t = useTranslation();
  const { setPaidHours } = useOnboardingStore();
  const [hours, setHours] = useState('40');

  function handleNext() {
    const h = parseFloat(hours || '40');
    if (h <= 0) return;
    setPaidHours(h);
    router.push('/onboarding/commute');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: 24, gap: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.hours.title}
        </Text>
        <Text style={{ fontSize: 17, color: palette.sand500, lineHeight: 26 }}>
          {t.onboarding.hours.hint}
        </Text>

        <View style={{ borderWidth: 1, borderColor: palette.sand200, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF' }}>
          <TextInput
            value={hours}
            onChangeText={setHours}
            keyboardType="decimal-pad"
            style={{ fontSize: 24, paddingVertical: 16, color: palette.sand900, textAlign: 'center' }}
            accessibilityLabel={t.onboarding.hours.label}
          />
        </View>
        <Text style={{ fontSize: 14, color: palette.sand500, textAlign: 'center' }}>
          {t.onboarding.hours.perWeek}
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleNext}
          style={{ backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.hours.next}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>{t.onboarding.hours.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
