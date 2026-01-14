import { useState, useMemo } from 'react'
import {
  View, Text, Pressable, StyleSheet,
  TextInput, Modal, ScrollView, FlatList
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'
import type { QuantitySource } from '@majsterio/shared'
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from '@majsterio/shared'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

const QUANTITY_SOURCES: { value: QuantitySource; label: string }[] = [
  { value: 'manual', label: 'Recznie' },
  { value: 'floor', label: 'Podloga' },
  { value: 'walls', label: 'Sciany' },
  { value: 'ceiling', label: 'Sufit' },
  { value: 'walls_ceiling', label: 'Sciany + Sufit' },
  { value: 'perimeter', label: 'Obwod' },
]

const UNITS = ['m2', 'mb', 'szt', 'm3', 'kg']

interface SelectedTemplate {
  id: string
  name: string
  unit: string
  defaultPrice: number | null
  quantitySource: QuantitySource
}

interface ServiceFormState {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  quantitySource: QuantitySource
}

const initialFormState: ServiceFormState = {
  name: '',
  quantity: '',
  unit: 'm2',
  pricePerUnit: '',
  quantitySource: 'manual',
}

export function StepServices() {
  const { draft, addServiceToGroup, removeService, calculateGroupM2 } = useQuoteStore()
  const { data: templates } = trpc.templates.services.list.useQuery()

  // Modal states
  const [showSelectModal, setShowSelectModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryKey[]>([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  // Single service form
  const [form, setForm] = useState<ServiceFormState>(initialFormState)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})
  const [showCustomUnit, setShowCustomUnit] = useState(false)

  // Batch edit state
  const [batchServices, setBatchServices] = useState<Array<{
    templateId: string
    name: string
    quantity: string
    unit: string
    pricePerUnit: string
    quantitySource: QuantitySource
  }>>([])

  const resetForm = () => {
    setForm(initialFormState)
    setErrors({})
    setShowCustomUnit(false)
  }

  const handleAddService = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedTemplates([])
    setSearchQuery('')
    setShowSelectModal(true)
  }

  // Toggle template selection
  const handleToggleTemplate = (template: NonNullable<typeof templates>[0]) => {
    setSelectedTemplates((prev) => {
      const exists = prev.find((t) => t.id === template.id)
      if (exists) {
        return prev.filter((t) => t.id !== template.id)
      }
      return [...prev, {
        id: template.id,
        name: template.name,
        unit: template.unit,
        defaultPrice: template.defaultPrice ? parseFloat(template.defaultPrice) : null,
        quantitySource: (template.quantitySource as QuantitySource) || 'manual',
      }]
    })
  }

  // Proceed to batch edit
  const handleProceedToBatch = () => {
    if (!selectedGroupId) return

    const group = draft.groups.find((g) => g.id === selectedGroupId)
    if (!group) return

    const m2 = calculateGroupM2(group)

    // Initialize batch services with calculated quantities
    const batch = selectedTemplates.map((t) => {
      let quantity = ''
      let source = t.quantitySource

      // Auto-detect source based on unit
      if (t.unit === 'mb' && source === 'manual') {
        source = 'perimeter'
      }

      // Calculate quantity from source
      const calculatedQty = getCalculatedQuantity(m2, source)
      if (calculatedQty !== null) {
        quantity = calculatedQty.toFixed(2)
      }

      return {
        templateId: t.id,
        name: t.name,
        quantity,
        unit: t.unit,
        pricePerUnit: t.defaultPrice?.toString() || '',
        quantitySource: source,
      }
    })

    setBatchServices(batch)
    setShowSelectModal(false)
    setShowEditModal(true)
  }

  // Save batch services
  const handleSaveBatch = () => {
    if (!selectedGroupId) return

    let hasError = false
    batchServices.forEach((service) => {
      if (!service.name.trim() || !service.quantity || !service.pricePerUnit) {
        hasError = true
      }
    })

    if (hasError) {
      // Show validation errors inline in batch modal
      return
    }

    batchServices.forEach((service) => {
      addServiceToGroup(selectedGroupId, {
        name: service.name.trim(),
        quantity: parseFloat(service.quantity),
        unit: service.unit,
        pricePerUnit: parseFloat(service.pricePerUnit),
        quantitySource: service.quantitySource,
      })
    })

    setShowEditModal(false)
    setBatchServices([])
    setSelectedTemplates([])
    setSelectedGroupId(null)
  }

  // Add custom service
  const handleAddCustom = () => {
    resetForm()
    setShowSelectModal(false)
    setShowEditModal(true)
    setBatchServices([]) // Single service mode
  }

  // Save single service
  const handleSaveSingle = () => {
    if (!selectedGroupId) return

    const newErrors: typeof errors = {}
    if (!form.name.trim()) newErrors.name = 'Podaj nazwe'
    if (!form.pricePerUnit) newErrors.price = 'Podaj cene'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    addServiceToGroup(selectedGroupId, {
      name: form.name.trim(),
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      pricePerUnit: parseFloat(form.pricePerUnit),
      quantitySource: form.quantitySource,
    })

    setShowEditModal(false)
    resetForm()
    setSelectedGroupId(null)
  }

  const getCalculatedQuantity = (
    m2: { floor: number; walls: number; ceiling: number; perimeter: number },
    source: QuantitySource
  ): number | null => {
    switch (source) {
      case 'floor': return m2.floor || null
      case 'walls': return m2.walls || null
      case 'ceiling': return m2.ceiling || null
      case 'walls_ceiling': return (m2.walls + m2.ceiling) || null
      case 'perimeter': return m2.perimeter || null
      default: return null
    }
  }

  const updateBatchService = (index: number, field: string, value: string) => {
    setBatchServices((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }

      // If changing quantity source, recalculate quantity
      if (field === 'quantitySource' && selectedGroupId) {
        const group = draft.groups.find((g) => g.id === selectedGroupId)
        if (group) {
          const m2 = calculateGroupM2(group)
          const calc = getCalculatedQuantity(m2, value as QuantitySource)
          if (calc !== null) {
            updated[index].quantity = calc.toFixed(2)
          }
        }
      }

      return updated
    })
  }

  // Filter templates by search and categories
  const filteredTemplates = useMemo(() => {
    if (!templates) return []

    let result = templates

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((t) =>
        t.category && selectedCategories.includes(t.category as ServiceCategoryKey)
      )
    }

    // Filter by search
    if (searchQuery.trim()) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result
  }, [templates, searchQuery, selectedCategories])

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, typeof filteredTemplates> = {}

    filteredTemplates.forEach((t) => {
      const cat = t.category || 'inne'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(t)
    })

    return groups
  }, [filteredTemplates])

  // Toggle category filter
  const handleToggleCategory = (category: ServiceCategoryKey) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      }
      return [...prev, category]
    })
  }

  // Remove category filter
  const handleRemoveCategory = (category: ServiceCategoryKey) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== category))
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {draft.groups.map((group) => {
          const m2 = calculateGroupM2(group)
          const groupTotal = group.services.reduce((sum, s) => {
            let qty = s.quantity
            const calc = getCalculatedQuantity(m2, s.quantitySource)
            if (calc !== null) qty = calc
            return sum + qty * s.pricePerUnit
          }, 0)

          return (
            <View key={group.id} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {(m2.floor > 0 || m2.walls > 0 || m2.perimeter > 0) && (
                    <Text style={styles.groupDimensions}>
                      {m2.floor > 0 && `${m2.floor.toFixed(1)} m2 podl`}
                      {m2.walls > 0 && ` . ${m2.walls.toFixed(1)} m2 sc`}
                      {m2.perimeter > 0 && ` . ${m2.perimeter.toFixed(1)} mb`}
                    </Text>
                  )}
                </View>
                {groupTotal > 0 && (
                  <Text style={styles.groupTotal}>{groupTotal.toFixed(0)} zl</Text>
                )}
              </View>

              {group.services.map((service) => {
                const calc = getCalculatedQuantity(m2, service.quantitySource)
                const qty = calc ?? service.quantity
                const total = qty * service.pricePerUnit

                return (
                  <View key={service.id} style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDetails}>
                        {qty.toFixed(qty % 1 === 0 ? 0 : 2)} {service.unit} x {service.pricePerUnit} zl
                      </Text>
                    </View>
                    <Text style={styles.serviceTotal}>{total.toFixed(0)} zl</Text>
                    <Pressable
                      onPress={() => removeService(group.id, service.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.error.DEFAULT} />
                    </Pressable>
                  </View>
                )
              })}

              <Pressable
                style={styles.addServiceButton}
                onPress={() => handleAddService(group.id)}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary.DEFAULT} />
                <Text style={styles.addServiceText}>Dodaj usluge</Text>
              </Pressable>
            </View>
          )
        })}
      </ScrollView>

      {/* Template Selection Modal */}
      <Modal visible={showSelectModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowSelectModal(false)}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Dodaj uslugi</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.body} />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj uslugi..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category filters */}
          <View style={styles.categoryFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryChips}>
                {selectedCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={styles.categoryChip}
                    onPress={() => handleRemoveCategory(cat)}
                  >
                    <Text style={styles.categoryChipText}>
                      {SERVICE_CATEGORIES[cat]}
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[700]} />
                  </Pressable>
                ))}
                <Pressable
                  style={styles.addCategoryButton}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Ionicons name="filter" size={16} color={colors.primary.DEFAULT} />
                  <Text style={styles.addCategoryText}>Filtruj</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>

          <ScrollView style={styles.templatesScroll}>
            {/* Grouped templates by category */}
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <View key={category} style={styles.templateSection}>
                <Text style={styles.templateSectionTitle}>
                  {SERVICE_CATEGORIES[category as ServiceCategoryKey] || 'Inne'}
                </Text>
                <View style={styles.templateGrid}>
                  {categoryTemplates.map((t) => {
                    const isSelected = selectedTemplates.some((s) => s.id === t.id)
                    return (
                      <Pressable
                        key={t.id}
                        style={[styles.templateChip, isSelected && styles.templateChipSelected]}
                        onPress={() => handleToggleTemplate(t)}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color={colors.primary.DEFAULT} />
                        )}
                        <Text style={[styles.templateChipText, isSelected && styles.templateChipTextSelected]}>
                          {t.name}
                        </Text>
                        {t.defaultPrice && (
                          <Text style={styles.templateChipPrice}>{t.defaultPrice} zl/{t.unit}</Text>
                        )}
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            ))}

            {/* Custom service button */}
            <Pressable style={styles.customServiceButton} onPress={handleAddCustom}>
              <Ionicons name="add" size={20} color={colors.primary.DEFAULT} />
              <Text style={styles.customServiceText}>Wlasna usluga</Text>
            </Pressable>
          </ScrollView>

          {/* Selection footer */}
          {selectedTemplates.length > 0 && (
            <View style={styles.selectionFooter}>
              <Text style={styles.selectionCount}>
                Wybrano: {selectedTemplates.length} {selectedTemplates.length === 1 ? 'usluga' : 'uslug'}
              </Text>
              <Pressable style={styles.proceedButton} onPress={handleProceedToBatch}>
                <Text style={styles.proceedButtonText}>Dodaj i ustaw ilosci</Text>
              </Pressable>
            </View>
          )}

          {/* Category Picker Modal */}
          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <Pressable
              style={styles.categoryOverlay}
              onPress={() => setShowCategoryPicker(false)}
            >
              <View style={styles.categoryModal}>
                <Text style={styles.categoryModalTitle}>Wybierz kategorie</Text>
                {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => {
                  const isSelected = selectedCategories.includes(key as ServiceCategoryKey)
                  return (
                    <Pressable
                      key={key}
                      style={styles.categoryOption}
                      onPress={() => handleToggleCategory(key as ServiceCategoryKey)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={isSelected ? colors.primary.DEFAULT : colors.text.body}
                      />
                      <Text style={styles.categoryOptionText}>{label}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </Pressable>
          </Modal>
        </View>
      </Modal>

      {/* Batch Edit / Single Service Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowEditModal(false); resetForm(); setBatchServices([]) }}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {batchServices.length > 0 ? 'Ustaw ilosci' : 'Nowa usluga'}
            </Text>
            <Pressable onPress={batchServices.length > 0 ? handleSaveBatch : handleSaveSingle}>
              <Text style={styles.modalSave}>Zapisz</Text>
            </Pressable>
          </View>

          {/* Group dimensions preview */}
          {selectedGroupId && (
            <View style={styles.dimensionsPreview}>
              {(() => {
                const group = draft.groups.find((g) => g.id === selectedGroupId)
                if (!group) return null
                const m2 = calculateGroupM2(group)
                return (
                  <Text style={styles.dimensionsPreviewText}>
                    {group.name}: {m2.floor > 0 && `${m2.floor.toFixed(1)} m2 podl`}
                    {m2.walls > 0 && ` . ${m2.walls.toFixed(1)} m2 sc`}
                    {m2.perimeter > 0 && ` . ${m2.perimeter.toFixed(1)} mb`}
                  </Text>
                )
              })()}
            </View>
          )}

          {/* Batch services */}
          {batchServices.length > 0 ? (
            <View style={styles.batchContainer}>
              {batchServices.map((service, index) => {
                const total = (parseFloat(service.quantity) || 0) * (parseFloat(service.pricePerUnit) || 0)
                const group = draft.groups.find((g) => g.id === selectedGroupId)
                const m2 = group ? calculateGroupM2(group) : { floor: 0, walls: 0, ceiling: 0, perimeter: 0 }

                return (
                  <View key={service.templateId} style={styles.batchItem}>
                    <View style={styles.batchHeader}>
                      <Text style={styles.batchName}>{service.name}</Text>
                      <Text style={styles.batchPrice}>{service.pricePerUnit} zl</Text>
                    </View>

                    <View style={styles.batchRow}>
                      <Text style={styles.batchLabel}>Ilosc z:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.sourceChips}>
                          {QUANTITY_SOURCES.map((src) => {
                            const calc = getCalculatedQuantity(m2, src.value)
                            const isActive = service.quantitySource === src.value
                            return (
                              <Pressable
                                key={src.value}
                                style={[styles.sourceChip, isActive && styles.sourceChipActive]}
                                onPress={() => updateBatchService(index, 'quantitySource', src.value)}
                              >
                                <Text style={[styles.sourceChipText, isActive && styles.sourceChipTextActive]}>
                                  {src.label}
                                  {calc !== null && ` (${calc.toFixed(1)})`}
                                </Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.batchInputRow}>
                      <TextInput
                        style={styles.batchInput}
                        value={service.quantity}
                        onChangeText={(v) => updateBatchService(index, 'quantity', v)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.text.muted}
                      />
                      <Text style={styles.batchUnit}>{service.unit}</Text>
                      <Text style={styles.batchEqual}>=</Text>
                      <Text style={styles.batchTotal}>{total.toFixed(0)} zl</Text>
                    </View>
                  </View>
                )
              })}

              {/* Batch total */}
              <View style={styles.batchTotalRow}>
                <Text style={styles.batchTotalLabel}>Razem:</Text>
                <Text style={styles.batchTotalValue}>
                  {batchServices.reduce((sum, s) =>
                    sum + (parseFloat(s.quantity) || 0) * (parseFloat(s.pricePerUnit) || 0), 0
                  ).toFixed(0)} zl
                </Text>
              </View>
            </View>
          ) : (
            /* Single service form */
            <View style={styles.formContainer}>
              <Text style={styles.label}>Nazwa uslugi *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="np. Malowanie scian"
                placeholderTextColor={colors.text.muted}
                value={form.name}
                onChangeText={(v) => { setForm((p) => ({ ...p, name: v })); setErrors((e) => ({ ...e, name: undefined })) }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.label}>Zrodlo ilosci</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sourceChips}>
                  {QUANTITY_SOURCES.map((src) => {
                    const group = draft.groups.find((g) => g.id === selectedGroupId)
                    const m2 = group ? calculateGroupM2(group) : { floor: 0, walls: 0, ceiling: 0, perimeter: 0 }
                    const calc = getCalculatedQuantity(m2, src.value)
                    const isActive = form.quantitySource === src.value
                    return (
                      <Pressable
                        key={src.value}
                        style={[styles.sourceChip, isActive && styles.sourceChipActive]}
                        onPress={() => {
                          setForm((p) => ({ ...p, quantitySource: src.value }))
                          if (calc !== null) {
                            setForm((p) => ({ ...p, quantity: calc.toFixed(2) }))
                          }
                        }}
                      >
                        <Text style={[styles.sourceChipText, isActive && styles.sourceChipTextActive]}>
                          {src.label}
                          {calc !== null && ` (${calc.toFixed(1)})`}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Ilosc</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.text.muted}
                    value={form.quantity}
                    onChangeText={(v) => setForm((p) => ({ ...p, quantity: v }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Jednostka</Text>
                  {showCustomUnit ? (
                    <TextInput
                      style={styles.input}
                      placeholder="np. opak"
                      placeholderTextColor={colors.text.muted}
                      value={form.unit}
                      onChangeText={(v) => setForm((p) => ({ ...p, unit: v }))}
                      autoFocus
                    />
                  ) : (
                    <View style={styles.unitPicker}>
                      {UNITS.map((u) => (
                        <Pressable
                          key={u}
                          style={[styles.unitOption, form.unit === u && styles.unitOptionActive]}
                          onPress={() => setForm((p) => ({ ...p, unit: u }))}
                        >
                          <Text style={[styles.unitOptionText, form.unit === u && styles.unitOptionTextActive]}>
                            {u}
                          </Text>
                        </Pressable>
                      ))}
                      <Pressable
                        style={styles.unitOption}
                        onPress={() => { setShowCustomUnit(true); setForm((p) => ({ ...p, unit: '' })) }}
                      >
                        <Text style={styles.unitOptionText}>...</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.label}>Cena za jednostke (zl) *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="0"
                placeholderTextColor={colors.text.muted}
                value={form.pricePerUnit}
                onChangeText={(v) => { setForm((p) => ({ ...p, pricePerUnit: v })); setErrors((e) => ({ ...e, price: undefined })) }}
                keyboardType="decimal-pad"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

              {/* Total preview */}
              {form.quantity && form.pricePerUnit && (
                <View style={styles.totalPreview}>
                  <Text style={styles.totalPreviewLabel}>Razem:</Text>
                  <Text style={styles.totalPreviewValue}>
                    {((parseFloat(form.quantity) || 0) * (parseFloat(form.pricePerUnit) || 0)).toFixed(0)} zl
                  </Text>
                </View>
              )}
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  groupSection: {
    backgroundColor: colors.surface,
    marginBottom: 8,
    paddingVertical: 12,
    ...shadows.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 17,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  groupDimensions: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  groupTotal: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  serviceDetails: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginTop: 2,
  },
  serviceTotal: {
    fontSize: 15,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  addServiceText: {
    color: colors.primary.DEFAULT,
    fontSize: 14,
    fontFamily: fontFamily.medium,
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
    fontSize: 17,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  modalSave: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  templatesScroll: {
    flex: 1,
  },
  templateSection: {
    padding: 16,
    paddingBottom: 8,
  },
  templateSectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
    marginBottom: 10,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateChipSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary.DEFAULT,
  },
  templateChipText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  templateChipTextSelected: {
    color: colors.primary[700],
    fontFamily: fontFamily.medium,
  },
  templateChipPrice: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  customServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  customServiceText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  selectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectionCount: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  proceedButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
  },
  proceedButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.semibold,
    color: colors.white,
  },
  dimensionsPreview: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dimensionsPreviewText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  batchContainer: {
    padding: 16,
  },
  batchItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: 14,
    marginBottom: 12,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  batchName: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  batchPrice: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.primary.DEFAULT,
  },
  batchRow: {
    marginBottom: 10,
  },
  batchLabel: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    marginBottom: 6,
  },
  sourceChips: {
    flexDirection: 'row',
    gap: 6,
  },
  sourceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  sourceChipActive: {
    backgroundColor: colors.primary[100],
  },
  sourceChipText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  sourceChipTextActive: {
    color: colors.primary.DEFAULT,
    fontFamily: fontFamily.medium,
  },
  batchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  batchUnit: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    width: 30,
  },
  batchEqual: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
  },
  batchTotal: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  batchTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  batchTotalLabel: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
  },
  batchTotalValue: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.primary.DEFAULT,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error[50],
  },
  errorText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.error.DEFAULT,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  unitOptionActive: {
    backgroundColor: colors.primary[100],
  },
  unitOptionText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  unitOptionTextActive: {
    color: colors.primary.DEFAULT,
    fontFamily: fontFamily.semibold,
  },
  totalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success[50],
    padding: 14,
    borderRadius: borderRadius.lg,
    marginTop: 20,
  },
  totalPreviewLabel: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.success[700],
  },
  totalPreviewValue: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.success[700],
  },
  categoryFilters: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.primary[700],
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  addCategoryText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  categoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    width: '85%',
    maxWidth: 360,
  },
  categoryModalTitle: {
    fontSize: 17,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  categoryOptionText: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
})
