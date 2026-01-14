import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuotesList } from '../../../hooks/useOfflineQuotes'
import { useClientsList } from '../../../hooks/useOfflineClients'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

const STATUS_CONFIG = {
  draft: { label: 'Szkic', color: colors.text.body, bg: colors.background, borderColor: colors.tool.DEFAULT },
  sent: { label: 'Wysłana', color: colors.primary.DEFAULT, bg: colors.primary[100], borderColor: colors.primary.DEFAULT },
  accepted: { label: 'Zaakceptowana', color: colors.success.DEFAULT, bg: colors.success[100], borderColor: colors.success.DEFAULT },
  rejected: { label: 'Odrzucona', color: colors.error.DEFAULT, bg: colors.error[100], borderColor: colors.error.DEFAULT },
}

export default function QuotesListScreen() {
  const { data: quotes, isLoading } = useQuotesList()
  const { data: clients } = useClientsList()

  const formatDate = (date: Date | string) => {
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
          const client = item.clientId ? clients?.find((c) => c.id === item.clientId) : null
          const clientName = client
            ? `${client.firstName} ${client.lastName}`
            : 'Bez klienta'
          return (
            <Link href={`/(tabs)/quotes/${item.id}`} asChild>
              <Pressable style={[styles.quoteCard, { borderLeftColor: status.borderColor }]}>
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteNumber}>#{item.number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.clientName, !client && styles.noClient]}>
                  {clientName}
                </Text>
                <Text style={styles.quoteDate}>{formatDate(item.createdAt)}</Text>
                <View style={styles.quoteFooter}>
                  <Text style={styles.quoteTotal}>{item.total} zł</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Pressable>
            </Link>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.text.muted} />
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
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  quoteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteNumber: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.heading,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  clientName: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.text.heading,
    marginTop: 6,
  },
  noClient: {
    fontStyle: 'italic',
    color: colors.text.muted,
  },
  quoteDate: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 4,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quoteTotal: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.primary.DEFAULT,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 16,
  },
  emptyList: { flex: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
})
