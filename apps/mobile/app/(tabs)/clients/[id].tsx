import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Linking,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useClientById, useUpdateClient, useDeleteClient } from '../../../hooks/useOfflineClients'
import { useSyncError } from '../../../hooks/useSyncError'
import { SyncErrorBanner } from '../../../components/ui/SyncErrorBanner'
import { trpc } from '../../../lib/trpc'
import { useSyncStore } from '../../../stores/syncStore'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: client, isLoading } = useClientById(id)
  const { data: quotes } = trpc.quotes.list.useQuery()
  const isOnline = useSyncStore((s) => s.isOnline)
  const syncError = useSyncError(id)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')

  const { update } = useUpdateClient()
  const { deleteClient: deleteClientFn } = useDeleteClient()

  const startEditing = () => {
    if (client) {
      setFirstName(client.firstName)
      setLastName(client.lastName)
      setPhone(client.phone || '')
      setSiteAddress(client.siteAddress || '')
      setNotes(client.notes || '')
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Błąd', 'Imię i nazwisko są wymagane')
      return
    }

    setIsSaving(true)
    const result = await update(id!, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      siteAddress: siteAddress.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    setIsSaving(false)

    if (result.success) {
      setIsEditing(false)
    } else {
      Alert.alert('Błąd', result.error || 'Nie udało się zaktualizować klienta')
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Usuń klienta',
      'Czy na pewno chcesz usunąć tego klienta? Wszystkie powiązane wyceny pozostaną w systemie.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteClientFn(id!)
            if (result.success) {
              router.back()
            } else {
              Alert.alert('Błąd', result.error || 'Nie udało się usunąć klienta')
            }
          },
        },
      ]
    )
  }

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`)
    }
  }

  const clientQuotes = quotes?.filter((q) => q.clientId === id) ?? []

  if (isLoading || !client) {
    return (
      <View style={styles.loading}>
        <Text>Ładowanie...</Text>
      </View>
    )
  }

  if (isEditing) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.editHeader}>
          <Pressable onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelText}>Anuluj</Text>
          </Pressable>
          <Text style={styles.editTitle}>Edytuj klienta</Text>
          <Pressable onPress={handleSave} disabled={isSaving}>
            <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
              {isSaving ? 'Zapisuję...' : 'Zapisz'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Imię *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jan"
          />

          <Text style={styles.label}>Nazwisko *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Kowalski"
          />

          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="512 345 678"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Adres budowy</Text>
          <TextInput
            style={styles.input}
            value={siteAddress}
            onChangeText={setSiteAddress}
            placeholder="ul. Lipowa 5, Warszawa"
          />

          <Text style={styles.label}>Notatki</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Dodatkowe informacje..."
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    )
  }

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {client.firstName[0]}{client.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>{client.firstName} {client.lastName}</Text>
        {client.siteAddress && (
          <Text style={styles.address}>{client.siteAddress}</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {client.phone && (
          <Pressable style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.actionText}>Zadzwoń</Text>
          </Pressable>
        )}
        <Pressable style={styles.actionButton} onPress={startEditing}>
          <Ionicons name="pencil" size={24} color={colors.primary.DEFAULT} />
          <Text style={styles.actionText}>Edytuj</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/quote/create?clientId=${id}`)}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary.DEFAULT} />
          <Text style={styles.actionText}>Nowa wycena</Text>
        </Pressable>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontakt</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.text.body} />
          <Text style={styles.infoText}>{client.phone || 'Brak telefonu'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={colors.text.body} />
          <Text style={styles.infoText}>{client.siteAddress || 'Brak adresu'}</Text>
        </View>
      </View>

      {/* Notes */}
      {client.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki</Text>
          <Text style={styles.notesText}>{client.notes}</Text>
        </View>
      )}

      {/* Quotes History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historia wycen ({clientQuotes.length})</Text>
        {clientQuotes.length === 0 ? (
          <Text style={styles.emptyText}>Brak wycen dla tego klienta</Text>
        ) : (
          clientQuotes.slice(0, 5).map((quote) => (
            <Pressable
              key={quote.id}
              style={styles.quoteRow}
              onPress={() => router.push(`/(tabs)/quotes/${quote.id}`)}
            >
              <View style={styles.quoteInfo}>
                <Text style={styles.quoteNumber}>#{quote.number}</Text>
                <Text style={styles.quoteDate}>
                  {new Date(quote.createdAt).toLocaleDateString('pl-PL')}
                </Text>
              </View>
              <Text style={styles.quoteTotal}>{quote.total} zł</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </Pressable>
          ))
        )}
      </View>

      {/* Delete */}
      <View style={styles.dangerSection}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
          <Text style={styles.deleteText}>Usuń klienta</Text>
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
  header: {
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  name: {
    fontSize: 24,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
    marginTop: 16,
  },
  address: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    marginTop: 12,
    ...shadows.sm,
  },
  actionButton: { alignItems: 'center', gap: 4 },
  actionText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.text.body,
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  notesText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quoteInfo: { flex: 1 },
  quoteNumber: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  quoteDate: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  quoteTotal: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
    marginRight: 8,
  },
  dangerSection: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
    marginBottom: 32,
    ...shadows.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error[100],
    backgroundColor: colors.error[50],
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.error.DEFAULT,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  saveText: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  saveTextDisabled: { opacity: 0.5 },
  form: { padding: 16 },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
})
