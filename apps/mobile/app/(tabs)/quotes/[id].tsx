import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteById, useDeleteQuote } from '../../../hooks/useOfflineQuotes'
import { useClientsList } from '../../../hooks/useOfflineClients'
import { useQuoteStore } from '../../../stores/quoteStore'
import { useSyncError } from '../../../hooks/useSyncError'
import { SyncErrorBanner } from '../../../components/ui/SyncErrorBanner'
import { generateQuotePdf, shareQuotePdf } from '../../../services/pdf'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

const STATUS_CONFIG = {
  draft: { label: 'Szkic', color: colors.text.body, bg: colors.background },
  sent: { label: 'Wysłana', color: colors.primary.DEFAULT, bg: colors.primary[100] },
  accepted: { label: 'Zaakceptowana', color: colors.success.DEFAULT, bg: colors.success[100] },
  rejected: { label: 'Odrzucona', color: colors.error.DEFAULT, bg: colors.error[100] },
}

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quote, isLoading } = useQuoteById(id)
  const { data: clients } = useClientsList()
  const { deleteQuote: deleteQuoteFn } = useDeleteQuote()
  const { initForEdit } = useQuoteStore()
  const syncError = useSyncError(id)
  const [isSharing, setIsSharing] = useState(false)

  const handleEdit = () => {
    if (!quote) return
    initForEdit(quote)
    router.push('/quote/create')
  }

  const handleDelete = () => {
    Alert.alert('Usuń wycenę', 'Czy na pewno chcesz usunąć tę wycenę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteQuoteFn(id!)
          if (result.success) {
            router.back()
          } else {
            Alert.alert('Błąd', result.error || 'Nie udało się usunąć wyceny')
          }
        },
      },
    ])
  }

  const handleShare = async () => {
    if (!quote) return

    setIsSharing(true)
    try {
      const client = quote.clientId
        ? clients?.find((c) => c.id === quote.clientId)
        : null

      const pdfUri = await generateQuotePdf({
        number: quote.number,
        client: client ? {
          firstName: client.firstName,
          lastName: client.lastName,
          siteAddress: client.siteAddress,
        } : null,
        groups: quote.groups?.map((g: typeof quote.groups[number]) => ({
          name: g.name,
          services: g.services?.map((s: typeof g.services[number]) => ({
            name: s.name,
            quantity: Number(s.quantity),
            unit: s.unit,
            pricePerUnit: Number(s.pricePerUnit),
            total: Number(s.total),
          })) ?? [],
        })) ?? [],
        materials: quote.materials?.map((m: typeof quote.materials[number]) => ({
          name: m.name,
          quantity: Number(m.quantity),
          unit: m.unit,
          pricePerUnit: Number(m.pricePerUnit),
          total: Number(m.total),
        })) ?? [],
        notesBefore: quote.notesBefore,
        notesAfter: quote.notesAfter,
        disclaimer: quote.disclaimer,
        showDisclaimer: quote.showDisclaimer,
        total: Number(quote.total),
        createdAt: new Date(quote.createdAt),
      })

      await shareQuotePdf(pdfUri, quote.number)
    } catch (error) {
      Alert.alert('Błąd', error instanceof Error ? error.message : 'Nie udało się udostępnić')
    } finally {
      setIsSharing(false)
    }
  }

  if (isLoading || !quote) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    )
  }

  const status = STATUS_CONFIG[quote.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft

  return (
    <ScrollView style={styles.container}>
      {/* Sync Error */}
      {syncError.hasError && (
        <SyncErrorBanner
          message={syncError.message!}
          isRetrying={syncError.isRetrying}
          onRetry={syncError.retry}
          onDismiss={syncError.dismiss}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.quoteNumber}>Wycena #{quote.number}</Text>
        <Text style={styles.total}>{quote.total} zl</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Notes Before */}
      {quote.notesBefore && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki (przed)</Text>
          <Text style={styles.notes}>{quote.notesBefore}</Text>
        </View>
      )}

      {/* Groups */}
      {quote.groups?.map((group: typeof quote.groups[number]) => (
        <View key={group.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.floorM2 && (
            <Text style={styles.groupM2}>{group.floorM2} m²</Text>
          )}
          {group.services?.map((service: typeof group.services[number]) => (
            <View key={service.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceQty}>
                  {service.quantity} {service.unit} × {service.pricePerUnit} zł
                </Text>
              </View>
              <Text style={styles.serviceTotal}>{service.total} zł</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Materials */}
      {quote.materials && quote.materials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiały</Text>
          {quote.materials.map((material: typeof quote.materials[number]) => (
            <View key={material.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{material.name}</Text>
                <Text style={styles.serviceQty}>
                  {material.quantity} {material.unit} × {material.pricePerUnit} zł
                </Text>
              </View>
              <Text style={styles.serviceTotal}>{material.total} zł</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes After */}
      {quote.notesAfter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki (po)</Text>
          <Text style={styles.notes}>{quote.notesAfter}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil-outline" size={20} color={colors.primary.DEFAULT} />
        </Pressable>
        <Pressable
          style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="share-outline" size={20} color="white" />
          )}
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Generowanie...' : 'Udostępnij'}
          </Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 8,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    margin: 16,
    marginBottom: 0,
    ...shadows.md,
  },
  quoteNumber: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.body,
  },
  total: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: colors.primary.DEFAULT,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: 12,
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.text.body,
    marginBottom: 8,
  },
  notes: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.heading,
    lineHeight: 24,
  },
  groupCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  groupName: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.heading,
  },
  groupM2: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.heading,
  },
  serviceQty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 2,
  },
  serviceTotal: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.md,
    gap: 8,
    ...shadows.md,
  },
  shareButtonText: {
    fontFamily: fontFamily.semibold,
    color: colors.white,
    fontSize: 16,
  },
  shareButtonDisabled: { opacity: 0.7 },
  editButton: {
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  deleteButton: {
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error[100],
    backgroundColor: colors.error[50],
  },
})
