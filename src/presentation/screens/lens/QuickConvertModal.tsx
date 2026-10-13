import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatHours, formatCurrency } from '@/lib/format';
import { useWorkDayMinutes } from '@/presentation/hooks/useWage';
import { useTranslation } from '@/lib/i18n';
import { lifeEnergy } from '@/lib/calc';
import { useRecordConversion } from '@/presentation/hooks/useRecordConversion';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';

interface Props {
  realHourlyWage: number;
  wageProfileId: string;
  /** Home currency of the wage profile; typed prices are in it. */
  currency: string;
  visible: boolean;
  onClose: () => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'] as const;

export function QuickConvertModal({ realHourlyWage, wageProfileId, currency, visible, onClose }: Props) {
  const workDay = useWorkDayMinutes();
  const t = useTranslation();
  const [input, setInput] = useState('');
  const logExpense = useLogExpense();
  const recordConversion = useRecordConversion();

  const priceMinor = BigInt(Math.round(parseFloat(input || '0') * 100));
  const energy = input ? lifeEnergy(priceMinor, realHourlyWage) : null;

  function handleKey(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (key === '.' && input.includes('.')) return;
    const next = input + key;
    // Limit to 2 decimal places
    const parts = next.split('.');
    if (parts[1] && parts[1].length > 2) return;
    setInput(next);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: palette.scrim }}>
        <View style={{ backgroundColor: palette.sand50, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          {/* Result display */}
          <View style={{ alignItems: 'center', marginBottom: 24, minHeight: 80 }}>
            {energy ? (
              <>
                <Text style={{ fontSize: fontSize.display, fontWeight: '700', color: palette.sand900 }}>
                  {formatHours(energy.totalMinutes, { workDayMinutes: workDay })}
                </Text>
                <Text style={{ fontSize: fontSize.body, color: palette.sand500, marginTop: 4 }}>
                  {formatCurrency(priceMinor, currency)}
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: fontSize.hero, fontWeight: '700', color: palette.sand300 }}>0.00</Text>
            )}
          </View>

          {/* Keypad */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {KEYS.map(key => (
              <Pressable
                key={key}
                onPress={() => handleKey(key)}
                style={{ width: '30%', aspectRatio: 1.5, borderRadius: 12, backgroundColor: key === '⌫' ? palette.amber100 : palette.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.sand200 }}
              >
                <Text style={{ fontSize: fontSize.title2, fontWeight: '500', color: palette.sand900 }}>{key}</Text>
              </Pressable>
            ))}
          </View>

          {/* Log + Close */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: palette.sand200, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '600', color: palette.sand700 }}>{t.common.cancel}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!energy) return;
                logExpense.mutate({ amountMinor: priceMinor, currency, wageProfileId, source: 'keypad', spentAt: new Date() });
                recordConversion({ priceMinor, currency, hoursMinutes: Math.round(energy.totalMinutes), source: 'keypad' });
                setInput('');
                onClose();
              }}
              style={{ flex: 2, padding: 16, borderRadius: 12, backgroundColor: palette.amber600, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '600', color: palette.white, fontSize: fontSize.body }}>{t.lens.logIt}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
