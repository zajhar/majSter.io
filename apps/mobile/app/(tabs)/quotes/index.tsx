import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'

const STATUS_CONFIG = {
  draft: { label: 'Szkic', color: '#6b7280', bg: '#f3f4f6' },
  sent: { label: 'Wysłana', color: '#2563eb', bg: '#dbeafe' },
  accepted: { label: 'Zaakceptowana', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Odrzucona', color: '#dc2626', bg: '#fee2e2' },
}

export default function QuotesListScreen() {
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
          return (
            <Link href={`/(tabs)/quotes/${item.id}`} asChild>
              <Pressable style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteNumber}>#{item.number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.quoteDate}>{formatDate(item.createdAt)}</Text>
                <View style={styles.quoteFooter}>
                  <Text style={styles.quoteTotal}>{item.total} zł</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            </Link>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Ładowanie...' : 'Brak wycen'}
            </Text>
          </View>
        }
        contentContainerStyle={quotes?.length === 0 ? styles.emptyList : styles.list}
      />

      <Link href="/quote/create" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  quoteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteNumber: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  quoteDate: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  quoteTotal: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
  emptyList: { flex: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
})
