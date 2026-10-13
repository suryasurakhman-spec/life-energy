import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { getWallChartData } from '@/application/get-wall-chart-data';
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';
import { SqliteIncomeRepository } from '@/infrastructure/sqlite/sqlite-income-repository';
import { formatCurrency } from '@/lib/format';
import { useTheme, palette } from '@/theme';
import { useTranslation } from '@/lib/i18n';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

const expenseRepo = new SqliteExpenseRepository();
const incomeRepo  = new SqliteIncomeRepository();

/** Build list of the trailing N months (inclusive of current) as 'YYYY-MM'. */
function trailingMonths(n: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

const MONTHS = trailingMonths(36);
const CHART_WIDTH = Dimensions.get('window').width - 40;

interface CrossoverBannerProps {
  crossoverMonth: string | null;
}

function CrossoverBanner({ crossoverMonth }: CrossoverBannerProps) {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);
  if (!crossoverMonth) return null;
  const [year, m] = crossoverMonth.split('-');
  const label = new Date(Number(year), Number(m) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return (
    <View style={s.crossoverBanner}>
      <Text style={s.crossoverEmoji}>🎯</Text>
      <Text style={s.crossoverText}>{t.wallChart.crossoverReached} <Text style={s.crossoverHighlight}>{label}</Text></Text>
    </View>
  );
}

export function WallChartScreen() {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);

  // For MVP/demo use 0 capital; real app reads from capital_snapshots
  const currentCapitalMinor = 0n;
  const annualRatePct = 4;

  const { state: chartPressState } = useChartPressState({ x: 0, y: { expenses: 0, income: 0, investmentIncome: 0 } });

  const { data, isLoading } = useQuery({
    queryKey: ['wall-chart', MONTHS[0], MONTHS[MONTHS.length - 1]],
    queryFn: () => getWallChartData(expenseRepo, incomeRepo, MONTHS, currentCapitalMinor, annualRatePct),
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.points.map((p, i) => ({
      x: i,
      expenses:          Number(p.expensesMinor) / 100,
      income:            Number(p.incomeMinor) / 100,
      investmentIncome:  Number(p.investmentIncomeMinor) / 100,
    }));
  }, [data]);

  // Latest month totals for summary text
  const latest = data?.points[data.points.length - 1];

  if (isLoading || !data) {
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
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>{t.wallChart.title}</Text>
        <Text style={s.subtitle}>{t.wallChart.subtitle}</Text>

        {/* Summary strip */}
        {latest && (
          <View style={s.summaryRow}>
            <View style={s.summaryCell}>
              <Text style={s.summaryLabel}>{t.wallChart.expenses}</Text>
              <Text style={[s.summaryValue, { color: palette.error500 }]}>
                {formatCurrency(latest.expensesMinor, 'USD')}
              </Text>
            </View>
            <View style={s.summaryCell}>
              <Text style={s.summaryLabel}>{t.wallChart.income}</Text>
              <Text style={[s.summaryValue, { color: palette.slate500 }]}>
                {formatCurrency(latest.incomeMinor, 'USD')}
              </Text>
            </View>
            <View style={s.summaryCell}>
              <Text style={s.summaryLabel}>{t.wallChart.investmentIncome}</Text>
              <Text style={[s.summaryValue, { color: palette.sage500 }]}>
                {formatCurrency(latest.investmentIncomeMinor, 'USD')}
              </Text>
            </View>
          </View>
        )}

        <CrossoverBanner crossoverMonth={data.crossoverMonth} />

        {/* Chart */}
        {chartData.length > 0 ? (
          <View style={s.chartWrapper}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={['expenses', 'income', 'investmentIncome']}
              domainPadding={{ left: 8, right: 8, top: 20, bottom: 0 }}
              chartPressState={chartPressState}
            >
              {({ points }) => (
                <>
                  <Line
                    points={points.expenses}
                    color={palette.error500}
                    strokeWidth={2}
                    animate={{ type: 'timing', duration: 600 }}
                  />
                  <Line
                    points={points.income}
                    color={palette.slate500}
                    strokeWidth={2}
                    animate={{ type: 'timing', duration: 600 }}
                  />
                  <Line
                    points={points.investmentIncome}
                    color={palette.sage500}
                    strokeWidth={2.5}
                    animate={{ type: 'timing', duration: 600 }}
                  />
                </>
              )}
            </CartesianChart>
          </View>
        ) : (
          <View style={s.emptyChart}>
            <Text style={s.muted}>{t.wallChart.noData}</Text>
          </View>
        )}

        {/* Legend */}
        <View style={s.legend}>
          {([
            { label: t.wallChart.expenses,         color: palette.error500 },
            { label: t.wallChart.income,            color: palette.slate500 },
            { label: t.wallChart.investmentIncome,  color: palette.sage500 },
          ] as { label: string; color: string }[]).map(({ label, color }) => (
            <View key={label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: color }]} />
              <Text style={s.legendLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: theme.bg },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:             { padding: space.lg, paddingBottom: space.xxxl },
  title:              { fontSize: fontSize.title2, fontWeight: '700', color: theme.textPrimary },
  subtitle:           { fontSize: fontSize.md, color: theme.textSecondary, marginBottom: space.lg },
  summaryRow:         { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  summaryCell:        { flex: 1, backgroundColor: theme.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: theme.border },
  summaryLabel:       { fontSize: fontSize.tiny, color: theme.textSecondary, marginBottom: space.xs },
  summaryValue:       { fontSize: fontSize.callout, fontWeight: '700' },
  crossoverBanner:    { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: theme.accentSoft, borderRadius: radius.md, padding: space.md, marginBottom: space.lg },
  crossoverEmoji:     { fontSize: fontSize.xl },
  crossoverText:      { fontSize: fontSize.md, color: theme.textPrimary },
  crossoverHighlight: { fontWeight: '700', color: theme.accent },
  chartWrapper:       { height: 260, marginBottom: space.lg },
  emptyChart:         { height: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surfaceAlt, borderRadius: radius.md, marginBottom: space.lg, padding: space.lg },
  legend:             { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.xs },
  legendItem:         { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  legendDot:          { width: 10, height: 10, borderRadius: radius.pill },
  legendLabel:        { fontSize: fontSize.sm, color: theme.textSecondary },
  muted:              { color: theme.textSecondary, fontSize: fontSize.callout, textAlign: 'center' },
});
