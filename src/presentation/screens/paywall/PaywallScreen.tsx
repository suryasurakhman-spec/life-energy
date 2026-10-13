import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOfferings, usePurchasePackage, useRestorePurchases } from '@/presentation/hooks/usePurchases';
import { useTheme } from '@/theme';
import type { Package } from '@/application/ports/purchase-service.port';
import { useTranslation } from '@/lib/i18n';
import { fontSize } from '@/theme/typography';
import { radius, space } from '@/theme/layout';

interface PackageCardProps {
  pkg: Package;
  onPress: (pkg: Package) => void;
  isPending: boolean;
}

function PackageCard({ pkg, onPress, isPending }: PackageCardProps) {
  const theme = useTheme();
  const s = styles(theme);
  return (
    <Pressable
      style={[s.packageCard, isPending && s.packageCardDisabled]}
      onPress={() => onPress(pkg)}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityLabel={`Purchase ${pkg.product.title} for ${pkg.priceString}`}
    >
      <View style={s.packageInfo}>
        <Text style={s.packageTitle}>{pkg.product.title}</Text>
        <Text style={s.packageDescription}>{pkg.product.description}</Text>
      </View>
      <View style={s.packagePrice}>
        <Text style={s.priceText}>{pkg.priceString}</Text>
      </View>
    </Pressable>
  );
}

interface Props {
  onDismiss?: () => void;
}

export function PaywallScreen({ onDismiss }: Props) {
  const t = useTranslation();
  const theme = useTheme();
  const s = styles(theme);

  const V2_FEATURES = [
    { emoji: '📊', text: t.paywall.features.wallChart },
    { emoji: '🔀', text: t.paywall.features.crossover },
    { emoji: '❓', text: t.paywall.features.threeQuestions },
    { emoji: '☁️', text: t.paywall.features.sync },
    { emoji: '🏷️',  text: t.paywall.features.categories },
  ];

  const { data: offerings = [], isLoading: offeringsLoading } = useOfferings();
  const purchaseMutation  = usePurchasePackage();
  const restoreMutation   = useRestorePurchases();

  const allPackages = offerings.flatMap((o) => o.packages);
  const isPending   = purchaseMutation.isPending || restoreMutation.isPending;

  const handlePurchase = (pkg: Package) => {
    purchaseMutation.mutate(pkg, {
      onSuccess: (info) => {
        if (info.isSubscribed) onDismiss?.();
      },
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>✨</Text>
          <Text style={s.heroTitle}>{t.paywall.title}</Text>
          <Text style={s.heroSubtitle}>{t.paywall.subtitle}</Text>
        </View>

        {/* Feature list */}
        <View style={s.featureList}>
          {V2_FEATURES.map(({ emoji, text }) => (
            <View key={text} style={s.featureRow}>
              <Text style={s.featureEmoji}>{emoji}</Text>
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        {offeringsLoading ? (
          <ActivityIndicator color={theme.accent} style={{ marginVertical: space.xxl }} />
        ) : allPackages.length > 0 ? (
          <View style={s.packagesSection}>
            {allPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onPress={handlePurchase}
                isPending={isPending}
              />
            ))}
          </View>
        ) : (
          // NoopPurchaseService returns empty offerings — show a placeholder
          <View style={s.placeholderCard}>
            <Text style={s.placeholderText}>{t.paywall.unavailable}</Text>
          </View>
        )}

        {/* Restore */}
        <Pressable
          style={s.restoreButton}
          onPress={() => restoreMutation.mutate()}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel={t.paywall.restore}
        >
          {restoreMutation.isPending
            ? <ActivityIndicator color={theme.textSecondary} />
            : <Text style={s.restoreText}>{t.paywall.restore}</Text>
          }
        </Pressable>

        {onDismiss && (
          <Pressable style={s.dismissButton} onPress={onDismiss} accessibilityRole="button">
            <Text style={s.dismissText}>{t.paywall.notNow}</Text>
          </Pressable>
        )}

        <Text style={s.legal}>{t.paywall.legal}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: theme.bg },
  scroll:             { padding: space.xl, paddingBottom: space.xxxl },
  hero:               { alignItems: 'center', marginBottom: space.xl },
  heroEmoji:          { fontSize: fontSize.display, marginBottom: space.md },
  heroTitle:          { fontSize: fontSize.title3, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: space.sm },
  heroSubtitle:       { fontSize: fontSize.callout, color: theme.textSecondary, textAlign: 'center', lineHeight: 22 },
  featureList:        { backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, padding: space.lg, marginBottom: space.xl, gap: space.md },
  featureRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  featureEmoji:       { fontSize: fontSize.xl, width: 28, textAlign: 'center' },
  featureText:        { flex: 1, fontSize: fontSize.md, color: theme.textPrimary, lineHeight: 20 },
  packagesSection:    { gap: space.md, marginBottom: space.lg },
  packageCard:        { backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: theme.accent, padding: space.lg, flexDirection: 'row', alignItems: 'center' },
  packageCardDisabled:{ opacity: 0.6 },
  packageInfo:        { flex: 1 },
  packageTitle:       { fontSize: fontSize.input, fontWeight: '700', color: theme.textPrimary },
  packageDescription: { fontSize: fontSize.sm, color: theme.textSecondary, marginTop: space.xxs },
  packagePrice:       { backgroundColor: theme.accent, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: space.sm },
  priceText:          { color: theme.onAccent, fontWeight: '700', fontSize: fontSize.callout },
  placeholderCard:    { backgroundColor: theme.surfaceAlt, borderRadius: radius.md, padding: space.lg, marginBottom: space.lg },
  placeholderText:    { fontSize: fontSize.md, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
  restoreButton:      { alignItems: 'center', paddingVertical: space.md },
  restoreText:        { color: theme.accent, fontSize: fontSize.callout, fontWeight: '600' },
  dismissButton:      { alignItems: 'center', paddingVertical: space.md },
  dismissText:        { color: theme.textSecondary, fontSize: fontSize.callout },
  legal:              { fontSize: fontSize.tiny, color: theme.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: space.lg },
});
