import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'

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
    color: '#6b7280',
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
    color: '#2563eb',
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
    color: '#7c3aed',
    comingSoon: true,
  },
]

export default function SubscriptionScreen() {
  const { data: subscription, isLoading } = trpc.subscriptions.status.useQuery()

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
        {currentTier === 'free' && subscription?.quotesThisMonth >= 8 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#92400e" />
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
        <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
        <Text style={styles.infoText}>
          Subskrypcję możesz anulować w dowolnym momencie. Płatności są obsługiwane
          przez App Store / Google Play.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statusCard: {
    backgroundColor: '#2563eb',
    padding: 24,
    margin: 16,
    borderRadius: 16,
  },
  statusLabel: { fontSize: 14, color: '#bfdbfe' },
  statusTier: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  usageContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  usageItem: { flex: 1, alignItems: 'center' },
  usageDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  usageValue: { fontSize: 24, fontWeight: '700', color: 'white' },
  usageLabel: { fontSize: 12, color: '#bfdbfe', marginTop: 4 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: { fontSize: 14, color: '#92400e', flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardActive: {
    borderColor: '#2563eb',
  },
  planCardRecommended: {
    borderColor: '#2563eb',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: { fontSize: 12, fontWeight: '600', color: 'white' },
  comingSoonBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: { fontSize: 12, fontWeight: '600', color: 'white' },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: { fontSize: 20, fontWeight: '700' },
  priceContainer: { alignItems: 'flex-end' },
  planPrice: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  planPeriod: { fontSize: 14, color: '#6b7280' },
  featuresList: { gap: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#374151' },
  currentPlanBadge: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  currentPlanText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  upgradeButton: {
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  upgradeButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: { fontSize: 14, color: '#6b7280', flex: 1, lineHeight: 20 },
})
