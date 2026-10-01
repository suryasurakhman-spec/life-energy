import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { formatCurrency, formatHours } from '@/lib/format';
import { lifeEnergy } from '@/domain/price/price';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';
import { useLensStore } from '@/presentation/stores/lens.store';
import { useTranslation } from '@/lib/i18n';

type Verdict = 'worth_it' | 'not_sure' | 'not_worth_it';

interface Props {
  priceMinor: bigint;
  currency: string;
  wageProfileId: string;
  source: 'lens' | 'freeze';
  realHourlyWage: number;
  onClose: () => void;
}

export function LabelSheet({ priceMinor, currency, wageProfileId, source, realHourlyWage, onClose }: Props) {
  const t = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const [editedMinor, setEditedMinor] = useState(priceMinor);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const logExpense = useLogExpense();
  const snapPoints = useMemo(() => ['45%', '90%'], []);

  const energy = lifeEnergy({ priceMinor: editedMinor, realHourlyWage });
  const hoursLabel = formatHours(energy.totalMinutes);
  const priceLabel = formatCurrency(editedMinor, currency);

  const verdictButtons: { key: Verdict; label: string }[] = [
    { key: 'worth_it',     label: t.lens.worthIt },
    { key: 'not_sure',     label: t.lens.notSure },
    { key: 'not_worth_it', label: t.lens.notWorthIt },
  ];

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48 }}>
        {/* Hours display */}
        <Text style={{ fontSize: 48, fontWeight: '700', lineHeight: 52, color: '#1A1714' }}>
          {hoursLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 15, color: '#8C8174' }}>$</Text>
          <TextInput
            style={{ fontSize: 15, color: '#8C8174', minWidth: 60 }}
            value={(Number(editedMinor) / 100).toFixed(2)}
            keyboardType="decimal-pad"
            onChangeText={(v) => {
              const cents = Math.round(parseFloat(v || '0') * 100);
              if (!isNaN(cents) && cents >= 0) setEditedMinor(BigInt(cents));
            }}
            accessibilityLabel={t.lens.editPrice}
          />
        </View>

        {/* Worth it? */}
        <Text style={{ fontWeight: '600', fontSize: 17, color: '#1A1714', marginTop: 24, marginBottom: 12 }}>
          {t.lens.worthItPrompt}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {verdictButtons.map(({ key, label }) => (
            <Pressable
              key={key}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: verdict === key ? '#C9821F' : '#F3EFE9',
              }}
              onPress={() => setVerdict(key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: verdict === key }}
              accessibilityLabel={label}
            >
              <Text style={{ fontWeight: '600', color: verdict === key ? '#FFFFFF' : '#1A1714' }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Log it */}
        <Pressable
          style={{ marginTop: 24, paddingVertical: 16, borderRadius: 12, backgroundColor: '#C9821F', alignItems: 'center' }}
          onPress={() => {
            const input: Parameters<typeof logExpense.mutate>[0] = {
              amountMinor: editedMinor,
              currency,
              wageProfileId,
              source,
              spentAt: new Date(),
            };
            if (verdict !== null) input.verdict = verdict;
            logExpense.mutate(input);
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel={t.lens.logIt}
        >
          <Text style={{ fontWeight: '600', color: '#FFFFFF', fontSize: 17 }}>{t.lens.logIt}</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
