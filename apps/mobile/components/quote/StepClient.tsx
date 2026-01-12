import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { useQuoteStore } from '../../stores/quoteStore'

interface Props {
  onNext: () => void
}

export function StepClient({ onNext }: Props) {
  const [search, setSearch] = useState('')
  const { data: clients } = trpc.clients.list.useQuery()
  const { draft, setClientId } = useQuoteStore()

  const filteredClients = clients?.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  }) ?? []

  const handleSelect = (clientId: string) => {
    setClientId(clientId)
    onNext()
  }

  const selectedClient = clients?.find((c) => c.id === draft.clientId)

  return (
    <View style={styles.container}>
      {/* Selected */}
      {selectedClient && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>Wybrany klient:</Text>
          <Text style={styles.selectedName}>
            {selectedClient.firstName} {selectedClient.lastName}
          </Text>
          <Pressable style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Dalej</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj klienta..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.clientCard,
              item.id === draft.clientId && styles.clientCardSelected,
            ]}
            onPress={() => handleSelect(item.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>
                {item.firstName} {item.lastName}
              </Text>
              {item.siteAddress && (
                <Text style={styles.clientAddress}>{item.siteAddress}</Text>
              )}
            </View>
            {item.id === draft.clientId && (
              <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
            )}
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectedCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  selectedLabel: { fontSize: 12, color: '#1e40af' },
  selectedName: { fontSize: 18, fontWeight: '600', color: '#1e40af', marginTop: 4 },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  list: { padding: 16 },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  clientCardSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  clientAddress: { fontSize: 14, color: '#6b7280', marginTop: 2 },
})
