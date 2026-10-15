import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary, type CategoryTotal } from '@/application/get-monthly-summary';
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';
import { useCurrentWage, useRealHourlyWage, useWorkDayMinutes } from '@/presentation/hooks/useWage';
import { homeCurrency } from '@/presentation/stores/currency.store';
import { useHasProAccess } from '@/presentation/hooks/useEntitlement';
import { formatCurrency, formatHours } from '@/lib/format';
import { useTheme } from '@/theme';
import { MonthlyReviewSheet } from './MonthlyReviewSheet';
import { useTranslation } from '@/lib/i18n';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

const repo = new SqliteExpenseRepository();

function toMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface CategoryRowProps {
  item: CategoryTotal;
  onReview: (categoryId: string, categoryName: string) => void;
}

function CategoryRow({ item, onReview }: CategoryRowProps) {
  const workDay = useWorkDayMinutes();
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);
  return (
    <Pressable
      style={s.row}
      onPress={() => item.categoryId && onReview(item.categoryId, item.categoryName)}
      accessibilityRole="button"
      accessibilityLabel={`${item.categoryName}, ${formatCurrency(item.totalMinor, item.currency)}, ${formatHours(item.totalMinutes, { workDayMinutes: workDay })}`}
    >
      <View style={s.rowLeft}>
        <Text style={s.categoryName}>{item.categoryName}</Text>
        <Text style={s.categoryCount}>{item.count} {item.count !== 1 ? t.month.items : t.month.item}</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={s.amount}>{formatCurrency(item.totalMinor, item.currency)}</Text>
        <Text style={s.hours}>{formatHours(item.totalMinutes, { workDayMinutes: workDay })}</Text>
      </View>
    </Pressable>
  );
}

export function MonthScreen() {
  const workDay = useWorkDayMinutes();
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);
  const router = useRouter();
  const month = toMonthStr(new Date());
  const realHourly = useRealHourlyWage();
  const { data: wage } = useCurrentWage();
  const currency = wage?.currency ?? homeCurrency();
  const { hasAccess: hasPro } = useHasProAccess();
  /** Pro tools open the paywall until Pro is bought. */
  const pro = (open: () => void) => (hasPro ? open() : router.push('/paywall'));

  const [reviewSheet, setReviewSheet] = useState<{ categoryId: string; categoryName: string } | null>(null);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['month-summary', month, realHourly, currency],
    queryFn: () => getMonthlySummary(repo, month, realHourly, currency),
    enabled: realHourly > 0,
  });

  if (isLoading || !summary) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <Text style={s.muted}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{monthLabel(month)}</Text>
        <View style={s.headerTotals}>
          <Text style={s.totalAmount}>{formatCurrency(summary.totalMinor, summary.currency)}</Text>
          <Text style={s.totalHours}>{formatHours(summary.totalMinutes, { estimated: true, workDayMinutes: workDay })}</Text>
        </View>
        <View style={s.navRow}>
          <Pressable
            style={s.navButton}
            onPress={() => pro(() => router.push('/(tabs)/month/wall-chart'))}
            accessibilityRole="button"
            accessibilityLabel={t.month.wallChart}
          >
            <Text style={s.navButtonText}>{t.month.wallChart}</Text>
          </Pressable>
          <Pressable
            style={s.navButton}
            onPress={() => pro(() => router.push('/(tabs)/month/crossover'))}
            accessibilityRole="button"
            accessibilityLabel={t.month.crossover}
          >
            <Text style={s.navButtonText}>{t.month.crossover}</Text>
          </Pressable>
          <Pressable
            style={s.navButton}
            onPress={() => router.push('/(tabs)/month/income')}
            accessibilityRole="button"
            accessibilityLabel={t.month.income}
          >
            <Text style={s.navButtonText}>{t.month.income}</Text>
          </Pressable>
        </View>
      </View>

      {/* Category list */}
      <FlatList
        data={summary.categories}
        keyExtractor={(item) => item.categoryId ?? '__uncategorized__'}
        renderItem={({ item }) => (
          <CategoryRow
            item={item}
            onReview={(id, name) => pro(() => setReviewSheet({ categoryId: id, categoryName: name }))}
          />
        )}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.muted}>{t.month.noExpenses}</Text>
          </View>
        }
        contentContainerStyle={s.listContent}
      />

      {/* Three Questions review sheet */}
      {reviewSheet && (
        <MonthlyReviewSheet
          month={month}
          categoryId={reviewSheet.categoryId}
          categoryName={reviewSheet.categoryName}
          onClose={() => setReviewSheet(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: theme.bg },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { paddingHorizontal: space.lg, paddingVertical: space.lg, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title:         { fontSize: fontSize.xl, fontWeight: '700', color: theme.textPrimary, marginBottom: space.xs },
  headerTotals:  { flexDirection: 'row', alignItems: 'baseline', gap: space.md },
  totalAmount:   { fontSize: fontSize.title1, fontWeight: '700', color: theme.accent },
  totalHours:    { fontSize: fontSize.input, color: theme.textSecondary },
  listContent:   { paddingBottom: space.xxl },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  rowLeft:       { flex: 1 },
  rowRight:      { alignItems: 'flex-end' },
  categoryName:  { fontSize: fontSize.input, fontWeight: '600', color: theme.textPrimary },
  categoryCount: { fontSize: fontSize.sm, color: theme.textSecondary, marginTop: space.xxs },
  amount:        { fontSize: fontSize.input, fontWeight: '600', color: theme.textPrimary },
  hours:         { fontSize: fontSize.sm, color: theme.textSecondary, marginTop: space.xxs },
  separator:     { height: 1, backgroundColor: theme.border, marginHorizontal: space.lg },
  navRow:        { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  navButton:     { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.sm, backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border },
  navButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: theme.accent },
  muted:         { color: theme.textSecondary, fontSize: fontSize.callout },
});
