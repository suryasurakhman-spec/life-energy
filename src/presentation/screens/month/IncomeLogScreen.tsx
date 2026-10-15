import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIncomeByMonth, useLogIncome, useRemoveIncome } from '@/presentation/hooks/useIncome';
import { currencySymbol, formatCurrency, toMinor } from '@/lib/format';
import { useCurrentWage } from '@/presentation/hooks/useWage';
import { homeCurrency } from '@/presentation/stores/currency.store';
import { useTheme } from '@/theme';
import { useTranslation } from '@/lib/i18n';
import type { IncomeRecord } from '@/application/ports/income-repository.port';
import { fontSize } from '@/theme/typography';
import { fabClearance, radius, space } from '@/theme/layout';

function toMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const CURRENT_MONTH = toMonthStr(new Date());

interface IncomeRowProps {
  item: IncomeRecord;
  month: string;
  theme: ReturnType<typeof useTheme>;
  t: ReturnType<typeof useTranslation>;
}

function IncomeRow({ item, month, theme, t }: IncomeRowProps) {
  const s = styles(theme);
  const removeIncome = useRemoveIncome();
  return (
    <View style={s.row}>
      <View style={s.rowLeft}>
        <Text style={s.rowAmount}>{formatCurrency(item.amountMinor, item.currency)}</Text>
        {item.source ? <Text style={s.rowSource}>{item.source}</Text> : null}
      </View>
      <Pressable
        onPress={() => removeIncome.mutate({ id: item.id, month })}
        disabled={removeIncome.isPending}
        style={s.deleteButton}
        accessibilityRole="button"
        accessibilityLabel={t.common.close}
      >
        <Text style={s.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

export function IncomeLogScreen() {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);

  const { data: wage } = useCurrentWage();
  const currency = wage?.currency ?? homeCurrency();

  const [showForm, setShowForm] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [sourceText, setSourceText] = useState('');

  const { data: entries = [], isLoading } = useIncomeByMonth(CURRENT_MONTH);
  const logIncome = useLogIncome();

  const totalMinor = entries.reduce((sum, e) => sum + e.amountMinor, 0n);

  function handleSave() {
    const amountMinor = toMinor(parseFloat(amountText || '0'), currency);
    if (amountMinor <= 0n) return;
    logIncome.mutate(
      {
        amountMinor,
        currency,
        month: CURRENT_MONTH,
        ...(sourceText.trim() ? { source: sourceText.trim() } : {}),
      },
      {
        onSuccess: () => {
          setAmountText('');
          setSourceText('');
          setShowForm(false);
        },
      },
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{t.income.title}</Text>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>{t.income.total}</Text>
            <Text style={s.totalValue}>{formatCurrency(totalMinor, currency)}</Text>
          </View>
        </View>

        {/* Add income form */}
        {showForm && (
          <View style={s.form}>
            <View style={s.formRow}>
              <Text style={s.formLabel}>{t.income.amountLabel}</Text>
              <View style={s.amountInputRow}>
                <Text style={s.currencySymbol}>{currencySymbol(currency)}</Text>
                <TextInput
                  style={s.amountInput}
                  value={amountText}
                  onChangeText={setAmountText}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.textSecondary}
                  accessibilityLabel={t.income.amountLabel}
                  autoFocus
                />
              </View>
            </View>
            <View style={[s.formRow, s.formRowLast]}>
              <Text style={s.formLabel}>{t.income.sourceLabel}</Text>
              <TextInput
                style={s.sourceInput}
                value={sourceText}
                onChangeText={setSourceText}
                placeholder={t.income.sourcePlaceholder}
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel={t.income.sourceLabel}
                returnKeyType="done"
              />
            </View>
            <View style={s.formActions}>
              <Pressable
                style={s.cancelButton}
                onPress={() => { setShowForm(false); setAmountText(''); setSourceText(''); }}
                accessibilityRole="button"
              >
                <Text style={s.cancelText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={[s.saveButton, logIncome.isPending && s.saveButtonDisabled]}
                onPress={handleSave}
                disabled={logIncome.isPending}
                accessibilityRole="button"
              >
                <Text style={s.saveText}>
                  {logIncome.isPending ? t.common.saving : t.common.save}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Entry list */}
        {isLoading ? (
          <View style={s.center}>
            <Text style={s.muted}>{t.common.loading}</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <IncomeRow item={item} month={CURRENT_MONTH} theme={theme} t={t} />
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            ListEmptyComponent={
              <View style={s.center}>
                <Text style={s.muted}>{t.income.empty}</Text>
              </View>
            }
            contentContainerStyle={s.listContent}
          />
        )}

        {/* Add button */}
        {!showForm && (
          <Pressable
            style={s.addButton}
            onPress={() => setShowForm(true)}
            accessibilityRole="button"
            accessibilityLabel={t.income.addButton}
          >
            <Text style={s.addButtonText}>{t.income.addButton}</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:         { flex: 1, backgroundColor: theme.bg },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl },
  header:            { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title:             { fontSize: fontSize.xl, fontWeight: '700', color: theme.textPrimary, marginBottom: space.xs },
  totalRow:          { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  totalLabel:        { fontSize: fontSize.md, color: theme.textSecondary },
  totalValue:        { fontSize: fontSize.title2, fontWeight: '700', color: theme.accent },
  form:              { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md },
  formRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: theme.border },
  formRowLast:       { borderBottomWidth: 0 },
  formLabel:         { fontSize: fontSize.md, color: theme.textPrimary, flex: 1 },
  amountInputRow:    { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  currencySymbol:    { fontSize: fontSize.input, color: theme.textSecondary, marginRight: space.xxs },
  amountInput:       { fontSize: fontSize.input, color: theme.textPrimary, textAlign: 'right', minWidth: 80 },
  sourceInput:       { fontSize: fontSize.input, color: theme.textPrimary, textAlign: 'right', flex: 1 },
  formActions:       { flexDirection: 'row', gap: space.md, marginTop: space.md },
  cancelButton:      { flex: 1, paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  cancelText:        { color: theme.textSecondary, fontWeight: '600' },
  saveButton:        { flex: 1, paddingVertical: space.md, borderRadius: radius.md, backgroundColor: theme.accent, alignItems: 'center' },
  saveButtonDisabled:{ opacity: 0.6 },
  saveText:          { color: theme.onAccent, fontWeight: '700' },
  listContent:       { flexGrow: 1, paddingBottom: fabClearance },
  row:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  rowLeft:           { flex: 1 },
  rowAmount:         { fontSize: fontSize.body, fontWeight: '600', color: theme.textPrimary },
  rowSource:         { fontSize: fontSize.sm, color: theme.textSecondary, marginTop: space.xxs },
  deleteButton:      { padding: space.sm, marginLeft: space.sm },
  deleteText:        { fontSize: fontSize.callout, color: theme.textSecondary },
  separator:         { height: 1, backgroundColor: theme.border, marginHorizontal: space.lg },
  addButton:         { position: 'absolute', bottom: 24, left: 20, right: 20, backgroundColor: theme.accent, borderRadius: radius.md, padding: space.lg, alignItems: 'center' },
  addButtonText:     { color: theme.onAccent, fontSize: fontSize.body, fontWeight: '600' },
  muted:             { color: theme.textSecondary, fontSize: fontSize.callout, textAlign: 'center' },
});
