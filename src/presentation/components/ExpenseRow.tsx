import { View, Text } from 'react-native';
import { formatCurrency, formatHours } from '@/lib/format';
import { lifeEnergy } from '@/lib/calc';
import { useWorkDayMinutes } from '@/presentation/hooks/useWage';
import type { ExpenseRecord } from '@/application/ports/expense-repository.port';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { space } from '@/theme/layout';

interface Props {
  expense: ExpenseRecord;
  realHourlyWage: number;
}

const VERDICT_LABEL: Record<string, string> = {
  worth_it:     '✓',
  not_sure:     '?',
  not_worth_it: '✗',
};

export function ExpenseRow({ expense, realHourlyWage }: Props) {
  const priceLabel = formatCurrency(expense.amountMinor, expense.currency);
  const totalMinutes = lifeEnergy(expense.amountMinor, realHourlyWage, expense.currency).totalMinutes;
  const workDay = useWorkDayMinutes();
  const hoursLabel = formatHours(totalMinutes, { workDayMinutes: workDay });
  const verdictLabel = expense.verdict ? VERDICT_LABEL[expense.verdict] : '';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.md }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.body, fontWeight: '500', color: palette.sand900 }}>{priceLabel}</Text>
        {expense.note ? <Text style={{ fontSize: fontSize.sm, color: palette.sand500, marginTop: space.xxs }}>{expense.note}</Text> : null}
      </View>
      <Text style={{ fontSize: fontSize.callout, color: palette.sand700, fontWeight: '500' }}>{hoursLabel}</Text>
      {verdictLabel ? <Text style={{ fontSize: fontSize.body, color: palette.sand500, width: 20, textAlign: 'center' }}>{verdictLabel}</Text> : null}
    </View>
  );
}
