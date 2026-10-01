import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatHours, formatCurrency } from '@/lib/format';
import { lifeEnergy } from '@/domain/price/price';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';

interface Props {
  realHourlyWage: number;
  wageProfileId: string;
  visible: boolean;
  onClose: () => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'] as const;

export function QuickConvertModal({ realHourlyWage, wageProfileId, visible, onClose }: Props) {
  const [input, setInput] = useState('');
  const logExpense = useLogExpense();

  const priceMinor = BigInt(Math.round(parseFloat(input || '0') * 100));
  const energy = input ? lifeEnergy({ priceMinor, realHourlyWage }) : null;

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
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: '#FAF8F5', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          {/* Result display */}
          <View style={{ alignItems: 'center', marginBottom: 24, minHeight: 80 }}>
            {energy ? (
              <>
                <Text style={{ fontSize: 48, fontWeight: '700', color: '#1A1714' }}>
                  {formatHours(energy.totalMinutes)}
                </Text>
                <Text style={{ fontSize: 17, color: '#8C8174', marginTop: 4 }}>
                  {formatCurrency(priceMinor, 'USD')}
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 34, fontWeight: '700', color: '#CFC5B8' }}>0.00</Text>
            )}
          </View>

          {/* Keypad */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {KEYS.map(key => (
              <Pressable
                key={key}
                onPress={() => handleKey(key)}
                style={{ width: '30%', aspectRatio: 1.5, borderRadius: 12, backgroundColor: key === '⌫' ? '#FDEFD3' : '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6DFD5' }}
              >
                <Text style={{ fontSize: 22, fontWeight: '500', color: '#1A1714' }}>{key}</Text>
              </Pressable>
            ))}
          </View>

          {/* Log + Close */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E6DFD5', alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '600', color: '#4A433B' }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!energy) return;
                logExpense.mutate({ amountMinor: priceMinor, currency: 'USD', wageProfileId, source: 'keypad', spentAt: new Date() });
                setInput('');
                onClose();
              }}
              style={{ flex: 2, padding: 16, borderRadius: 12, backgroundColor: '#C9821F', alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '600', color: '#FFFFFF', fontSize: 17 }}>Log it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
