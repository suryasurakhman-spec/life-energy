import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { formatCurrency, formatHours } from '@/lib/format';
import { lifeEnergy } from '@/lib/calc';
import { useRecordConversion } from '@/presentation/hooks/useRecordConversion';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';
import { useLensStore } from '@/presentation/stores/lens.store';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';

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
  const recordConversion = useRecordConversion();
  const snapPoints = useMemo(() => ['45%', '90%'], []);

  const energy = lifeEnergy(editedMinor, realHourlyWage);
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
        <Text style={{ fontSize: fontSize.display, fontWeight: '700', lineHeight: 52, color: palette.sand900 }}>
          {hoursLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: fontSize.callout, color: palette.sand500 }}>$</Text>
          <TextInput
            style={{ fontSize: fontSize.callout, color: palette.sand500, minWidth: 60 }}
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
        <Text style={{ fontWeight: '600', fontSize: fontSize.body, color: palette.sand900, marginTop: 24, marginBottom: 12 }}>
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
                backgroundColor: verdict === key ? palette.amber600 : palette.sand100,
              }}
              onPress={() => setVerdict(key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: verdict === key }}
              accessibilityLabel={label}
            >
              <Text style={{ fontWeight: '600', color: verdict === key ? palette.white : palette.sand900 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Log it */}
        <Pressable
          style={{ marginTop: 24, paddingVertical: 16, borderRadius: 12, backgroundColor: palette.amber600, alignItems: 'center' }}
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
            recordConversion({
              priceMinor: editedMinor,
              currency,
              hoursMinutes: Math.round(energy.totalMinutes),
              source,
              ...(verdict !== null ? { verdict } : {}),
            });
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel={t.lens.logIt}
        >
          <Text style={{ fontWeight: '600', color: palette.white, fontSize: fontSize.body }}>{t.lens.logIt}</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
