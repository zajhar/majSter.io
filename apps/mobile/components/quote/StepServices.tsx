import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'
import type { QuantitySource } from '@majsterio/shared'

interface Props {
  onNext: () => void
}

const QUANTITY_SOURCES: { value: QuantitySource; label: string }[] = [
  { value: 'manual', label: 'Ręcznie' },
  { value: 'floor', label: 'Podłoga' },
  { value: 'walls', label: 'Ściany' },
  { value: 'ceiling', label: 'Sufit' },
  { value: 'walls_ceiling', label: 'Ściany + Sufit' },
]

export function StepServices({ onNext }: Props) {
  const { draft, addServiceToGroup, removeService, calculateGroupM2 } = useQuoteStore()
  const { data: templates } = trpc.templates.services.list.useQuery()

  const [showModal, setShowModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('m²')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [quantitySource, setQuantitySource] = useState<QuantitySource>('manual')

  const resetForm = () => {
    setName('')
    setQuantity('')
    setUnit('m²')
    setPricePerUnit('')
    setQuantitySource('manual')
  }

  const handleAddService = (groupId: string) => {
    setSelectedGroupId(groupId)
    setShowModal(true)
  }

  const handleSelectTemplate = (template: NonNullable<typeof templates>[0]) => {
    setName(template.name)
    setUnit(template.unit)
    setPricePerUnit(template.defaultPrice?.toString() || '')
    setQuantitySource(template.quantitySource as QuantitySource)
  }

  const handleSave = () => {
    if (!selectedGroupId || !name.trim() || !quantity || !pricePerUnit) return

    addServiceToGroup(selectedGroupId, {
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      quantitySource,
    })

    setShowModal(false)
    resetForm()
    setSelectedGroupId(null)
  }

  const getCalculatedQuantity = (groupId: string, source: QuantitySource): number | null => {
    const group = draft.groups.find((g) => g.id === groupId)
    if (!group) return null
    const m2 = calculateGroupM2(group)

    switch (source) {
      case 'floor': return m2.floor || null
      case 'walls': return m2.walls || null
      case 'ceiling': return m2.ceiling || null
      case 'walls_ceiling': return (m2.walls + m2.ceiling) || null
      default: return null
    }
  }

  const totalServices = draft.groups.reduce((sum, g) => sum + g.services.length, 0)

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {draft.groups.map((group) => {
          const m2 = calculateGroupM2(group)
          return (
            <View key={group.id} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                {m2.floor > 0 && <Text style={styles.groupM2}>{m2.floor.toFixed(1)} m²</Text>}
              </View>

              {group.services.map((service) => (
                <View key={service.id} style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDetails}>
                      {service.quantity} {service.unit} × {service.pricePerUnit} zł
                    </Text>
                  </View>
                  <Text style={styles.serviceTotal}>
                    {(service.quantity * service.pricePerUnit).toFixed(0)} zł
                  </Text>
                  <Pressable onPress={() => removeService(group.id, service.id)}>
                    <Ionicons name="close-circle" size={24} color="#dc2626" />
                  </Pressable>
                </View>
              ))}

              <Pressable
                style={styles.addServiceButton}
                onPress={() => handleAddService(group.id)}
              >
                <Ionicons name="add" size={20} color="#2563eb" />
                <Text style={styles.addServiceText}>Dodaj usługę</Text>
              </Pressable>
            </View>
          )
        })}
      </ScrollView>

      {/* Next button */}
      {totalServices > 0 && (
        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Dalej - Materiały</Text>
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
            <Text style={styles.modalTitle}>Dodaj usługę</Text>
            <Pressable onPress={handleSave}>
              <Text style={styles.modalSave}>Dodaj</Text>
            </Pressable>
          </View>

          {/* Templates */}
          {templates && templates.length > 0 && (
            <View style={styles.templatesSection}>
              <Text style={styles.templatesTitle}>Szablony</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {templates.map((t) => (
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
            <Text style={styles.label}>Nazwa usługi</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Malowanie ścian"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Źródło ilości</Text>
            <View style={styles.sourceButtons}>
              {QUANTITY_SOURCES.map((s) => (
                <Pressable
                  key={s.value}
                  style={[styles.sourceButton, quantitySource === s.value && styles.sourceButtonActive]}
                  onPress={() => {
                    setQuantitySource(s.value)
                    const calc = selectedGroupId ? getCalculatedQuantity(selectedGroupId, s.value) : null
                    if (calc) setQuantity(calc.toFixed(2))
                  }}
                >
                  <Text style={[styles.sourceButtonText, quantitySource === s.value && styles.sourceButtonTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

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
                  placeholder="m²"
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
  scrollView: { flex: 1 },
  groupSection: { backgroundColor: 'white', marginBottom: 12, padding: 16 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  groupM2: { fontSize: 14, color: '#2563eb' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, color: '#1f2937' },
  serviceDetails: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  serviceTotal: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  addServiceText: { color: '#2563eb', fontSize: 14 },
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
  sourceButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  sourceButtonActive: { backgroundColor: '#dbeafe' },
  sourceButtonText: { fontSize: 13, color: '#6b7280' },
  sourceButtonTextActive: { color: '#2563eb', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
})
