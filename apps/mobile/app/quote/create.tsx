import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { useCreateQuote } from '../../hooks/useOfflineQuotes'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

// Step components
import { StepClient } from '../../components/quote/StepClient'
import { StepGroups } from '../../components/quote/StepGroups'
import { StepServices } from '../../components/quote/StepServices'
import { StepMaterials } from '../../components/quote/StepMaterials'
import { StepPreview } from '../../components/quote/StepPreview'

const STEPS = [
  { key: 'client', title: 'Wybierz klienta' },
  { key: 'groups', title: 'Pokoje' },
  { key: 'services', title: 'Usługi' },
  { key: 'materials', title: 'Materiały' },
  { key: 'preview', title: 'Podgląd' },
]

export default function QuoteCreateScreen() {
  const insets = useSafeAreaInsets()
  const { draft, currentStep, setStep, reset, getTotal } = useQuoteStore()
  const { create } = useCreateQuote()
  const [isSaving, setIsSaving] = useState(false)

  const total = getTotal()
  const showTotal = currentStep >= 2 && total > 0

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    Alert.alert('Anuluj', 'Czy na pewno chcesz anulować tworzenie wyceny?', [
      { text: 'Nie', style: 'cancel' },
      { text: 'Tak', onPress: () => { reset(); router.back() } },
    ])
  }

  const handleSaveDraft = () => {
    // TODO: Implement draft saving in Phase 6
    Alert.alert('Zapisano', 'Wycena zapisana jako szkic')
    router.back()
  }

  const handleSubmit = async () => {
    if (draft.groups.length === 0) {
      Alert.alert('Błąd', 'Dodaj co najmniej jedną grupę')
      return
    }

    setIsSaving(true)
    const result = await create({
      clientId: draft.clientId ?? undefined,
      notesBefore: draft.notesBefore || undefined,
      notesAfter: draft.notesAfter || undefined,
      disclaimer: draft.disclaimer || undefined,
      showDisclaimer: draft.showDisclaimer,
      groups: draft.groups.map((g) => ({
        name: g.name,
        length: g.length,
        width: g.width,
        height: g.height,
        manualM2: g.manualM2,
        manualFloor: g.manualFloor,
        manualCeiling: g.manualCeiling,
        manualWalls: g.manualWalls,
        manualPerimeter: g.manualPerimeter,
        services: g.services.map((s) => ({
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          pricePerUnit: s.pricePerUnit,
          quantitySource: s.quantitySource,
        })),
      })),
      materials: draft.materials.map((m) => ({
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
        pricePerUnit: m.pricePerUnit,
      })),
    })
    setIsSaving(false)

    if (result.success) {
      reset()
      router.replace('/(tabs)/quotes')
    } else {
      Alert.alert('Błąd', result.error || 'Nie udało się utworzyć wyceny')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepClient />
      case 1: return <StepGroups />
      case 2: return <StepServices />
      case 3: return <StepMaterials />
      case 4: return <StepPreview onSubmit={handleSubmit} isLoading={isSaving} />
      default: return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true // Client is optional
      case 1: return draft.groups.length > 0
      case 2: return draft.groups.some(g => g.services.length > 0)
      case 3: return true // Materials are optional
      case 4: return false // Preview has its own submit button
      default: return false
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text.heading} />
          </Pressable>
          <Text style={styles.headerTitle}>Nowa wycena</Text>
          <Pressable onPress={handleSaveDraft} hitSlop={8}>
            <Text style={styles.saveButton}>Zapisz</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, index) => (
          <Pressable
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
            onPress={() => index < currentStep && setStep(index)}
          />
        ))}
      </View>

      {/* Step title + total */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
        {showTotal && (
          <Text style={styles.totalPreview}>{total.toFixed(2)} zł</Text>
        )}
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {renderStep()}
      </View>

      {/* Footer navigation */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={styles.cancelButton}
          onPress={currentStep === 0 ? handleCancel : handleBack}
        >
          <Text style={styles.cancelButtonText}>
            {currentStep === 0 ? 'Anuluj' : 'Wstecz'}
          </Text>
        </Pressable>

        {currentStep < STEPS.length - 1 && (
          <Pressable
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceed() && styles.nextButtonTextDisabled,
            ]}>
              Dalej
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={canProceed() ? colors.white : colors.text.muted}
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  saveButton: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.surface,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
  },
  progressDotCompleted: {
    width: 8,
    backgroundColor: colors.primary.DEFAULT,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
  },
  totalPreview: {
    fontSize: 15,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
    ...shadows.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.white,
  },
  nextButtonTextDisabled: {
    color: colors.text.muted,
  },
})
