import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCrossoverProjection } from '@/application/get-crossover-projection';
import { formatCurrency, formatDate } from '@/lib/format';
import { useTheme } from '@/theme';
import { useTranslation } from '@/lib/i18n';

function parseMinor(text: string): bigint {
  const n = parseFloat(text.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0n : BigInt(Math.round(n * 100));
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

  const [capitalText,  setCapitalText]  = useState('');
  const [expensesText, setExpensesText] = useState('');
  const [savingsText,  setSavingsText]  = useState('');
  const [ratePct,      setRatePct]      = useState('4');

  const capitalMinor  = parseMinor(capitalText);
  const expensesMinor = parseMinor(expensesText);
  const savingsMinor  = parseMinor(savingsText);
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
              label={t.crossover.capitalLabel}
              placeholder="e.g. 50000"
              value={capitalText}
              onChangeText={setCapitalText}
              theme={theme}
            />
            <InputRow
              label={t.crossover.expensesLabel}
              placeholder="e.g. 3000"
              value={expensesText}
              onChangeText={setExpensesText}
              theme={theme}
            />
            <InputRow
              label={t.crossover.savingsLabel}
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
                      {formatCurrency(result.crossoverCapitalMinor, 'USD')}
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
  scroll:          { padding: 20, paddingBottom: 48 },
  title:           { fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginBottom: 6 },
  subtitle:        { fontSize: 14, color: theme.textSecondary, lineHeight: 20, marginBottom: 20 },
  card:            { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 20 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  inputLabel:      { fontSize: 14, color: theme.textPrimary, flex: 1 },
  input:           { flex: 1, fontSize: 15, color: theme.textPrimary, textAlign: 'right' },
  resultCard:      { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 20, marginBottom: 20 },
  resultMain:      { alignItems: 'center', marginBottom: 16 },
  resultLabel:     { fontSize: 13, color: theme.textSecondary, marginBottom: 4 },
  resultValue:     { fontSize: 32, fontWeight: '800', color: theme.accent },
  divider:         { height: 1, backgroundColor: theme.border, marginBottom: 12 },
  resultRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultRowLabel:  { fontSize: 14, color: theme.textSecondary },
  resultRowValue:  { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  disclaimer:      { fontSize: 11, color: theme.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 16 },
  emptyCard:       { backgroundColor: theme.surfaceAlt, borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 20 },
  muted:           { color: theme.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
