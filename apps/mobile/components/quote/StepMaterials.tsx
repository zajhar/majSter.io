import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

export function StepMaterials() {
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
                {item.quantity} {item.unit} x {item.pricePerUnit} zl
              </Text>
            </View>
            <Text style={styles.materialTotal}>
              {(item.quantity * item.pricePerUnit).toFixed(0)} zl
            </Text>
            <Pressable onPress={() => removeMaterial(item.id)}>
              <Ionicons name="close-circle" size={24} color={colors.error.DEFAULT} />
            </Pressable>
          </View>
        )}
        ListHeaderComponent={
          draft.materials.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Materialy</Text>
              <Text style={styles.headerTotal}>{materialsTotal.toFixed(0)} zl</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Brak materialow</Text>
            <Text style={styles.emptySubtext}>Materialy sa opcjonalne</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* Add button */}
      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add-circle-outline" size={24} color={colors.primary.DEFAULT} />
        <Text style={styles.addButtonText}>Dodaj material</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowModal(false); resetForm() }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Dodaj material</Text>
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
            <Text style={styles.label}>Nazwa materialu</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Farba biala"
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Ilosc</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <Text style={styles.label}>Cena za jednostke (zl)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.text.muted}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  headerTotal: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    marginBottom: 8,
    gap: 8,
    ...shadows.sm,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  materialDetails: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  materialTotal: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  modalSave: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  templatesSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  templatesTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
    marginBottom: 8,
  },
  templateChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    marginRight: 8,
  },
  templateChipText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  modalContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: borderRadius.lg,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
})
