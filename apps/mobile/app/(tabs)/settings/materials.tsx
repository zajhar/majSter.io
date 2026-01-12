import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'

export default function MaterialTemplatesScreen() {
  const { data: templates, isLoading } = trpc.templates.materials.list.useQuery()
  const utils = trpc.useUtils()

  const upsertTemplate = trpc.templates.materials.upsert.useMutation({
    onSuccess: () => {
      utils.templates.materials.list.invalidate()
      setShowModal(false)
      resetForm()
    },
  })

  const deleteTemplate = trpc.templates.materials.delete.useMutation({
    onSuccess: () => utils.templates.materials.list.invalidate(),
  })

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [defaultPrice, setDefaultPrice] = useState('')
  const [unit, setUnit] = useState('szt')
  const [consumption, setConsumption] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDefaultPrice('')
    setUnit('szt')
    setConsumption('')
  }

  const handleEdit = (template: NonNullable<typeof templates>[0]) => {
    setEditingId(template.id)
    setName(template.name)
    setDefaultPrice(template.defaultPrice?.toString() || '')
    setUnit(template.unit)
    setConsumption(template.consumption?.toString() || '')
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
        consumption: consumption ? parseFloat(consumption) : undefined,
      },
    })
  }

  const userTemplates = templates?.filter((t) => !t.isSystem) ?? []
  const systemTemplates = templates?.filter((t) => t.isSystem) ?? []

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
                {item.consumption && ` • ${item.consumption} ${item.unit}/m²`}
              </Text>
            </View>
            {!item.isSystem && (
              <View style={styles.actions}>
                <Pressable onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={20} color="#6b7280" />
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
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
        <Ionicons name="add" size={28} color="white" />
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
            <Text style={styles.label}>Nazwa materiału</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Farba biała"
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
                  placeholder="szt"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <Text style={styles.label}>Zużycie na m² (opcjonalne)</Text>
            <TextInput
              style={styles.input}
              placeholder="np. 0.15"
              value={consumption}
              onChangeText={setConsumption}
              keyboardType="decimal-pad"
            />
            <Text style={styles.hint}>
              Podaj ile jednostek materiału potrzeba na 1 m²
            </Text>
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  templateDetails: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16 },
  systemBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  systemBadgeText: { fontSize: 12, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#6b7280' },
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
    elevation: 5,
  },
  modal: { flex: 1, backgroundColor: 'white' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancel: { fontSize: 16, color: '#6b7280' },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalSave: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  modalContent: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 16 },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
})
