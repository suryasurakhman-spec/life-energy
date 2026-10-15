import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { currencySymbol, formatCurrency, formatHours, formatRateDate, toMajor } from '@/lib/format';
import { minorDigits } from '@/domain/price/parser';
import { useFxRate, convertToBase } from '@/presentation/hooks/useFxRate';
import { useWorkDayMinutes } from '@/presentation/hooks/useWage';
import { lifeEnergy } from '@/lib/calc';
import { useRecordConversion } from '@/presentation/hooks/useRecordConversion';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';
import { useLensStore } from '@/presentation/stores/lens.store';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

type Verdict = 'worth_it' | 'not_sure' | 'not_worth_it';

interface Props {
  /** The price as read, in its own currency. */
  priceMinor: bigint;
  currency: string;
  homeCurrency: string;
  wageProfileId: string;
  source: 'lens' | 'freeze';
  realHourlyWage: number;
  onClose: () => void;
}

export function LabelSheet({ priceMinor, currency, homeCurrency, wageProfileId, source, realHourlyWage, onClose }: Props) {
  const t = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const [editedMinor, setEditedMinor] = useState(priceMinor);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const logExpense = useLogExpense();
  const recordConversion = useRecordConversion();
  const snapPoints = useMemo(() => ['45%', '90%'], []);

  // Foreign prices are costed in the home currency with the last cached rate (FR-18).
  const foreign = currency !== homeCurrency;
  const { data: fx } = useFxRate(homeCurrency, currency);
  const homeMinor = convertToBase(editedMinor, currency, homeCurrency, fx?.rate);
  const energy = homeMinor !== null ? lifeEnergy(homeMinor, realHourlyWage, homeCurrency) : null;
  const workDay = useWorkDayMinutes();
  const hoursLabel = energy
    ? formatHours(energy.totalMinutes, { workDayMinutes: workDay, estimated: foreign })
    : t.lens.notHomeCurrency.replace('{currency}', homeCurrency);
  const decimals = minorDigits(currency);

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
      <BottomSheetView style={{ paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxxl }}>
        {/* Hours display */}
        <Text style={{ fontSize: fontSize.display, fontWeight: '700', lineHeight: 52, color: palette.sand900 }}>
          {hoursLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.xs }}>
          <Text style={{ fontSize: fontSize.callout, color: palette.sand500 }}>{currencySymbol(currency)}</Text>
          <TextInput
            style={{ fontSize: fontSize.callout, color: palette.sand500, minWidth: 60 }}
            value={toMajor(editedMinor, currency).toFixed(decimals)}
            keyboardType="decimal-pad"
            onChangeText={(v) => {
              const minor = Math.round(parseFloat(v || '0') * 10 ** decimals);
              if (!isNaN(minor) && minor >= 0) setEditedMinor(BigInt(minor));
            }}
            accessibilityLabel={t.lens.editPrice}
          />
        </View>
        {foreign && homeMinor !== null && fx && (
          <Text style={{ fontSize: fontSize.sm, color: palette.sand500, marginTop: space.xs }}>
            {`≈ ${formatCurrency(homeMinor, homeCurrency)} · ${t.lens.rateAsOf.replace('{date}', formatRateDate(fx.asOf))}`}
          </Text>
        )}

        {/* Worth it? */}
        <Text style={{ fontWeight: '600', fontSize: fontSize.body, color: palette.sand900, marginTop: space.xl, marginBottom: space.md }}>
          {t.lens.worthItPrompt}
        </Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {verdictButtons.map(({ key, label }) => (
            <Pressable
              key={key}
              style={{
                flex: 1,
                paddingVertical: space.md,
                borderRadius: radius.md,
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
          style={{ marginTop: space.xl, paddingVertical: space.lg, borderRadius: radius.md, backgroundColor: palette.amber600, alignItems: 'center' }}
          onPress={() => {
            // Log in the home currency when a rate exists, so monthly totals stay in one currency.
            const input: Parameters<typeof logExpense.mutate>[0] = {
              amountMinor: homeMinor ?? editedMinor,
              currency: homeMinor !== null ? homeCurrency : currency,
              wageProfileId,
              source,
              spentAt: new Date(),
            };
            if (verdict !== null) input.verdict = verdict;
            logExpense.mutate(input);
            recordConversion({
              priceMinor: editedMinor,
              currency,
              hoursMinutes: Math.round(energy?.totalMinutes ?? 0),
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
