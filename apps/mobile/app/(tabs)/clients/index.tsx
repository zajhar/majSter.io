import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import type { Client } from '@majsterio/shared'

export default function ClientsListScreen() {
  const [search, setSearch] = useState('')
  const { data: clients, isLoading } = trpc.clients.list.useQuery()

  const filteredClients = clients?.filter((client: Client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  }) ?? []

  return (
    <View style={styles.container}>
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
          <Link href={`/(tabs)/clients/${item.id}`} asChild>
            <Pressable style={styles.clientCard}>
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
                  <Text style={styles.clientAddress} numberOfLines={1}>
                    {item.siteAddress}
                  </Text>
                )}
              </View>
              {item.phone && (
                <Pressable style={styles.phoneButton}>
                  <Ionicons name="call-outline" size={20} color="#2563eb" />
                </Pressable>
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Ładowanie...' : 'Brak klientów'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredClients.length === 0 && styles.emptyList}
      />

      {/* FAB */}
      <Link href="/(tabs)/clients/create" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  clientAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  phoneButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyList: {
    flex: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})
