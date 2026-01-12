import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import { generateQuotePdf, shareQuotePdf } from '../../../services/pdf'

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quote, isLoading } = trpc.quotes.byId.useQuery({ id: id! })
  const { data: clients } = trpc.clients.list.useQuery()
  const utils = trpc.useUtils()
  const [isSharing, setIsSharing] = useState(false)

  const deleteQuote = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate()
      router.back()
    },
  })

  const handleDelete = () => {
    Alert.alert('Usuń wycenę', 'Czy na pewno chcesz usunąć tę wycenę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => deleteQuote.mutate({ id: id! }),
      },
    ])
  }

  const handleShare = async () => {
    if (!quote) return

    setIsSharing(true)
    try {
      const client = clients?.find((c) => c.id === quote.clientId)
      if (!client) {
        Alert.alert('Błąd', 'Nie znaleziono klienta')
        return
      }

      const pdfUri = await generateQuotePdf({
        number: quote.number,
        client: {
          firstName: client.firstName,
          lastName: client.lastName,
          siteAddress: client.siteAddress,
        },
        groups: quote.groups?.map((g) => ({
          name: g.name,
          services: g.services?.map((s) => ({
            name: s.name,
            quantity: Number(s.quantity),
            unit: s.unit,
            pricePerUnit: Number(s.pricePerUnit),
            total: Number(s.total),
          })) ?? [],
        })) ?? [],
        materials: quote.materials?.map((m) => ({
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
        createdAt: quote.createdAt,
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
        <Text>Ładowanie...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.quoteNumber}>Wycena #{quote.number}</Text>
        <Text style={styles.total}>{quote.total} zł</Text>
      </View>

      {/* Notes Before */}
      {quote.notesBefore && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki (przed)</Text>
          <Text style={styles.notes}>{quote.notesBefore}</Text>
        </View>
      )}

      {/* Groups */}
      {quote.groups?.map((group) => (
        <View key={group.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.floorM2 && (
            <Text style={styles.groupM2}>{group.floorM2} m²</Text>
          )}
          {group.services?.map((service) => (
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
          {quote.materials.map((material) => (
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
            {isSharing ? 'Generowanie...' : 'Udostępnij PDF'}
          </Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quoteNumber: { fontSize: 16, color: '#6b7280' },
  total: { fontSize: 36, fontWeight: '700', color: '#2563eb', marginTop: 8 },
  section: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  notes: { fontSize: 16, color: '#1f2937', lineHeight: 24 },
  groupCard: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  groupM2: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, color: '#1f2937' },
  serviceQty: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  serviceTotal: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
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
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  shareButtonDisabled: { opacity: 0.7 },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
})
