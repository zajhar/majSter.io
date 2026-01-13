import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

export default function DashboardScreen() {
  const { data: subscription } = trpc.subscriptions.status.useQuery()
  const { data: quotes } = trpc.quotes.list.useQuery()

  const recentQuotes = quotes?.slice(0, 3) ?? []
  const quotesThisMonth = subscription?.quotesThisMonth ?? 0
  const quotesLimit = subscription?.limits.quotesPerMonth ?? 10

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{quotesThisMonth}</Text>
          <Text style={styles.statLabel}>
            Wycen w tym miesiącu
            {quotesLimit !== Infinity && ` (z ${quotesLimit})`}
          </Text>
        </View>
      </View>

      {/* Quick Action */}
      <Link href="/quote/create" asChild>
        <Pressable style={styles.createButton}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.createButtonText}>Nowa wycena</Text>
        </Pressable>
      </Link>

      {/* Recent Quotes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ostatnie wyceny</Text>
        {recentQuotes.length === 0 ? (
          <Text style={styles.emptyText}>Brak wycen</Text>
        ) : (
          recentQuotes.map((quote) => (
            <Link key={quote.id} href={`/(tabs)/quotes/${quote.id}`} asChild>
              <Pressable style={styles.quoteCard}>
                <Text style={styles.quoteNumber}>#{quote.number}</Text>
                <Text style={styles.quoteTotal}>{quote.total} zł</Text>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  statNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.primary.DEFAULT,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: colors.accent.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.heading,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    textAlign: 'center',
    marginTop: 24,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.sm,
  },
  quoteNumber: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.heading,
  },
  quoteTotal: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
})
