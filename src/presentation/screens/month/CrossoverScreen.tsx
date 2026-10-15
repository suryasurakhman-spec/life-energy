import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCrossoverProjection } from '@/application/get-crossover-projection';
import { currencySymbol, formatCurrency, formatDate, toMinor } from '@/lib/format';
import { useCurrentWage } from '@/presentation/hooks/useWage';
import { homeCurrency } from '@/presentation/stores/currency.store';
import { useTheme } from '@/theme';
import { useTranslation } from '@/lib/i18n';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

function parseMinor(text: string, currency: string): bigint {
  const n = parseFloat(text.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0n : toMinor(n, currency);
}

export function CrossoverScreen() {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);

  function monthsLabel(months: number): string {
    if (months === 0) return t.crossover.alreadyCrossed;
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts: string[] = [];
    if (y > 0) parts.push(`${y} ${t.crossover.yearsAbbr}`);
    if (m > 0) parts.push(`${m} ${t.crossover.monthsAbbr}`);
    return parts.join(' ');
  }

  const { data: wage } = useCurrentWage();
  const currency = wage?.currency ?? homeCurrency();

  const [capitalText,  setCapitalText]  = useState('');
  const [expensesText, setExpensesText] = useState('');
  const [savingsText,  setSavingsText]  = useState('');
  const [ratePct,      setRatePct]      = useState('4');

  const capitalMinor  = parseMinor(capitalText, currency);
  const expensesMinor = parseMinor(expensesText, currency);
  const savingsMinor  = parseMinor(savingsText, currency);
  const annualRate    = parseFloat(ratePct) || 4;

  const canProject = expensesMinor > 0n;
  const result = canProject
    ? getCrossoverProjection({
        currentCapitalMinor:  capitalMinor,
        monthlyExpensesMinor: expensesMinor,
        monthlySavingsMinor:  savingsMinor,
        annualRatePct:        annualRate,
      })
    : null;

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{t.crossover.title}</Text>
          <Text style={s.subtitle}>{t.crossover.subtitle}</Text>

          {/* Inputs */}
          <View style={s.card}>
            <InputRow
              label={`${t.crossover.capitalLabel} (${currencySymbol(currency)})`}
              placeholder="e.g. 50000"
              value={capitalText}
              onChangeText={setCapitalText}
              theme={theme}
            />
            <InputRow
              label={`${t.crossover.expensesLabel} (${currencySymbol(currency)})`}
              placeholder="e.g. 3000"
              value={expensesText}
              onChangeText={setExpensesText}
              theme={theme}
            />
            <InputRow
              label={`${t.crossover.savingsLabel} (${currencySymbol(currency)})`}
              placeholder="e.g. 500"
              value={savingsText}
              onChangeText={setSavingsText}
              theme={theme}
            />
            <InputRow
              label={t.crossover.rateLabel}
              placeholder="4"
              value={ratePct}
              onChangeText={setRatePct}
              theme={theme}
            />
          </View>

          {/* Result */}
          {result ? (
            <View style={s.resultCard}>
              <View style={s.resultMain}>
                <Text style={s.resultLabel}>{t.crossover.timeToGo}</Text>
                <Text style={s.resultValue}>{monthsLabel(result.monthsToGo)}</Text>
              </View>

              {result.monthsToGo > 0 && (
                <>
                  <View style={s.divider} />
                  <View style={s.resultRow}>
                    <Text style={s.resultRowLabel}>{t.crossover.projectedDate}</Text>
                    <Text style={s.resultRowValue}>{formatDate(result.projectedDate)}</Text>
                  </View>
                  <View style={s.resultRow}>
                    <Text style={s.resultRowLabel}>{t.crossover.capitalNeeded}</Text>
                    <Text style={s.resultRowValue}>
                      {formatCurrency(result.crossoverCapitalMinor, currency)}
                    </Text>
                  </View>
                </>
              )}

              <Text style={s.disclaimer}>{t.crossover.disclaimer}</Text>
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Text style={s.muted}>{t.crossover.enterExpenses}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface InputRowProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: ReturnType<typeof useTheme>;
}

function InputRow({ label, placeholder, value, onChangeText, theme }: InputRowProps) {
  const s = styles(theme);
  return (
    <View style={s.inputRow}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.bg },
  scroll:          { padding: space.lg, paddingBottom: space.xxxl },
  title:           { fontSize: fontSize.title2, fontWeight: '700', color: theme.textPrimary, marginBottom: space.sm },
  subtitle:        { fontSize: fontSize.md, color: theme.textSecondary, lineHeight: 20, marginBottom: space.lg },
  card:            { backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: space.lg },
  inputRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: theme.border },
  inputLabel:      { fontSize: fontSize.md, color: theme.textPrimary, flex: 1 },
  input:           { flex: 1, fontSize: fontSize.callout, color: theme.textPrimary, textAlign: 'right' },
  resultCard:      { backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, padding: space.lg, marginBottom: space.lg },
  resultMain:      { alignItems: 'center', marginBottom: space.lg },
  resultLabel:     { fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: space.xs },
  resultValue:     { fontSize: fontSize.xxl, fontWeight: '800', color: theme.accent },
  divider:         { height: 1, backgroundColor: theme.border, marginBottom: space.md },
  resultRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
  resultRowLabel:  { fontSize: fontSize.md, color: theme.textSecondary },
  resultRowValue:  { fontSize: fontSize.md, fontWeight: '600', color: theme.textPrimary },
  disclaimer:      { fontSize: fontSize.tiny, color: theme.textSecondary, textAlign: 'center', marginTop: space.lg, lineHeight: 16 },
  emptyCard:       { backgroundColor: theme.surfaceAlt, borderRadius: radius.md, padding: space.xl, alignItems: 'center', marginBottom: space.lg },
  muted:           { color: theme.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 20 },
});
