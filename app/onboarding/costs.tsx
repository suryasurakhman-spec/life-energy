import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { currencySymbol } from '@/lib/format';
import { toMonthlyHours } from '@/lib/calc';
import { light, palette } from '@/theme/colors';

type CostKey = 'meals' | 'clothes' | 'childcare' | 'decompression' | 'health';
type HourKey = 'gettingReady' | 'decompressing' | 'overtime';

const COST_KEYS: CostKey[] = ['meals', 'clothes', 'childcare', 'decompression', 'health'];
const HOUR_KEYS: HourKey[] = ['gettingReady', 'decompressing', 'overtime'];

/** Amount typed in major units → minor units; blank or invalid counts as 0. */
function toMinor(value: string): bigint {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? BigInt(Math.round(n * 100)) : 0n;
}

function toHours(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Full path (FR-8): every monthly job cost and the unpaid hours the job takes each week. */
export default function CostsScreen() {
  const t = useTranslation();
  const { currency, setExtraJobCosts } = useOnboardingStore();
  const [costs, setCosts] = useState<Record<CostKey, string>>({ meals: '', clothes: '', childcare: '', decompression: '', health: '' });
  const [hours, setHours] = useState<Record<HourKey, string>>({ gettingReady: '', decompressing: '', overtime: '' });
  const symbol = currencySymbol(currency);

  function handleNext() {
    const weeklyHours = HOUR_KEYS.reduce((sum, k) => sum + toHours(hours[k]), 0);
    setExtraJobCosts(
      {
        meals: toMinor(costs.meals),
        clothes: toMinor(costs.clothes),
        childcare: toMinor(costs.childcare),
        decompression: toMinor(costs.decompression),
        health: toMinor(costs.health),
      },
      toMonthlyHours(weeklyHours, 'weekly'),
    );
    router.push('/onboarding/reveal');
  }

  const sectionLabel = { fontSize: 14, color: palette.sand500, fontWeight: '500' as const };
  const field = { flexDirection: 'row' as const, alignItems: 'center' as const, borderWidth: 1, borderColor: palette.sand200, borderRadius: 12, paddingHorizontal: 16, backgroundColor: light.surface };
  const input = { flex: 1, fontSize: 18, paddingVertical: 12, color: palette.sand900 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>{t.onboarding.costs.title}</Text>
        <Text style={{ fontSize: 17, color: palette.sand500, lineHeight: 26 }}>{t.onboarding.costs.subtitle}</Text>

        <Text style={sectionLabel}>{t.onboarding.costs.monthlyCosts.toUpperCase()}</Text>
        {COST_KEYS.map(k => (
          <View key={k} style={{ gap: 6 }}>
            <Text style={{ fontSize: 15, color: palette.sand700 }}>{t.onboarding.costs[k]}</Text>
            <View style={field}>
              <Text style={{ fontSize: 18, color: palette.sand700, marginRight: 4 }}>{symbol}</Text>
              <TextInput
                value={costs[k]}
                onChangeText={v => setCosts(c => ({ ...c, [k]: v }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={palette.sand300}
                style={input}
                accessibilityLabel={t.onboarding.costs[k]}
              />
            </View>
          </View>
        ))}

        <Text style={[sectionLabel, { marginTop: 8 }]}>{t.onboarding.costs.weeklyHours.toUpperCase()}</Text>
        {HOUR_KEYS.map(k => (
          <View key={k} style={{ gap: 6 }}>
            <Text style={{ fontSize: 15, color: palette.sand700 }}>{t.onboarding.costs[k]}</Text>
            <View style={field}>
              <TextInput
                value={hours[k]}
                onChangeText={v => setHours(h => ({ ...h, [k]: v }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={palette.sand300}
                style={input}
                accessibilityLabel={t.onboarding.costs[k]}
              />
              <Text style={{ fontSize: 15, color: palette.sand500 }}>{t.onboarding.hours.perWeek}</Text>
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleNext}
          style={{ marginTop: 8, backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.costs.next}
        >
          <Text style={{ color: light.onAccent, fontSize: 17, fontWeight: '600' }}>{t.onboarding.costs.next}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
