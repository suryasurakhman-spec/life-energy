import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { currencySymbol } from '@/lib/format';
import { keys } from '@/lib/query-keys';
import { useCurrentWage } from '@/presentation/hooks/useWage';
import { useCurrencyStore, SUPPORTED_CURRENCIES } from '@/presentation/stores/currency.store';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { SqliteWageRepository } from '@/infrastructure/sqlite/sqlite-wage-repository';
import { light, palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

const wageRepo = new SqliteWageRepository();

/** Profile → Currency: override the detected home currency. */
export default function CurrencyScreen() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { data: wage } = useCurrentWage();
  const setOverride = useCurrencyStore(s => s.setOverride);
  const setWizardCurrency = useOnboardingStore(s => s.setCurrency);
  const current = wage?.currency ?? useCurrencyStore.getState().override ?? 'USD';

  async function choose(code: string) {
    setOverride(code);
    setWizardCurrency(code);
    if (wage && wage.currency !== code) {
      await wageRepo.setCurrency(wage.id, code);
      await queryClient.invalidateQueries({ queryKey: keys.wage.current(), refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: keys.wage.history(), refetchType: 'all' });
    }
    // /currency sits outside the tab stack, so return to Profile explicitly.
    router.replace('/(tabs)/profile');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.md }}>
        <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }}>{t.profile.currencyTitle}</Text>
        <Text style={{ fontSize: fontSize.callout, color: palette.sand500, lineHeight: 22, marginBottom: space.sm }}>{t.profile.currencyBody}</Text>
        {SUPPORTED_CURRENCIES.map(code => {
          const selected = code === current;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => void choose(code)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: space.lg,
                paddingVertical: space.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: selected ? palette.amber600 : palette.sand200,
                backgroundColor: selected ? palette.amber100 : light.surface,
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={code}
            >
              <Text style={{ fontSize: fontSize.body, fontWeight: '600', color: selected ? palette.amber700 : palette.sand900 }}>{code}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Text style={{ fontSize: fontSize.body, color: palette.sand500 }}>{currencySymbol(code)}</Text>
                {selected ? <Text style={{ fontSize: fontSize.body, color: palette.amber700 }}>✓</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
