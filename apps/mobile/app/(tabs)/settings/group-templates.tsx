import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

export default function GroupTemplatesScreen() {
  const { data: templates, isLoading } = trpc.groupTemplates.list.useQuery()
  const utils = trpc.useUtils()

  const deleteMutation = trpc.groupTemplates.delete.useMutation({
    onSuccess: () => utils.groupTemplates.list.invalidate(),
  })

  const duplicateMutation = trpc.groupTemplates.duplicate.useMutation({
    onSuccess: () => {
      utils.groupTemplates.list.invalidate()
      Alert.alert('Sukces', 'Szablon został skopiowany')
    },
  })

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Usuń szablon',
      `Czy na pewno chcesz usunąć szablon "${name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    )
  }

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate({ id })
  }

  type Template = NonNullable<typeof templates>[number]
  const userTemplates = templates?.filter((t: Template) => !t.isSystem) ?? []
  const systemTemplates = templates?.filter((t: Template) => t.isSystem) ?? []

  const renderItem = ({ item }: { item: Template }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateInfo}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateDetails}>
          {item.services?.length ?? 0} usług
          {item.description && ` • ${item.description}`}
        </Text>
      </View>
      {item.isSystem ? (
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDuplicate(item.id)}
          disabled={duplicateMutation.isPending}
        >
          <Ionicons name="copy-outline" size={20} color={colors.primary.DEFAULT} />
        </Pressable>
      ) : (
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.name)}
          disabled={deleteMutation.isPending}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
        </Pressable>
      )}
    </View>
  )

  const data = [
    ...(userTemplates.length > 0 ? [{ type: 'header' as const, title: 'MOJE SZABLONY', id: 'header-user' }] : []),
    ...userTemplates.map(t => ({ ...t, type: 'item' as const })),
    ...(systemTemplates.length > 0 ? [{ type: 'header' as const, title: 'SYSTEMOWE', id: 'header-system' }] : []),
    ...systemTemplates.map(t => ({ ...t, type: 'item' as const })),
  ]

  return (
    <>
      <Stack.Screen options={{ title: 'Szablony grup' }} />
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.type === 'header' ? item.id : item.id}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionTitle}>{item.title}</Text>
            }
            return renderItem({ item: item as Template })
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="layers-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>
                {isLoading ? 'Ładowanie...' : 'Brak szablonów'}
              </Text>
              <Text style={styles.emptySubtext}>
                Zapisz grupę z wyceny jako szablon
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.semibold,
    color: colors.text.body,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    marginBottom: 8,
    ...shadows.sm,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  templateDetails: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginTop: 4,
  },
})
