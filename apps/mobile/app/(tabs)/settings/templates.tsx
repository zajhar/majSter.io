import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import type { QuantitySource } from '@majsterio/shared'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

const QUANTITY_SOURCES: { value: QuantitySource; label: string }[] = [
  { value: 'manual', label: 'Ręcznie' },
  { value: 'floor', label: 'Podłoga' },
  { value: 'walls', label: 'Ściany' },
  { value: 'ceiling', label: 'Sufit' },
  { value: 'walls_ceiling', label: 'Ściany + Sufit' },
]

export default function TemplatesScreen() {
  const { data: templates, isLoading } = trpc.templates.services.list.useQuery()
  const utils = trpc.useUtils()

  const upsertTemplate = trpc.templates.services.upsert.useMutation({
    onSuccess: () => {
      utils.templates.services.list.invalidate()
      setShowModal(false)
      resetForm()
    },
  })

  const deleteTemplate = trpc.templates.services.delete.useMutation({
    onSuccess: () => utils.templates.services.list.invalidate(),
  })

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [defaultPrice, setDefaultPrice] = useState('')
  const [unit, setUnit] = useState('m²')
  const [quantitySource, setQuantitySource] = useState<QuantitySource>('manual')
  const [category, setCategory] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDefaultPrice('')
    setUnit('m²')
    setQuantitySource('manual')
    setCategory('')
  }

  const handleEdit = (template: NonNullable<typeof templates>[0]) => {
    setEditingId(template.id)
    setName(template.name)
    setDefaultPrice(template.defaultPrice?.toString() || '')
    setUnit(template.unit)
    setQuantitySource(template.quantitySource as QuantitySource)
    setCategory(template.category || '')
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    Alert.alert('Usuń szablon', 'Czy na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => deleteTemplate.mutate({ id }) },
    ])
  }

  const handleSave = () => {
    if (!name.trim() || !unit.trim()) return

    upsertTemplate.mutate({
      id: editingId || undefined,
      data: {
        name: name.trim(),
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : undefined,
        unit: unit.trim(),
        quantitySource,
        category: category.trim() || undefined,
      },
    })
  }

  type Template = NonNullable<typeof templates>[number]
  const userTemplates = templates?.filter((t: Template) => !t.isSystem) ?? []
  const systemTemplates = templates?.filter((t: Template) => t.isSystem) ?? []

  return (
    <View style={styles.container}>
      <FlatList
        data={[...userTemplates, ...systemTemplates]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.templateDetails}>
                {item.defaultPrice ? `${item.defaultPrice} zł/` : ''}{item.unit}
                {item.category && ` • ${item.category}`}
              </Text>
            </View>
            {!item.isSystem && (
              <View style={styles.actions}>
                <Pressable onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={20} color={colors.text.body} />
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
                </Pressable>
              </View>
            )}
            {item.isSystem && (
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>System</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Ładowanie...' : 'Brak szablonów'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowModal(false); resetForm() }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edytuj szablon' : 'Nowy szablon'}
            </Text>
            <Pressable onPress={handleSave}>
              <Text style={styles.modalSave}>Zapisz</Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Nazwa usługi</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Malowanie ścian"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cena domyślna (zł)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={defaultPrice}
                  onChangeText={setDefaultPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Jednostka</Text>
                <TextInput
                  style={styles.input}
                  placeholder="m²"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <Text style={styles.label}>Źródło ilości</Text>
            <View style={styles.sourceButtons}>
              {QUANTITY_SOURCES.map((s) => (
                <Pressable
                  key={s.value}
                  style={[styles.sourceButton, quantitySource === s.value && styles.sourceButtonActive]}
                  onPress={() => setQuantitySource(s.value)}
                >
                  <Text style={[styles.sourceButtonText, quantitySource === s.value && styles.sourceButtonTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Kategoria</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Malowanie"
              value={category}
              onChangeText={setCategory}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    marginBottom: 8,
    ...shadows.sm,
  },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 16, fontFamily: fontFamily.medium, color: colors.text.heading },
  templateDetails: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.text.body, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16 },
  systemBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  systemBadgeText: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.text.body },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, fontFamily: fontFamily.regular, color: colors.text.body },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  modal: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: { fontSize: 16, fontFamily: fontFamily.regular, color: colors.text.body },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.semibold, color: colors.text.heading },
  modalSave: { fontSize: 16, fontFamily: fontFamily.semibold, color: colors.primary.DEFAULT },
  modalContent: { padding: 16 },
  label: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.text.heading, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  sourceButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
  },
  sourceButtonActive: { backgroundColor: colors.primary[100] },
  sourceButtonText: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.text.body },
  sourceButtonTextActive: { color: colors.primary.DEFAULT, fontFamily: fontFamily.semibold },
})
