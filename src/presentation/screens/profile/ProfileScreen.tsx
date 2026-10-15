import React, { useState } from 'react';
import { router } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentWage } from '@/presentation/hooks/useWage';
import { useCustomerInfo } from '@/presentation/hooks/usePurchases';
import { useTheme } from '@/theme';
import { exportData, type ExportFormat } from '@/application/export-data';
import { deleteAllData } from '@/application/delete-all-data';
import { SqliteUserDataStore } from '@/infrastructure/sqlite/sqlite-user-data-store';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { formatHourlyWage } from '@/lib/format';
import { homeCurrency } from '@/presentation/stores/currency.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useOnboardingStore } from '@/presentation/stores/onboarding.store';
import { deleteAccount, signOut } from '@/infrastructure/supabase/supabase-auth';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

const userData = new SqliteUserDataStore();

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
    // Static style: NativeWind drops function-form Pressable styles, which left rows unpadded.
    <TouchableOpacity
      style={s.row}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <Text style={[s.rowLabel, destructive && s.destructive]}>{label}</Text>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {onPress && !value ? <Text style={s.chevron}>›</Text> : null}
    </TouchableOpacity>
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
  const [deleting, setDeleting] = useState(false);
  const user = useAuthStore((st) => st.user);

  const realHourly = wage ? wage.realWageCached / 100 : null;
  const proStatus  = customerInfo?.isSubscribed ? t.profile.planPro : t.profile.planFree;

  const queryClient = useQueryClient();

  /** Reopen the wage steps with the last answers filled in. */
  const editWage = () => {
    const wizard = useOnboardingStore.getState();
    // shortcut: wages saved before the wizard kept its answers only seed pay and hours; commute and costs start empty.
    if (wizard.netPayMinor == null && wage) {
      wizard.setNetPay(wage.netPayMinor);
      wizard.setPayPeriod(wage.payPeriod);
      wizard.setPaidHours(wage.paidHoursPerWeek);
    }
    router.push('/onboarding/pay');
  };

  const runExport = async (format: ExportFormat) => {
    setExporting(true);
    try {
      await exportData(userData, format);
    } catch {
      Alert.alert(t.common.error, t.profile.exportFailed);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    Alert.alert(t.profile.exportFormatTitle, t.profile.exportFormatBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.exportCsv, onPress: () => void runExport('csv') },
      { text: t.profile.exportJson, onPress: () => void runExport('json') },
    ]);
  };

  // Signed in: the account goes too (FR-12). Without a session (dev builds) only local data exists.
  const runDelete = async () => {
    setDeleting(true);
    try {
      await deleteAllData(userData, user ? { deleteAccount, signOut } : undefined);
      useOnboardingStore.getState().reset(); // the saved wizard answers hold the salary too
      // Drop cached wage/logs so every screen reads the now-empty database.
      await queryClient.invalidateQueries();
      Alert.alert(t.profile.deleteTitle, user ? t.profile.deleteAccountDone : t.profile.deleteConfirmed);
    } catch {
      Alert.alert(t.common.error, user ? t.profile.deleteAccountFailed : t.profile.deleteFailed);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      t.profile.deleteTitle,
      user ? t.profile.deleteBodyAccount : t.profile.deleteBody,
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.profile.deleteAction, style: 'destructive', onPress: () => void runDelete() },
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
            value={realHourly != null && wage ? `${formatHourlyWage(realHourly, wage.currency)}/hr` : t.common.notSet}
            onPress={editWage}
            theme={theme}
          />
          <SettingsRow
            label={t.profile.currencyLabel}
            value={wage?.currency ?? homeCurrency()}
            onPress={() => router.push('/currency')}
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
            {...(!customerInfo?.isSubscribed ? { onPress: () => router.push('/paywall') } : {})}
            theme={theme}
          />
        </View>

        {/* Account (FR-13): sign out keeps the data on this phone; the auth gate returns to sign-in. */}
        {user && (
          <>
            <SectionHeader title={t.auth.section} theme={theme} />
            <View style={s.card}>
              <SettingsRow label={user.email ?? ''} theme={theme} />
              <View style={s.separator} />
              <SettingsRow label={t.auth.signOut} onPress={() => { void signOut(); }} theme={theme} />
            </View>
          </>
        )}

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
            label={deleting ? t.profile.deleting : t.profile.deleteData}
            {...(!deleting ? { onPress: handleDeleteData } : {})}
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
  scroll:        { padding: space.lg, paddingBottom: space.xxxl },
  title:         { fontSize: fontSize.title2, fontWeight: '700', color: theme.textPrimary, marginBottom: space.lg },
  sectionHeader: { fontSize: fontSize.xs, fontWeight: '600', color: theme.textSecondary, letterSpacing: 0.8, marginBottom: space.sm, marginTop: space.lg, marginLeft: space.xs },
  card:          { backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: space.xs },
  row:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  rowLabel:      { flex: 1, fontSize: fontSize.callout, color: theme.textPrimary },
  rowValue:      { fontSize: fontSize.md, color: theme.textSecondary },
  chevron:       { fontSize: fontSize.xl, color: theme.textSecondary },
  destructive:   { color: theme.error },
  separator:     { height: 1, backgroundColor: theme.border, marginHorizontal: space.lg },
  footer:        { fontSize: fontSize.xs, color: theme.textSecondary, textAlign: 'center', marginTop: space.xxl, lineHeight: 18 },
});
