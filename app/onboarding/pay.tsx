import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore, type PayPeriod } from '@/presentation/stores/onboarding.store';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';

export default function PayScreen() {
  const t = useTranslation();
  const { payPeriod, setPayPeriod, setNetPay } = useOnboardingStore();
  const [amount, setAmount] = useState('');

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
      <View style={{ flex: 1, padding: 24, gap: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.sand900 }}>
          {t.onboarding.pay.title}
        </Text>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.pay.netPay.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: palette.sand200, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 20, color: palette.sand700, marginRight: 4 }}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={{ flex: 1, fontSize: 20, paddingVertical: 16, color: palette.sand900 }}
              placeholderTextColor={palette.sand300}
              accessibilityLabel={t.onboarding.pay.netPay}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, color: palette.sand500, fontWeight: '500' }}>
            {t.onboarding.pay.period.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PERIODS.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setPayPeriod(key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: payPeriod === key }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: payPeriod === key ? palette.amber600 : palette.sand200,
                  backgroundColor: payPeriod === key ? palette.amber100 : '#FFFFFF',
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
          style={{ backgroundColor: palette.amber600, borderRadius: 12, padding: 16, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.pay.next}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>{t.onboarding.pay.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
