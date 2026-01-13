import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'

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
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  quoteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  quoteTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
})
