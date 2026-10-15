import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore, type PayPeriod } from '@/presentation/stores/onboarding.store';
import { homeCurrency } from '@/presentation/stores/currency.store';
import { useTranslation } from '@/lib/i18n';
import { currencySymbol } from '@/lib/format';
import { minorDigits } from '@/domain/price/parser';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

export default function PayScreen() {
  const t = useTranslation();
  const { payPeriod, setPayPeriod, netPayMinor, setNetPay, currency, setCurrency } = useOnboardingStore();

  // The saved currency override loads asynchronously; read it when the wizard reaches pay.
  useEffect(() => {
    setCurrency(homeCurrency());
  }, [setCurrency]);
  const [amount, setAmount] = useState(netPayMinor != null ? String(Number(netPayMinor) / 100) : '');

  const PERIODS: { key: PayPeriod; label: string }[] = [
    { key: 'weekly',      label: t.onboarding.pay.periods.weekly },
    { key: 'biweekly',    label: t.onboarding.pay.periods.biweekly },
    { key: 'semimonthly', label: t.onboarding.pay.periods.semimonthly },
    { key: 'monthly',     label: t.onboarding.pay.periods.monthly },
  ];

  function handleNext() {
    const cents = Math.round(parseFloat(amount || '0') * 100);
    if (cents <= 0) return;
    setNetPay(BigInt(cents));
    router.push('/onboarding/hours');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <View style={{ flex: 1, padding: space.xl, gap: space.xl }}>
        <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.pay.title}
        </Text>

        <View style={{ gap: space.sm }}>
          <Text style={{ fontSize: fontSize.md, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.pay.netPay.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: palette.sand200, borderRadius: radius.md, paddingHorizontal: space.lg, backgroundColor: palette.white }}>
            <Text style={{ fontSize: fontSize.xl, color: palette.sand700, marginRight: space.xs }}>{currencySymbol(currency)}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              // Yen and won have no cents; rupiah formally does, but nobody writes them.
              placeholder={minorDigits(currency) === 0 || currency === 'IDR' ? '0' : '0.00'}
              style={{ flex: 1, fontSize: fontSize.xl, paddingVertical: space.lg, color: palette.sand900 }}
              placeholderTextColor={palette.sand300}
              accessibilityLabel={t.onboarding.pay.netPay}
            />
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <Text style={{ fontSize: fontSize.md, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.pay.period.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {PERIODS.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setPayPeriod(key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: payPeriod === key }}
                style={{
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: payPeriod === key ? palette.amber600 : palette.sand200,
                  backgroundColor: payPeriod === key ? palette.amber100 : palette.white,
                }}
              >
                <Text style={{ color: payPeriod === key ? palette.amber700 : palette.sand700, fontWeight: '500' }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleNext}
          style={{ backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.pay.next}
        >
          <Text style={{ color: palette.white, fontSize: fontSize.body, fontWeight: '600' }}>{t.onboarding.pay.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
