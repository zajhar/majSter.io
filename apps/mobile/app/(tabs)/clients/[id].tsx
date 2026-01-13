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
import { trpc } from '../../../lib/trpc'

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: client, isLoading } = trpc.clients.byId.useQuery({ id: id! })
  const { data: quotes } = trpc.quotes.list.useQuery()
  const utils = trpc.useUtils()

  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')

  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
      utils.clients.byId.invalidate({ id: id! })
      setIsEditing(false)
    },
    onError: (error) => {
      Alert.alert('Błąd', error.message)
    },
  })

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
      router.back()
    },
    onError: (error) => {
      Alert.alert('Błąd', error.message)
    },
  })

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

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Błąd', 'Imię i nazwisko są wymagane')
      return
    }

    updateClient.mutate({
      id: id!,
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        siteAddress: siteAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      },
    })
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
          onPress: () => deleteClient.mutate({ id: id! }),
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
          <Pressable onPress={handleSave} disabled={updateClient.isPending}>
            <Text style={[styles.saveText, updateClient.isPending && styles.saveTextDisabled]}>
              {updateClient.isPending ? 'Zapisuję...' : 'Zapisz'}
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
            <Ionicons name="call" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Zadzwoń</Text>
          </Pressable>
        )}
        <Pressable style={styles.actionButton} onPress={startEditing}>
          <Ionicons name="pencil" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Edytuj</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/quote/create?clientId=${id}`)}
        >
          <Ionicons name="add-circle" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Nowa wycena</Text>
        </Pressable>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontakt</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>{client.phone || 'Brak telefonu'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#6b7280" />
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
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          ))
        )}
      </View>

      {/* Delete */}
      <View style={styles.dangerSection}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
          <Text style={styles.deleteText}>Usuń klienta</Text>
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '600', color: '#2563eb' },
  name: { fontSize: 24, fontWeight: '600', color: '#1f2937', marginTop: 16 },
  address: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginTop: 12,
  },
  actionButton: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: '#2563eb' },
  section: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoText: { fontSize: 16, color: '#1f2937' },
  notesText: { fontSize: 16, color: '#1f2937', lineHeight: 24 },
  emptyText: { fontSize: 14, color: '#9ca3af', fontStyle: 'italic' },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quoteInfo: { flex: 1 },
  quoteNumber: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  quoteDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  quoteTotal: { fontSize: 16, fontWeight: '600', color: '#2563eb', marginRight: 8 },
  dangerSection: { backgroundColor: 'white', padding: 16, marginTop: 12, marginBottom: 32 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    gap: 8,
  },
  deleteText: { fontSize: 16, color: '#dc2626', fontWeight: '500' },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cancelText: { fontSize: 16, color: '#6b7280' },
  saveText: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  saveTextDisabled: { opacity: 0.5 },
  form: { padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
})
