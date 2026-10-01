import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentWage } from '@/presentation/hooks/useWage';
import { useCustomerInfo } from '@/presentation/hooks/usePurchases';
import { useTheme } from '@/theme';
import { exportData } from '@/application/export-data';
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';
import { useTranslation } from '@/lib/i18n';

const expenseRepo = new SqliteExpenseRepository();

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  theme: ReturnType<typeof useTheme>;
}

function SettingsRow({ label, value, onPress, destructive = false, theme }: RowProps) {
  const s = styles(theme);
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <Text style={[s.rowLabel, destructive && s.destructive]}>{label}</Text>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {onPress && !value ? <Text style={s.chevron}>›</Text> : null}
    </Pressable>
  );
}

function SectionHeader({ title, theme }: { title: string; theme: ReturnType<typeof useTheme> }) {
  const s = styles(theme);
  return <Text style={s.sectionHeader}>{title}</Text>;
}

export function ProfileScreen() {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);
  const { data: wage } = useCurrentWage();
  const { data: customerInfo } = useCustomerInfo();
  const [exporting, setExporting] = useState(false);

  const realHourly = wage ? wage.realWageCached / 100 : null;
  const proStatus  = customerInfo?.isSubscribed ? t.profile.planPro : t.profile.planFree;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData(expenseRepo);
    } catch (e) {
      Alert.alert(t.common.error, 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      t.profile.deleteTitle,
      t.profile.deleteBody,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.deleteAction,
          style: 'destructive',
          onPress: () => {
            // TODO: wire up delete-all-data use case in v2
            Alert.alert(t.profile.deleteTitle, t.profile.deleteConfirmed);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>{t.profile.title}</Text>

        {/* Wage */}
        <SectionHeader title={t.profile.sectionWage} theme={theme} />
        <View style={s.card}>
          <SettingsRow
            label={t.profile.realWageLabel}
            value={realHourly != null ? `$${realHourly.toFixed(2)}/hr` : t.common.notSet}
            theme={theme}
          />
          {wage && (
            <>
              <View style={s.separator} />
              <SettingsRow
                label={t.profile.payPeriodLabel}
                value={wage.payPeriod}
                theme={theme}
              />
              <View style={s.separator} />
              <SettingsRow
                label={t.profile.effectiveFromLabel}
                value={wage.effectiveFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                theme={theme}
              />
            </>
          )}
        </View>

        {/* Subscription */}
        <SectionHeader title={t.profile.sectionSubscription} theme={theme} />
        <View style={s.card}>
          <SettingsRow
            label={t.profile.planLabel}
            value={proStatus}
            theme={theme}
          />
          {customerInfo?.managementURL && (
            <>
              <View style={s.separator} />
              <SettingsRow
                label={t.profile.manageSubscription}
                onPress={() => { /* deep link to management URL */ }}
                theme={theme}
              />
            </>
          )}
        </View>

        {/* Data */}
        <SectionHeader title={t.profile.sectionData} theme={theme} />
        <View style={s.card}>
          <SettingsRow
            label={exporting ? t.profile.exporting : t.profile.exportData}
            {...(!exporting ? { onPress: handleExport } : {})}
            theme={theme}
          />
          <View style={s.separator} />
          <SettingsRow
            label={t.profile.deleteData}
            onPress={handleDeleteData}
            destructive
            theme={theme}
          />
        </View>

        {/* About */}
        <SectionHeader title={t.profile.sectionAbout} theme={theme} />
        <View style={s.card}>
          <SettingsRow label={t.profile.bookCredit} value="Vicki Robin & Joe Dominguez" theme={theme} />
          <View style={s.separator} />
          <SettingsRow label={t.profile.notFinancialAdvice} theme={theme} />
        </View>

        <Text style={s.footer}>{t.profile.footer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: theme.bg },
  scroll:        { padding: 20, paddingBottom: 48 },
  title:         { fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginBottom: 20 },
  sectionHeader: { fontSize: 12, fontWeight: '600', color: theme.textSecondary, letterSpacing: 0.8, marginBottom: 6, marginTop: 20, marginLeft: 4 },
  card:          { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 4 },
  row:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel:      { flex: 1, fontSize: 15, color: theme.textPrimary },
  rowValue:      { fontSize: 14, color: theme.textSecondary },
  chevron:       { fontSize: 20, color: theme.textSecondary },
  destructive:   { color: theme.error },
  separator:     { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },
  footer:        { fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginTop: 32, lineHeight: 18 },
});
