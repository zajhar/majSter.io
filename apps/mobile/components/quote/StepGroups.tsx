import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'
import { trpc } from '../../lib/trpc'
import type { QuantitySource } from '@majsterio/shared'

type DimensionMode = 'full' | 'manual' | 'none'

interface GroupFormState {
  name: string
  dimensionMode: DimensionMode
  // Full mode
  length: string
  width: string
  height: string
  // Manual mode
  manualFloor: string
  manualCeiling: string
  manualWalls: string
  manualPerimeter: string
  // Template selection
  useTemplate: 'none' | 'template'
  selectedTemplateId: string | null
}

const initialFormState: GroupFormState = {
  name: '',
  dimensionMode: 'full',
  length: '',
  width: '',
  height: '',
  manualFloor: '',
  manualCeiling: '',
  manualWalls: '',
  manualPerimeter: '',
  useTemplate: 'none',
  selectedTemplateId: null,
}

export function StepGroups() {
  const { draft, addGroup, updateGroup, removeGroup, calculateGroupM2 } = useQuoteStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GroupFormState>(initialFormState)

  // Template query
  const { data: templates } = trpc.groupTemplates.list.useQuery()
  const systemTemplates = templates?.filter(t => t.isSystem) ?? []
  const userTemplates = templates?.filter(t => !t.isSystem) ?? []

  const resetForm = () => {
    setForm(initialFormState)
    setEditingId(null)
  }

  const updateField = <K extends keyof GroupFormState>(field: K, value: GroupFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Calculate preview values when in "full" mode
  const getPreviewCalculations = () => {
    if (form.dimensionMode !== 'full') return null
    const l = parseFloat(form.length) || 0
    const w = parseFloat(form.width) || 0
    const h = parseFloat(form.height) || 0
    if (l === 0 || w === 0) return null

    return {
      floor: l * w,
      ceiling: l * w,
      walls: h > 0 ? 2 * (l + w) * h : 0,
      perimeter: 2 * (l + w),
    }
  }

  const handleSave = () => {
    if (!form.name.trim()) return

    // Determine services based on editing or template selection
    let services = editingId
      ? draft.groups.find(g => g.id === editingId)?.services || []
      : []

    if (!editingId && form.useTemplate === 'template' && form.selectedTemplateId) {
      const template = templates?.find(t => t.id === form.selectedTemplateId)
      if (template) {
        services = template.services.map(s => ({
          id: `temp_${Math.random().toString(36).slice(2)}`,
          name: s.name,
          unit: s.unit,
          pricePerUnit: s.pricePerUnit,
          quantity: 0, // Will be calculated from dimensions
          quantitySource: s.quantitySource as QuantitySource,
        }))
      }
    }

    const groupData: Parameters<typeof addGroup>[0] = {
      name: form.name.trim(),
      services,
    }

    if (form.dimensionMode === 'full') {
      groupData.length = form.length ? parseFloat(form.length) : undefined
      groupData.width = form.width ? parseFloat(form.width) : undefined
      groupData.height = form.height ? parseFloat(form.height) : undefined
    } else if (form.dimensionMode === 'manual') {
      groupData.manualFloor = form.manualFloor ? parseFloat(form.manualFloor) : undefined
      groupData.manualCeiling = form.manualCeiling ? parseFloat(form.manualCeiling) : undefined
      groupData.manualWalls = form.manualWalls ? parseFloat(form.manualWalls) : undefined
      groupData.manualPerimeter = form.manualPerimeter ? parseFloat(form.manualPerimeter) : undefined
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

    const newForm: GroupFormState = {
      ...initialFormState,
      name: group.name,
    }

    // Determine dimension mode from existing data
    if (group.manualFloor !== undefined || group.manualCeiling !== undefined ||
        group.manualWalls !== undefined || group.manualPerimeter !== undefined) {
      newForm.dimensionMode = 'manual'
      newForm.manualFloor = group.manualFloor?.toString() || ''
      newForm.manualCeiling = group.manualCeiling?.toString() || ''
      newForm.manualWalls = group.manualWalls?.toString() || ''
      newForm.manualPerimeter = group.manualPerimeter?.toString() || ''
    } else if (group.length && group.width) {
      newForm.dimensionMode = 'full'
      newForm.length = group.length.toString()
      newForm.width = group.width.toString()
      newForm.height = group.height?.toString() || ''
    } else if (group.manualM2) {
      // Legacy support
      newForm.dimensionMode = 'manual'
      newForm.manualFloor = group.manualM2.toString()
      newForm.manualCeiling = group.manualM2.toString()
    } else {
      newForm.dimensionMode = 'none'
    }

    setForm(newForm)
    setShowModal(true)
  }

  const handleAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const preview = getPreviewCalculations()

  return (
    <View style={styles.container}>
      <FlatList
        data={draft.groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const m2 = calculateGroupM2(item)
          const hasValues = m2.floor > 0 || m2.ceiling > 0 || m2.walls > 0 || m2.perimeter > 0
          const serviceTotal = item.services.reduce((sum, s) => {
            let qty = s.quantity
            if (s.quantitySource === 'floor') qty = m2.floor || s.quantity
            if (s.quantitySource === 'ceiling') qty = m2.ceiling || s.quantity
            if (s.quantitySource === 'walls') qty = m2.walls || s.quantity
            if (s.quantitySource === 'walls_ceiling') qty = (m2.walls + m2.ceiling) || s.quantity
            if (s.quantitySource === 'perimeter') qty = m2.perimeter || s.quantity
            return sum + qty * s.pricePerUnit
          }, 0)

          return (
            <View style={styles.groupCard}>
              <Pressable style={styles.groupContent} onPress={() => handleEdit(item)}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Ionicons name="pencil" size={16} color={colors.text.muted} />
                </View>

                {/* Dimension display */}
                {item.length && item.width && (
                  <Text style={styles.dimensions}>
                    {item.length}m x {item.width}m{item.height ? ` x ${item.height}m` : ''}
                  </Text>
                )}

                {/* Calculated values chips */}
                {hasValues && (
                  <View style={styles.valuesRow}>
                    {m2.floor > 0 && (
                      <View style={styles.valueChip}>
                        <Text style={styles.valueNumber}>{m2.floor.toFixed(1)}</Text>
                        <Text style={styles.valueLabel}>m² podł</Text>
                      </View>
                    )}
                    {m2.ceiling > 0 && m2.ceiling !== m2.floor && (
                      <View style={styles.valueChip}>
                        <Text style={styles.valueNumber}>{m2.ceiling.toFixed(1)}</Text>
                        <Text style={styles.valueLabel}>m² sufit</Text>
                      </View>
                    )}
                    {m2.walls > 0 && (
                      <View style={styles.valueChip}>
                        <Text style={styles.valueNumber}>{m2.walls.toFixed(1)}</Text>
                        <Text style={styles.valueLabel}>m² ściany</Text>
                      </View>
                    )}
                    {m2.perimeter > 0 && (
                      <View style={styles.valueChip}>
                        <Text style={styles.valueNumber}>{m2.perimeter.toFixed(1)}</Text>
                        <Text style={styles.valueLabel}>mb</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Services summary */}
                <View style={styles.servicesSummary}>
                  <Text style={styles.servicesCount}>
                    {item.services.length} {item.services.length === 1 ? 'usługa' : 'usług'}
                  </Text>
                  {serviceTotal > 0 && (
                    <Text style={styles.servicesTotal}>{serviceTotal.toFixed(0)} zł</Text>
                  )}
                </View>
              </Pressable>

              <Pressable onPress={() => removeGroup(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
              </Pressable>
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Dodaj pierwszy pokój lub sekcję</Text>
            <Text style={styles.emptySubtext}>
              Grupy pomagają organizować usługi
            </Text>
          </View>
        }
        ListFooterComponent={
          <Pressable style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.addButtonText}>Dodaj grupę</Text>
          </Pressable>
        }
        contentContainerStyle={styles.list}
      />

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowModal(false); resetForm() }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edytuj grupę' : 'Nowa grupa'}
            </Text>
            <Pressable onPress={handleSave}>
              <Text style={[styles.modalSave, !form.name.trim() && styles.modalSaveDisabled]}>
                Zapisz
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Nazwa</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Salon, Łazienka, Hydraulika"
              placeholderTextColor={colors.text.muted}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              autoFocus
            />

            {!editingId && (
              <>
                <Text style={styles.label}>Szablon</Text>
                <View style={styles.radioGroup}>
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => updateField('useTemplate', 'none')}
                  >
                    <View style={[styles.radio, form.useTemplate === 'none' && styles.radioSelected]} />
                    <Text style={styles.radioLabel}>Pusta grupa</Text>
                  </Pressable>
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => updateField('useTemplate', 'template')}
                  >
                    <View style={[styles.radio, form.useTemplate === 'template' && styles.radioSelected]} />
                    <Text style={styles.radioLabel}>Z szablonu</Text>
                  </Pressable>
                </View>

                {form.useTemplate === 'template' && (
                  <View style={styles.templatePicker}>
                    {systemTemplates.length > 0 && (
                      <>
                        <Text style={styles.templateSectionTitle}>SYSTEMOWE</Text>
                        {systemTemplates.map(t => (
                          <Pressable
                            key={t.id}
                            style={[
                              styles.templateItem,
                              form.selectedTemplateId === t.id && styles.templateItemSelected
                            ]}
                            onPress={() => {
                              updateField('selectedTemplateId', t.id)
                              if (!form.name) updateField('name', t.name)
                            }}
                          >
                            <Text style={styles.templateName}>{t.name}</Text>
                            <Text style={styles.templateCount}>{t.services.length} usług</Text>
                          </Pressable>
                        ))}
                      </>
                    )}
                    {userTemplates.length > 0 && (
                      <>
                        <Text style={styles.templateSectionTitle}>MOJE SZABLONY</Text>
                        {userTemplates.map(t => (
                          <Pressable
                            key={t.id}
                            style={[
                              styles.templateItem,
                              form.selectedTemplateId === t.id && styles.templateItemSelected
                            ]}
                            onPress={() => {
                              updateField('selectedTemplateId', t.id)
                              if (!form.name) updateField('name', t.name)
                            }}
                          >
                            <Text style={styles.templateName}>{t.name}</Text>
                            <Text style={styles.templateCount}>{t.services.length} usług</Text>
                          </Pressable>
                        ))}
                      </>
                    )}
                  </View>
                )}
              </>
            )}

            <Text style={styles.label}>Wymiary</Text>
            <View style={styles.modeButtons}>
              {([
                { key: 'full', label: 'Pełne' },
                { key: 'manual', label: 'Ręczne' },
                { key: 'none', label: 'Brak' },
              ] as const).map((mode) => (
                <Pressable
                  key={mode.key}
                  style={[styles.modeButton, form.dimensionMode === mode.key && styles.modeButtonActive]}
                  onPress={() => updateField('dimensionMode', mode.key)}
                >
                  <Text style={[
                    styles.modeButtonText,
                    form.dimensionMode === mode.key && styles.modeButtonTextActive
                  ]}>
                    {mode.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {form.dimensionMode === 'full' && (
              <>
                <View style={styles.dimensionsRow}>
                  <View style={styles.dimensionInput}>
                    <Text style={styles.smallLabel}>Długość</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="5.0"
                        placeholderTextColor={colors.text.muted}
                        value={form.length}
                        onChangeText={(v) => updateField('length', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m</Text>
                    </View>
                  </View>
                  <View style={styles.dimensionInput}>
                    <Text style={styles.smallLabel}>Szerokość</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="4.0"
                        placeholderTextColor={colors.text.muted}
                        value={form.width}
                        onChangeText={(v) => updateField('width', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m</Text>
                    </View>
                  </View>
                  <View style={styles.dimensionInput}>
                    <Text style={styles.smallLabel}>Wysokość</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="2.8"
                        placeholderTextColor={colors.text.muted}
                        value={form.height}
                        onChangeText={(v) => updateField('height', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m</Text>
                    </View>
                  </View>
                </View>

                {/* Preview calculations */}
                {preview && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>Obliczone:</Text>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewItem}>Podłoga: {preview.floor.toFixed(1)} m²</Text>
                      <Text style={styles.previewItem}>Sufit: {preview.ceiling.toFixed(1)} m²</Text>
                    </View>
                    <View style={styles.previewRow}>
                      {preview.walls > 0 && (
                        <Text style={styles.previewItem}>Ściany: {preview.walls.toFixed(1)} m²</Text>
                      )}
                      <Text style={styles.previewItem}>Obwód: {preview.perimeter.toFixed(1)} mb</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {form.dimensionMode === 'manual' && (
              <>
                <View style={styles.manualRow}>
                  <View style={styles.manualInput}>
                    <Text style={styles.smallLabel}>Podłoga</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="20"
                        placeholderTextColor={colors.text.muted}
                        value={form.manualFloor}
                        onChangeText={(v) => updateField('manualFloor', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m²</Text>
                    </View>
                  </View>
                  <View style={styles.manualInput}>
                    <Text style={styles.smallLabel}>Sufit</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="20"
                        placeholderTextColor={colors.text.muted}
                        value={form.manualCeiling}
                        onChangeText={(v) => updateField('manualCeiling', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m²</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.manualRow}>
                  <View style={styles.manualInput}>
                    <Text style={styles.smallLabel}>Ściany</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="50"
                        placeholderTextColor={colors.text.muted}
                        value={form.manualWalls}
                        onChangeText={(v) => updateField('manualWalls', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>m²</Text>
                    </View>
                  </View>
                  <View style={styles.manualInput}>
                    <Text style={styles.smallLabel}>Obwód</Text>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputCompact}
                        placeholder="18"
                        placeholderTextColor={colors.text.muted}
                        value={form.manualPerimeter}
                        onChangeText={(v) => updateField('manualPerimeter', v)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.unitLabel}>mb</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Info box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary.DEFAULT} />
              <Text style={styles.infoText}>
                Te wymiary automatycznie wypełnią ilości w usługach dodanych do tej grupy.
              </Text>
            </View>
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
    paddingBottom: 32,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  groupContent: {
    flex: 1,
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  dimensions: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 4,
  },
  valuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  valueChip: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  valueNumber: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  valueLabel: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 1,
  },
  servicesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  servicesCount: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  servicesTotal: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  deleteBtn: {
    padding: 16,
    justifyContent: 'center',
    backgroundColor: colors.error[50],
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
  modalSaveDisabled: {
    color: colors.text.muted,
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
  smallLabel: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginBottom: 4,
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
  inputCompact: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitLabel: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    minWidth: 24,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary[100],
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  modeButtonTextActive: {
    color: colors.primary.DEFAULT,
    fontFamily: fontFamily.semibold,
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dimensionInput: {
    flex: 1,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  manualInput: {
    flex: 1,
  },
  previewBox: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    padding: 14,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.success[700],
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  previewItem: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.success[700],
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: 14,
    marginTop: 24,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.primary[700],
    lineHeight: 18,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  templatePicker: {
    marginBottom: 16,
  },
  templateSectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.text.muted,
    marginBottom: 8,
    marginTop: 8,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  templateItemSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  templateName: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  templateCount: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
  },
})
