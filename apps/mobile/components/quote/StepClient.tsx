import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { useState, useRef, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { useQuoteStore } from '../../stores/quoteStore'
import { AddClientBottomSheet, AddClientBottomSheetRef } from './AddClientBottomSheet'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

export function StepClient() {
  const [search, setSearch] = useState('')
  const { data: clients, refetch } = trpc.clients.list.useQuery()
  const { draft, setClientId } = useQuoteStore()
  const bottomSheetRef = useRef<AddClientBottomSheetRef>(null)

  const filteredClients = clients?.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  }) ?? []

  const handleSelect = (clientId: string) => {
    setClientId(clientId)
  }

  const handleAddClient = useCallback(() => {
    bottomSheetRef.current?.open()
  }, [])

  const handleClientCreated = useCallback((clientId: string) => {
    refetch()
    setClientId(clientId)
  }, [refetch, setClientId])

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>Brak klientów</Text>
      <Text style={styles.emptySubtitle}>Dodaj pierwszego klienta, aby rozpocząć</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.body} />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj klienta..."
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.muted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = item.id === draft.clientId
          return (
            <Pressable
              style={[
                styles.clientCard,
                isSelected && styles.clientCardSelected,
              ]}
              onPress={() => handleSelect(item.id)}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                  {item.firstName[0]}{item.lastName[0]}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, isSelected && styles.clientNameSelected]}>
                  {item.firstName} {item.lastName}
                </Text>
                {item.siteAddress && (
                  <Text style={styles.clientAddress}>{item.siteAddress}</Text>
                )}
                {item.phone && (
                  <Text style={styles.clientPhone}>{item.phone}</Text>
                )}
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary.DEFAULT} />
              )}
            </Pressable>
          )
        }}
        ListEmptyComponent={!search ? renderEmptyState : null}
        ListFooterComponent={
          <Pressable style={styles.addClientButton} onPress={handleAddClient}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.addClientText}>Dodaj nowego klienta</Text>
          </Pressable>
        }
        contentContainerStyle={styles.list}
      />

      <AddClientBottomSheet
        ref={bottomSheetRef}
        onClientCreated={handleClientCreated}
      />
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
    marginHorizontal: 16,
    marginTop: 16,
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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    marginBottom: 8,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  clientCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary.DEFAULT,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.text.body,
  },
  avatarTextSelected: {
    color: colors.white,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  clientNameSelected: {
    fontFamily: fontFamily.semibold,
    color: colors.primary[700],
  },
  clientAddress: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  clientPhone: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginTop: 2,
  },
  addClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
  },
  addClientText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.body,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginTop: 4,
  },
})
