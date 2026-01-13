import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'

// Step components (will be created separately)
import { StepClient } from '../../components/quote/StepClient'
import { StepGroups } from '../../components/quote/StepGroups'
import { StepServices } from '../../components/quote/StepServices'
import { StepMaterials } from '../../components/quote/StepMaterials'
import { StepPreview } from '../../components/quote/StepPreview'

const STEPS = [
  { key: 'client', title: 'Klient', icon: 'person-outline' },
  { key: 'groups', title: 'Pokoje', icon: 'cube-outline' },
  { key: 'services', title: 'Usługi', icon: 'construct-outline' },
  { key: 'materials', title: 'Materiały', icon: 'cart-outline' },
  { key: 'preview', title: 'Podgląd', icon: 'document-outline' },
]

export default function QuoteCreateScreen() {
  const { draft, currentStep, setStep, reset, getTotal } = useQuoteStore()
  const utils = trpc.useUtils()

  const createQuote = trpc.quotes.create.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate()
      utils.subscriptions.status.invalidate()
      reset()
      router.replace('/(tabs)/quotes')
    },
    onError: (error: Error) => {
      Alert.alert('Błąd', error.message)
    },
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1)
    } else {
      Alert.alert('Anuluj', 'Czy na pewno chcesz anulować tworzenie wyceny?', [
        { text: 'Nie', style: 'cancel' },
        { text: 'Tak', onPress: () => { reset(); router.back() } },
      ])
    }
  }

  const handleSubmit = () => {
    if (!draft.clientId) {
      Alert.alert('Błąd', 'Wybierz klienta')
      return
    }
    if (draft.groups.length === 0) {
      Alert.alert('Błąd', 'Dodaj co najmniej jedną grupę')
      return
    }

    createQuote.mutate({
      clientId: draft.clientId,
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
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepClient onNext={handleNext} />
      case 1: return <StepGroups onNext={handleNext} />
      case 2: return <StepServices onNext={handleNext} />
      case 3: return <StepMaterials onNext={handleNext} />
      case 4: return <StepPreview onSubmit={handleSubmit} isLoading={createQuote.isPending} />
      default: return null
    }
  }

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <Pressable
            key={step.key}
            style={[
              styles.progressStep,
              index <= currentStep && styles.progressStepActive,
            ]}
            onPress={() => index < currentStep && setStep(index)}
          >
            <Ionicons
              name={step.icon as any}
              size={20}
              color={index <= currentStep ? '#2563eb' : '#9ca3af'}
            />
          </Pressable>
        ))}
      </View>

      {/* Step title */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
        <Text style={styles.totalPreview}>{getTotal().toFixed(2)} zł</Text>
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {renderStep()}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backButtonText}>
            {currentStep === 0 ? 'Anuluj' : 'Wstecz'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  progressStepActive: { backgroundColor: '#dbeafe' },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stepTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  totalPreview: { fontSize: 18, fontWeight: '700', color: '#2563eb' },
  content: { flex: 1 },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButtonText: { fontSize: 16, color: '#374151' },
})
