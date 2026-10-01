import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { calculateRealWage } from '@/domain/wage/wage';
import { isOk } from '@/lib/result';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';

export default function RevealScreen() {
  const t = useTranslation();
  const store = useOnboardingStore();

  const netPayMinor = store.netPayMinor ?? 0n;
  const paidHoursPerWeek = store.paidHoursPerWeek ?? 40;
  const commuteMinutesPerDay = store.commuteMinutesPerDay ?? 0;
  const commuteCostMinor = store.commuteCostMinor ?? 0n;
  const jobCostsMinor =
    commuteCostMinor +
    store.workMealsMinor +
    store.workClothesMinor +
    store.childcareMinor +
    store.decompressionMinor;
  const commuteHoursPerMonth = (commuteMinutesPerDay * 5 * 52) / 60 / 12;
  const jobHoursPerMonth = commuteHoursPerMonth + store.extraJobHoursPerMonth;

  const result = calculateRealWage({
    netPayMinor,
    payPeriod: store.payPeriod,
    jobCostsMinor,
    paidHoursPerWeek,
    jobHoursPerMonth,
  });

  if (!isOk(result)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: palette.error500, textAlign: 'center' }}>
            {t.onboarding.reveal.errorNegative}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ borderWidth: 1, borderColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
            accessibilityRole="button"
          >
            <Text style={{ color: palette.amber600, fontSize: 17, fontWeight: '600' }}>
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
      <View style={{ flex: 1, padding: 24, gap: 32 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.reveal.title}
        </Text>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: palette.sand200 }}>
            <Text style={{ fontSize: 13, color: palette.sand500, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.onboarding.reveal.nominal}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: palette.sand900 }}>
              ${nominalHourly.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 14, color: palette.sand500 }}>{t.onboarding.reveal.perHour}</Text>
          </View>

          <View style={{ flex: 1, backgroundColor: palette.amber100, borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: palette.amber300 }}>
            <Text style={{ fontSize: 13, color: palette.amber700, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.onboarding.reveal.real}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: palette.amber700 }}>
              ${realHourly.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 14, color: palette.amber700 }}>{t.onboarding.reveal.perHour}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 4, borderWidth: 1, borderColor: palette.sand200 }}>
          <Text style={{ fontSize: 15, color: palette.sand500 }}>{gapNote}</Text>
          <Text style={{ fontSize: 15, color: palette.sand500, lineHeight: 22, marginTop: 8 }}>
            {t.onboarding.reveal.lifeEnergyNote}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={{ backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
          accessibilityRole="button"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>{t.onboarding.reveal.cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
