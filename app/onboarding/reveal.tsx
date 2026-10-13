import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { saveRealWage } from '@/application/calculate-real-wage';
import { SqliteWageRepository } from '@/infrastructure/sqlite/sqlite-wage-repository';
import { keys } from '@/lib/query-keys';
import { calculateRealWage } from '@/domain/wage/wage';
import { isOk } from '@/lib/result';
import { useTranslation } from '@/lib/i18n';
import { formatHourlyWage } from '@/lib/format';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

export default function RevealScreen() {
  const t = useTranslation();
  const store = useOnboardingStore();
  const queryClient = useQueryClient();

  const netPayMinor = store.netPayMinor ?? 0n;
  const paidHoursPerWeek = store.paidHoursPerWeek ?? 40;
  const commuteMinutesPerDay = store.commuteMinutesPerDay ?? 0;
  const commuteCostMinor = store.commuteCostMinor ?? 0n;
  const jobCostsMinor =
    commuteCostMinor +
    store.workMealsMinor +
    store.workClothesMinor +
    store.childcareMinor +
    store.decompressionMinor +
    store.healthMinor;
  const commuteHoursPerMonth = (commuteMinutesPerDay * 5 * 52) / 60 / 12;
  const jobHoursPerMonth = commuteHoursPerMonth + store.extraJobHoursPerMonth;

  const wageInput = {
    netPayMinor,
    payPeriod: store.payPeriod,
    jobCostsMinor,
    paidHoursPerWeek,
    jobHoursPerMonth,
  };
  const result = calculateRealWage(wageInput);

  async function handleStart() {
    await saveRealWage(new SqliteWageRepository(), wageInput, store.currency);
    // refetchType 'all': the tabs' wage query is inactive here, and the first-run redirect reads it on mount.
    await queryClient.invalidateQueries({ queryKey: keys.wage.current(), refetchType: 'all' });
    await queryClient.invalidateQueries({ queryKey: keys.wage.history(), refetchType: 'all' });
    router.replace('/(tabs)');
  }

  if (!isOk(result)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
        <View style={{ flex: 1, padding: space.xl, justifyContent: 'center', gap: space.lg }}>
          <Text style={{ fontSize: fontSize.title3, fontWeight: '700', color: palette.error500, textAlign: 'center' }}>
            {t.onboarding.reveal.errorNegative}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ borderWidth: 1, borderColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' }}
            accessibilityRole="button"
          >
            <Text style={{ color: palette.amber600, fontSize: fontSize.body, fontWeight: '600' }}>
              {t.onboarding.reveal.goBack}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { realHourly, nominalHourly, gapPercent } = result.value;
  const gapNote = t.onboarding.reveal.gapNote.replace('{pct}', gapPercent.toFixed(0));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: space.xl, gap: space.xxl }}>
        <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.reveal.title}
        </Text>

        <View style={{ flexDirection: 'row', gap: space.lg }}>
          <View style={{ flex: 1, backgroundColor: palette.white, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: palette.sand200 }}>
            <Text style={{ fontSize: fontSize.sm, color: palette.sand500, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.onboarding.reveal.nominal}
            </Text>
            <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: palette.sand900 }}>
              {formatHourlyWage(nominalHourly, store.currency)}
            </Text>
            <Text style={{ fontSize: fontSize.md, color: palette.sand500 }}>{t.onboarding.reveal.perHour}</Text>
          </View>

          <View style={{ flex: 1, backgroundColor: palette.amber100, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: palette.amber300 }}>
            <Text style={{ fontSize: fontSize.sm, color: palette.amber700, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.onboarding.reveal.real}
            </Text>
            <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: palette.amber700 }}>
              {formatHourlyWage(realHourly, store.currency)}
            </Text>
            <Text style={{ fontSize: fontSize.md, color: palette.amber700 }}>{t.onboarding.reveal.perHour}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: palette.white, borderRadius: radius.lg, padding: space.lg, gap: space.xs, borderWidth: 1, borderColor: palette.sand200 }}>
          <Text style={{ fontSize: fontSize.callout, color: palette.sand500 }}>{gapNote}</Text>
          <Text style={{ fontSize: fontSize.callout, color: palette.sand500, lineHeight: 22, marginTop: space.sm }}>
            {t.onboarding.reveal.lifeEnergyNote}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleStart}
          style={{ backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' }}
          accessibilityRole="button"
        >
          <Text style={{ color: palette.white, fontSize: fontSize.body, fontWeight: '600' }}>{t.onboarding.reveal.cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
