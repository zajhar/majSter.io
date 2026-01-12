import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'

interface Props {
  onNext: () => void
}

export function StepMaterials({ onNext }: Props) {
  const { draft, addMaterial, removeMaterial } = useQuoteStore()
  const { data: templates } = trpc.templates.materials.list.useQuery()

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('szt')
  const [pricePerUnit, setPricePerUnit] = useState('')

  const resetForm = () => {
    setName('')
    setQuantity('')
    setUnit('szt')
    setPricePerUnit('')
  }

  const handleSelectTemplate = (template: NonNullable<typeof templates>[0]) => {
    setName(template.name)
    setUnit(template.unit)
    setPricePerUnit(template.defaultPrice?.toString() || '')
  }

  const handleSave = () => {
    if (!name.trim() || !quantity || !pricePerUnit) return

    addMaterial({
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
    })

    setShowModal(false)
    resetForm()
  }

  const materialsTotal = draft.materials.reduce(
    (sum, m) => sum + m.quantity * m.pricePerUnit, 0
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={draft.materials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.materialRow}>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{item.name}</Text>
              <Text style={styles.materialDetails}>
                {item.quantity} {item.unit} × {item.pricePerUnit} zł
              </Text>
            </View>
            <Text style={styles.materialTotal}>
              {(item.quantity * item.pricePerUnit).toFixed(0)} zł
            </Text>
            <Pressable onPress={() => removeMaterial(item.id)}>
              <Ionicons name="close-circle" size={24} color="#dc2626" />
            </Pressable>
          </View>
        )}
        ListHeaderComponent={
          draft.materials.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Materiały</Text>
              <Text style={styles.headerTotal}>{materialsTotal.toFixed(0)} zł</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Brak materiałów</Text>
            <Text style={styles.emptySubtext}>Materiały są opcjonalne</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* Add button */}
      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={24} color="#2563eb" />
        <Text style={styles.addButtonText}>Dodaj materiał</Text>
      </Pressable>

      {/* Next button (always visible - materials are optional) */}
      <Pressable style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Dalej - Podgląd</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </Pressable>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowModal(false); resetForm() }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Dodaj materiał</Text>
            <Pressable onPress={handleSave}>
              <Text style={styles.modalSave}>Dodaj</Text>
            </Pressable>
          </View>

          {/* Templates */}
          {templates && templates.length > 0 && (
            <View style={styles.templatesSection}>
              <Text style={styles.templatesTitle}>Szablony</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {templates.map((t: NonNullable<typeof templates>[number]) => (
                  <Pressable
                    key={t.id}
                    style={styles.templateChip}
                    onPress={() => handleSelectTemplate(t)}
                  >
                    <Text style={styles.templateChipText}>{t.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

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
                <Text style={styles.label}>Ilość</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={quantity}
                  onChangeText={setQuantity}
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

            <Text style={styles.label}>Cena za jednostkę (zł)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
              keyboardType="decimal-pad"
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  headerTotal: { fontSize: 18, fontWeight: '600', color: '#2563eb' },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  materialInfo: { flex: 1 },
  materialName: { fontSize: 16, color: '#1f2937' },
  materialDetails: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  materialTotal: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
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
  templatesSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  templatesTitle: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  templateChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  templateChipText: { fontSize: 14, color: '#374151' },
  modalContent: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 16 },
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
