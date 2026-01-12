import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'

interface Props {
  onNext: () => void
}

type DimensionMode = 'full' | 'area' | 'none'

export function StepGroups({ onNext }: Props) {
  const { draft, addGroup, updateGroup, removeGroup, calculateGroupM2 } = useQuoteStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [dimensionMode, setDimensionMode] = useState<DimensionMode>('full')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [manualM2, setManualM2] = useState('')

  const resetForm = () => {
    setName('')
    setDimensionMode('full')
    setLength('')
    setWidth('')
    setHeight('')
    setManualM2('')
    setEditingId(null)
  }

  const handleSave = () => {
    if (!name.trim()) return

    const groupData = {
      name: name.trim(),
      length: dimensionMode === 'full' && length ? parseFloat(length) : undefined,
      width: dimensionMode === 'full' && width ? parseFloat(width) : undefined,
      height: dimensionMode === 'full' && height ? parseFloat(height) : undefined,
      manualM2: dimensionMode === 'area' && manualM2 ? parseFloat(manualM2) : undefined,
      services: [],
    }

    if (editingId) {
      updateGroup(editingId, groupData)
    } else {
      addGroup(groupData)
    }

    setShowModal(false)
    resetForm()
  }

  const handleEdit = (group: typeof draft.groups[0]) => {
    setEditingId(group.id)
    setName(group.name)
    if (group.length && group.width) {
      setDimensionMode('full')
      setLength(group.length.toString())
      setWidth(group.width.toString())
      setHeight(group.height?.toString() || '')
    } else if (group.manualM2) {
      setDimensionMode('area')
      setManualM2(group.manualM2.toString())
    } else {
      setDimensionMode('none')
    }
    setShowModal(true)
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={draft.groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const m2 = calculateGroupM2(item)
          return (
            <View style={styles.groupCard}>
              <Pressable style={styles.groupContent} onPress={() => handleEdit(item)}>
                <Text style={styles.groupName}>{item.name}</Text>
                {m2.floor > 0 && (
                  <Text style={styles.groupM2}>{m2.floor.toFixed(1)} m² podłogi</Text>
                )}
                {item.manualM2 && (
                  <Text style={styles.groupM2}>{item.manualM2} m² (ręcznie)</Text>
                )}
                <Text style={styles.servicesCount}>
                  {item.services.length} usług
                </Text>
              </Pressable>
              <Pressable onPress={() => removeGroup(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </Pressable>
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Dodaj pierwszy pokój lub sekcję</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* Add button */}
      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={24} color="#2563eb" />
        <Text style={styles.addButtonText}>Dodaj grupę</Text>
      </Pressable>

      {/* Next button */}
      {draft.groups.length > 0 && (
        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Dalej - Usługi</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      )}

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowModal(false); resetForm() }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edytuj grupę' : 'Nowa grupa'}
            </Text>
            <Pressable onPress={handleSave}>
              <Text style={styles.modalSave}>Zapisz</Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Nazwa</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Salon, Łazienka, Hydraulika"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Wymiary</Text>
            <View style={styles.modeButtons}>
              {(['full', 'area', 'none'] as DimensionMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.modeButton, dimensionMode === mode && styles.modeButtonActive]}
                  onPress={() => setDimensionMode(mode)}
                >
                  <Text style={[styles.modeButtonText, dimensionMode === mode && styles.modeButtonTextActive]}>
                    {mode === 'full' ? 'Pełne' : mode === 'area' ? 'Tylko m²' : 'Brak'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {dimensionMode === 'full' && (
              <View style={styles.dimensionsRow}>
                <View style={styles.dimensionInput}>
                  <Text style={styles.smallLabel}>Długość (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5.0"
                    value={length}
                    onChangeText={setLength}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <Text style={styles.smallLabel}>Szerokość (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4.0"
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <Text style={styles.smallLabel}>Wysokość (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2.8"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}

            {dimensionMode === 'area' && (
              <>
                <Text style={styles.smallLabel}>Powierzchnia (m²)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20.0"
                  value={manualM2}
                  onChangeText={setManualM2}
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupContent: { flex: 1, padding: 16 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  groupM2: { fontSize: 14, color: '#2563eb', marginTop: 4 },
  servicesCount: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  deleteBtn: { padding: 16, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
  smallLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  modeButtons: { flexDirection: 'row', gap: 8 },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modeButtonActive: { backgroundColor: '#dbeafe' },
  modeButtonText: { fontSize: 14, color: '#6b7280' },
  modeButtonTextActive: { color: '#2563eb', fontWeight: '600' },
  dimensionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dimensionInput: { flex: 1 },
})
