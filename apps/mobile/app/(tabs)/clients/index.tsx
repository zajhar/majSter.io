import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useClientsList } from '../../../hooks/useOfflineClients'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

export default function ClientsListScreen() {
  const [search, setSearch] = useState('')
  const { data: clients, isLoading } = useClientsList()

  const filteredClients = clients?.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  }) ?? []

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.body} />
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
                  <Ionicons name="call-outline" size={20} color={colors.primary.DEFAULT} />
                </Pressable>
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
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
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    padding: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: borderRadius.xl,
    gap: 12,
    ...shadows.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  clientAddress: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
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
    fontFamily: fontFamily.regular,
    color: colors.text.body,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
})
