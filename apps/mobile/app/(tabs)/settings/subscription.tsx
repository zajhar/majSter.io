import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

const PLANS = [
  {
    tier: 'free',
    name: 'Darmowy',
    price: '0 zł',
    period: '',
    features: [
      '10 wycen miesięcznie',
      '3 własne szablony',
      'Historia 30 dni',
      'Branding "Majsterio"',
    ],
    color: colors.text.body,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '34.99 zł',
    period: '/miesiąc',
    features: [
      'Nieograniczone wyceny',
      'Nieograniczone szablony',
      'Pełna historia',
      'Bez brandingu',
      'Priorytetowe wsparcie',
    ],
    color: colors.primary.DEFAULT,
    recommended: true,
  },
  {
    tier: 'pro_ai',
    name: 'Pro AI',
    price: '69.99 zł',
    period: '/miesiąc',
    features: [
      'Wszystko z Pro',
      'Głos → wycena',
      'AI sugestie cen',
      'Automatyczne opisy',
    ],
    color: colors.accent.DEFAULT,
    comingSoon: true,
  },
]

export default function SubscriptionScreen() {
  const { data: subscription } = trpc.subscriptions.status.useQuery()

  const handleUpgrade = (tier: string) => {
    if (tier === 'pro_ai') {
      Alert.alert('Wkrótce', 'Plan Pro AI będzie dostępny wkrótce!')
      return
    }

    // In production, this would open RevenueCat paywall
    Alert.alert(
      'Upgrade do Pro',
      'Funkcja płatności będzie dostępna po integracji z RevenueCat.',
      [{ text: 'OK' }]
    )
  }

  const currentTier = subscription?.tier || 'free'
  const limits = SUBSCRIPTION_LIMITS[currentTier as keyof typeof SUBSCRIPTION_LIMITS]

  return (
    <ScrollView style={styles.container}>
      {/* Current status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Twój aktualny plan</Text>
        <Text style={styles.statusTier}>
          {PLANS.find((p) => p.tier === currentTier)?.name || 'Darmowy'}
        </Text>
        <View style={styles.usageContainer}>
          <View style={styles.usageItem}>
            <Text style={styles.usageValue}>{subscription?.quotesThisMonth || 0}</Text>
            <Text style={styles.usageLabel}>
              / {limits?.quotesPerMonth === Infinity ? '∞' : limits?.quotesPerMonth} wycen
            </Text>
          </View>
          <View style={styles.usageDivider} />
          <View style={styles.usageItem}>
            <Text style={styles.usageValue}>
              {limits?.historyDays === Infinity ? '∞' : limits?.historyDays}
            </Text>
            <Text style={styles.usageLabel}>dni historii</Text>
          </View>
        </View>
        {currentTier === 'free' && (subscription?.quotesThisMonth ?? 0) >= 8 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color={colors.warning[700]} />
            <Text style={styles.warningText}>
              Zostało Ci {10 - (subscription?.quotesThisMonth || 0)} wycen w tym miesiącu
            </Text>
          </View>
        )}
      </View>

      {/* Plans */}
      <Text style={styles.sectionTitle}>Wybierz plan</Text>

      {PLANS.map((plan) => (
        <Pressable
          key={plan.tier}
          style={[
            styles.planCard,
            currentTier === plan.tier && styles.planCardActive,
            plan.recommended && styles.planCardRecommended,
          ]}
          onPress={() => plan.tier !== currentTier && handleUpgrade(plan.tier)}
          disabled={currentTier === plan.tier}
        >
          {plan.recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Polecany</Text>
            </View>
          )}
          {plan.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Wkrótce</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              {plan.period && <Text style={styles.planPeriod}>{plan.period}</Text>}
            </View>
          </View>

          <View style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={plan.color}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {currentTier === plan.tier ? (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>Aktualny plan</Text>
            </View>
          ) : !plan.comingSoon ? (
            <View style={[styles.upgradeButton, { backgroundColor: plan.color }]}>
              <Text style={styles.upgradeButtonText}>
                {plan.tier === 'free' ? 'Zmień na darmowy' : 'Wybierz plan'}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ))}

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={24} color={colors.text.body} />
        <Text style={styles.infoText}>
          Subskrypcję możesz anulować w dowolnym momencie. Płatności są obsługiwane
          przez App Store / Google Play.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statusCard: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 24,
    margin: 16,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  statusLabel: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.primary[200] },
  statusTier: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: colors.white,
    marginTop: 4,
  },
  usageContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  usageItem: { flex: 1, alignItems: 'center' },
  usageDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  usageValue: { fontSize: 24, fontFamily: fontFamily.bold, color: colors.white },
  usageLabel: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.primary[200], marginTop: 4 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 16,
    gap: 8,
  },
  warningText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.warning[700], flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.transparent,
    ...shadows.sm,
  },
  planCardActive: {
    borderColor: colors.primary.DEFAULT,
  },
  planCardRecommended: {
    borderColor: colors.primary.DEFAULT,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
  },
  recommendedText: { fontSize: 12, fontFamily: fontFamily.semibold, color: colors.white },
  comingSoonBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.text.body,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
  },
  comingSoonText: { fontSize: 12, fontFamily: fontFamily.semibold, color: colors.white },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: { fontSize: 20, fontFamily: fontFamily.bold },
  priceContainer: { alignItems: 'flex-end' },
  planPrice: { fontSize: 24, fontFamily: fontFamily.bold, color: colors.text.heading },
  planPeriod: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.text.body },
  featuresList: { gap: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.text.heading },
  currentPlanBadge: {
    backgroundColor: colors.primary[50],
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 16,
    alignItems: 'center',
  },
  currentPlanText: { fontSize: 14, fontFamily: fontFamily.semibold, color: colors.text.body },
  upgradeButton: {
    padding: 14,
    borderRadius: borderRadius.lg,
    marginTop: 16,
    alignItems: 'center',
  },
  upgradeButtonText: { fontSize: 16, fontFamily: fontFamily.semibold, color: colors.white },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    borderRadius: borderRadius.xl,
    gap: 12,
    ...shadows.sm,
  },
  infoText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.text.body, flex: 1, lineHeight: 20 },
})
