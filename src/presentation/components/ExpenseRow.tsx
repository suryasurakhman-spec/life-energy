import { View, Text } from 'react-native';
import { formatCurrency, formatHours } from '@/lib/format';
import type { ExpenseRecord } from '@/application/ports/expense-repository.port';
import { palette } from '@/theme/colors';

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
  const totalMinutes = (Number(expense.amountMinor) / 100 / realHourlyWage) * 60;
  const hoursLabel = formatHours(totalMinutes);
  const verdictLabel = expense.verdict ? VERDICT_LABEL[expense.verdict] : '';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: '500', color: palette.sand900 }}>{priceLabel}</Text>
        {expense.note ? <Text style={{ fontSize: 13, color: palette.sand500, marginTop: 2 }}>{expense.note}</Text> : null}
      </View>
      <Text style={{ fontSize: 15, color: palette.sand700, fontWeight: '500' }}>{hoursLabel}</Text>
      {verdictLabel ? <Text style={{ fontSize: 17, color: palette.sand500, width: 20, textAlign: 'center' }}>{verdictLabel}</Text> : null}
    </View>
  );
}
