import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/presentation/stores/locale.store';
import { LOCALE_CURRENCY, useCurrencyStore } from '@/presentation/stores/currency.store';
import { LOCALE_LABELS, type Locale, useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

const LOCALES: Locale[] = ['en-US', 'id', 'ja', 'ar'];

export default function LocaleScreen() {
  const t = useTranslation();
  const { locale, setLocale } = useLocaleStore();
  const setCurrency = useCurrencyStore((st) => st.setOverride);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.top}>
          <Text style={s.title}>{t.locale.title}</Text>
          <Text style={s.subtitle}>{t.locale.subtitle}</Text>
        </View>

        <View style={s.list}>
          {LOCALES.map((l) => {
            const selected = locale === l;
            return (
              <Pressable
                key={l}
                style={[s.row, selected && s.rowSelected]}
                onPress={() => { setLocale(l); setCurrency(LOCALE_CURRENCY[l]); }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={LOCALE_LABELS[l]}
              >
                <Text style={[s.rowText, selected && s.rowTextSelected]}>
                  {LOCALE_LABELS[l]}
                </Text>
                {selected && <Text style={s.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={s.cta}
          onPress={() => router.push('/onboarding/welcome')}
          accessibilityRole="button"
          accessibilityLabel={t.locale.cta}
        >
          <Text style={s.ctaText}>{t.locale.cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: palette.sand50 },
  inner:           { flex: 1, padding: space.xl, justifyContent: 'space-between' },
  top:             { marginTop: space.xl },
  title:           { fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900, marginBottom: space.sm },
  subtitle:        { fontSize: fontSize.callout, color: palette.sand500, lineHeight: 22 },
  list:            { gap: space.md },
  row:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1.5, borderColor: palette.sand200 },
  rowSelected:     { borderColor: palette.amber600, backgroundColor: palette.amber100 },
  rowText:         { fontSize: fontSize.body, color: palette.sand800 },
  rowTextSelected: { fontWeight: '700', color: palette.amber700 },
  check:           { fontSize: fontSize.lg, color: palette.amber600 },
  cta:             { backgroundColor: palette.amber600, borderRadius: radius.md, padding: space.lg, alignItems: 'center' },
  ctaText:         { color: palette.white, fontSize: fontSize.body, fontWeight: '600' },
});
