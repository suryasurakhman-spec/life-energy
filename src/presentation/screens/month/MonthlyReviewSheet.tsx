import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveMonthlyReview, type ReviewVerdict } from '@/application/save-monthly-review';
import { useTheme } from '@/theme';
import { useTranslation } from '@/lib/i18n';

interface Props {
  month: string;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
}

const VERDICT_EMOJIS: Record<ReviewVerdict, string> = {
  worth_it:     '✓',
  not_sure:     '?',
  not_worth_it: '✗',
};

type Verdicts = {
  q1Verdict?: ReviewVerdict;
  q2Verdict?: ReviewVerdict;
  q3Verdict?: ReviewVerdict;
};

export function MonthlyReviewSheet({ month, categoryId, categoryName, onClose }: Props) {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%', '85%'], []);
  const qc = useQueryClient();

  const QUESTIONS: { key: 'q1Verdict' | 'q2Verdict' | 'q3Verdict'; text: string }[] = [
    { key: 'q1Verdict', text: t.review.q1 },
    { key: 'q2Verdict', text: t.review.q2 },
    { key: 'q3Verdict', text: t.review.q3 },
  ];

  const VERDICTS: { value: ReviewVerdict; label: string; emoji: string }[] = [
    { value: 'worth_it',     label: t.review.verdicts.worth_it,     emoji: VERDICT_EMOJIS.worth_it },
    { value: 'not_sure',     label: t.review.verdicts.not_sure,     emoji: VERDICT_EMOJIS.not_sure },
    { value: 'not_worth_it', label: t.review.verdicts.not_worth_it, emoji: VERDICT_EMOJIS.not_worth_it },
  ];

  const [verdicts, setVerdicts] = useState<Verdicts>({});

  const mutation = useMutation({
    mutationFn: () => saveMonthlyReview({ month, categoryId, ...verdicts }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-reviews', month] });
      onClose();
    },
  });

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [onClose]);

  const setVerdict = (key: 'q1Verdict' | 'q2Verdict' | 'q3Verdict', value: ReviewVerdict) => {
    setVerdicts((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.border }}
    >
      <BottomSheetView style={s.content}>
        <Text style={s.title}>{categoryName}</Text>
        <Text style={s.subtitle}>{t.review.title} · {month}</Text>

        {QUESTIONS.map((q) => (
          <View key={q.key} style={s.questionBlock}>
            <Text style={s.questionText}>{q.text}</Text>
            <View style={s.verdictRow}>
              {VERDICTS.map((v) => {
                const selected = verdicts[q.key] === v.value;
                return (
                  <Pressable
                    key={v.value}
                    style={[s.verdictButton, selected && s.verdictSelected]}
                    onPress={() => setVerdict(q.key, v.value)}
                    accessibilityRole="radio"
                    accessibilityLabel={v.label}
                    accessibilityState={{ checked: selected }}
                  >
                    <Text style={[s.verdictEmoji]}>{v.emoji}</Text>
                    <Text style={[s.verdictLabel, selected && s.verdictLabelSelected]}>{v.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          style={[s.saveButton, mutation.isPending && s.saveButtonDisabled]}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={t.common.save}
        >
          <Text style={s.saveButtonText}>
            {mutation.isPending ? t.common.saving : t.common.save}
          </Text>
        </Pressable>

        <Pressable style={s.cancelButton} onPress={handleClose} accessibilityRole="button">
          <Text style={s.cancelText}>{t.common.cancel}</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  content:              { flex: 1, paddingHorizontal: 20, paddingBottom: 32 },
  title:                { fontSize: 20, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  subtitle:             { fontSize: 13, color: theme.textSecondary, marginBottom: 20 },
  questionBlock:        { marginBottom: 20 },
  questionText:         { fontSize: 14, color: theme.textPrimary, lineHeight: 20, marginBottom: 10 },
  verdictRow:           { flexDirection: 'row', gap: 10 },
  verdictButton:        { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.border, backgroundColor: theme.surfaceAlt },
  verdictSelected:      { borderColor: theme.accent, backgroundColor: theme.accentSoft },
  verdictEmoji:         { fontSize: 18, marginBottom: 2 },
  verdictLabel:         { fontSize: 11, color: theme.textSecondary, fontWeight: '500' },
  verdictLabelSelected: { color: theme.accent, fontWeight: '700' },
  saveButton:           { backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveButtonDisabled:   { opacity: 0.6 },
  saveButtonText:       { color: theme.onAccent, fontSize: 16, fontWeight: '700' },
  cancelButton:         { alignItems: 'center', paddingVertical: 12 },
  cancelText:           { color: theme.textSecondary, fontSize: 15 },
});
