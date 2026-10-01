import { View, Text, FlatList, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '@/presentation/hooks/useExpenses';
import { ExpenseRow } from '@/presentation/components/ExpenseRow';
import type { ExpenseRecord } from '@/application/ports/expense-repository.port';
import { useTranslation } from '@/lib/i18n';

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
  const sections = groupByDay(expenses);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#8C8174' }}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A1714', padding: 16 }}>{t.log.title}</Text>
      {sections.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 17, color: '#8C8174', textAlign: 'center' }}>
            {t.log.empty}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ExpenseRow expense={item} realHourlyWage={realHourlyWage} />}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F3EFE9' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#8C8174', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {section.title}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#E6DFD5', marginLeft: 16 }} />}
        />
      )}
    </SafeAreaView>
  );
}
