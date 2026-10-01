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
import { formatCurrency } from '@/lib/format';
import { useTheme } from '@/theme';
import { useTranslation } from '@/lib/i18n';
import type { IncomeRecord } from '@/application/ports/income-repository.port';

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

  const [showForm, setShowForm] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [sourceText, setSourceText] = useState('');

  const { data: entries = [], isLoading } = useIncomeByMonth(CURRENT_MONTH);
  const logIncome = useLogIncome();

  const totalMinor = entries.reduce((sum, e) => sum + e.amountMinor, 0n);

  function handleSave() {
    const cents = Math.round(parseFloat(amountText || '0') * 100);
    if (cents <= 0) return;
    logIncome.mutate(
      {
        amountMinor: BigInt(cents),
        currency: 'USD',
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
            <Text style={s.totalValue}>{formatCurrency(totalMinor, 'USD')}</Text>
          </View>
        </View>

        {/* Add income form */}
        {showForm && (
          <View style={s.form}>
            <View style={s.formRow}>
              <Text style={s.formLabel}>{t.income.amountLabel}</Text>
              <View style={s.amountInputRow}>
                <Text style={s.currencySymbol}>$</Text>
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
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header:            { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title:             { fontSize: 20, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  totalRow:          { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  totalLabel:        { fontSize: 14, color: theme.textSecondary },
  totalValue:        { fontSize: 22, fontWeight: '700', color: theme.accent },
  form:              { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  formRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  formRowLast:       { borderBottomWidth: 0 },
  formLabel:         { fontSize: 14, color: theme.textPrimary, flex: 1 },
  amountInputRow:    { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  currencySymbol:    { fontSize: 16, color: theme.textSecondary, marginRight: 2 },
  amountInput:       { fontSize: 16, color: theme.textPrimary, textAlign: 'right', minWidth: 80 },
  sourceInput:       { fontSize: 16, color: theme.textPrimary, textAlign: 'right', flex: 1 },
  formActions:       { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelButton:      { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  cancelText:        { color: theme.textSecondary, fontWeight: '600' },
  saveButton:        { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.accent, alignItems: 'center' },
  saveButtonDisabled:{ opacity: 0.6 },
  saveText:          { color: theme.onAccent, fontWeight: '700' },
  listContent:       { flexGrow: 1, paddingBottom: 100 },
  row:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  rowLeft:           { flex: 1 },
  rowAmount:         { fontSize: 17, fontWeight: '600', color: theme.textPrimary },
  rowSource:         { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  deleteButton:      { padding: 8, marginLeft: 8 },
  deleteText:        { fontSize: 15, color: theme.textSecondary },
  separator:         { height: 1, backgroundColor: theme.border, marginHorizontal: 20 },
  addButton:         { position: 'absolute', bottom: 24, left: 20, right: 20, backgroundColor: theme.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
  addButtonText:     { color: theme.onAccent, fontSize: 17, fontWeight: '600' },
  muted:             { color: theme.textSecondary, fontSize: 15, textAlign: 'center' },
});
