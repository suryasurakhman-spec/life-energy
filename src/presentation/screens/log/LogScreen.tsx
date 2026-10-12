import { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '@/presentation/hooks/useExpenses';
import { ExpenseRow } from '@/presentation/components/ExpenseRow';
import type { ExpenseRecord } from '@/application/ports/expense-repository.port';
import { useTranslation } from '@/lib/i18n';
import { useCurrentWage, useWageHistory } from '@/presentation/hooks/useWage';
import { QuickConvertModal } from '@/presentation/screens/lens/QuickConvertModal';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';

function toMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function groupByDay(expenses: ExpenseRecord[]): { title: string; data: ExpenseRecord[] }[] {
  const groups = new Map<string, ExpenseRecord[]>();
  for (const e of expenses) {
    const day = e.spentAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(e);
  }
  return [...groups.entries()].map(([title, data]) => ({ title, data }));
}

interface Props {
  realHourlyWage: number;
}

export function LogScreen({ realHourlyWage }: Props) {
  const t = useTranslation();
  const month = toMonthStr(new Date());
  const { data: expenses = [], isLoading } = useExpenses(month);
  const { data: wage } = useCurrentWage();
  const { data: wageHistory = [] } = useWageHistory();
  // Real wage (dollars/hour) per wage profile, so a log keeps the wage in force when it was made (FR-9).
  const wageById = useMemo(
    () => new Map(wageHistory.map(w => [w.id, w.realWageCached / 100])),
    [wageHistory],
  );
  const sections = groupByDay(expenses);
  const [addVisible, setAddVisible] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.sand500 }}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.sand50 }}>
      <Text style={{ fontSize: fontSize.title1, fontWeight: '700', color: palette.sand900, padding: 16 }}>{t.log.title}</Text>
      {sections.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: fontSize.body, color: palette.sand500, textAlign: 'center' }}>
            {t.log.empty}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ExpenseRow expense={item} realHourlyWage={wageById.get(item.wageProfileId) ?? realHourlyWage} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: palette.sand100 }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: palette.sand500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {section.title}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: palette.sand200, marginLeft: 16 }} />}
        />
      )}

      {/* FAB — manual expense entry */}
      <TouchableOpacity
        onPress={() => setAddVisible(true)}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: palette.amber600,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: palette.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 6,
        }}
        accessibilityRole="button"
        accessibilityLabel={t.log.addExpense}
      >
        <Text style={{ color: palette.white, fontSize: fontSize.title1, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      {wage && (
        <QuickConvertModal
          realHourlyWage={realHourlyWage}
          wageProfileId={wage.id}
          currency={wage.currency}
          visible={addVisible}
          onClose={() => setAddVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
