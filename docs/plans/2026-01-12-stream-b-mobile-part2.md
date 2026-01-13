# Stream B: Mobile Part 2 (B4-B8) - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dokończenie aplikacji mobilnej - lista wycen, kreator wycen, ustawienia, PDF/share, offline mode.

**Architecture:** Kontynuacja Stream B. Kreator wycen jako multi-step wizard z Zustand store. PDF przez react-native-pdf. Offline przez expo-sqlite.

**Tech Stack:** Expo, React Native, expo-router, tRPC, Zustand, expo-sqlite, expo-sharing

**Branch:** `feat/mobile-foundation`

**Prerequisites:** Stream B Part 1 ukończony (B1-B3)

---

## B4: Quotes Module - Lista

### Task B4.1: Quotes layout i lista

**Files:**
- Create: `apps/mobile/app/(tabs)/quotes/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/quotes/index.tsx`

**Step 1: Utwórz quotes/_layout.tsx**

Create `apps/mobile/app/(tabs)/quotes/_layout.tsx`:
```typescript
import { Stack } from 'expo-router'

export default function QuotesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Wyceny' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły wyceny' }} />
    </Stack>
  )
}
```

**Step 2: Utwórz quotes/index.tsx**

Create `apps/mobile/app/(tabs)/quotes/index.tsx`:
```typescript
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'

const STATUS_CONFIG = {
  draft: { label: 'Szkic', color: '#6b7280', bg: '#f3f4f6' },
  sent: { label: 'Wysłana', color: '#2563eb', bg: '#dbeafe' },
  accepted: { label: 'Zaakceptowana', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Odrzucona', color: '#dc2626', bg: '#fee2e2' },
}

export default function QuotesListScreen() {
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
          return (
            <Link href={`/(tabs)/quotes/${item.id}`} asChild>
              <Pressable style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteNumber}>#{item.number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.quoteDate}>{formatDate(item.createdAt)}</Text>
                <View style={styles.quoteFooter}>
                  <Text style={styles.quoteTotal}>{item.total} zł</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            </Link>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Ładowanie...' : 'Brak wycen'}
            </Text>
          </View>
        }
        contentContainerStyle={quotes?.length === 0 ? styles.emptyList : styles.list}
      />

      <Link href="/quote/create" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  quoteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteNumber: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  quoteDate: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  quoteTotal: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
  emptyList: { flex: 1, justifyContent: 'center' },
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
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/quotes/
git commit -m "feat(mobile): add quotes list screen with status badges"
```

---

### Task B4.2: Quote details screen

**Files:**
- Create: `apps/mobile/app/(tabs)/quotes/[id].tsx`

**Step 1: Utwórz quotes/[id].tsx**

Create `apps/mobile/app/(tabs)/quotes/[id].tsx`:
```typescript
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quote, isLoading } = trpc.quotes.byId.useQuery({ id: id! })
  const utils = trpc.useUtils()

  const deleteQuote = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate()
      router.back()
    },
  })

  const handleDelete = () => {
    Alert.alert('Usuń wycenę', 'Czy na pewno chcesz usunąć tę wycenę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => deleteQuote.mutate({ id: id! }),
      },
    ])
  }

  if (isLoading || !quote) {
    return (
      <View style={styles.loading}>
        <Text>Ładowanie...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.quoteNumber}>Wycena #{quote.number}</Text>
        <Text style={styles.total}>{quote.total} zł</Text>
      </View>

      {/* Notes Before */}
      {quote.notesBefore && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki (przed)</Text>
          <Text style={styles.notes}>{quote.notesBefore}</Text>
        </View>
      )}

      {/* Groups */}
      {quote.groups?.map((group) => (
        <View key={group.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.floorM2 && (
            <Text style={styles.groupM2}>{group.floorM2} m²</Text>
          )}
          {group.services?.map((service) => (
            <View key={service.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceQty}>
                  {service.quantity} {service.unit} × {service.pricePerUnit} zł
                </Text>
              </View>
              <Text style={styles.serviceTotal}>{service.total} zł</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Materials */}
      {quote.materials && quote.materials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiały</Text>
          {quote.materials.map((material) => (
            <View key={material.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{material.name}</Text>
                <Text style={styles.serviceQty}>
                  {material.quantity} {material.unit} × {material.pricePerUnit} zł
                </Text>
              </View>
              <Text style={styles.serviceTotal}>{material.total} zł</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes After */}
      {quote.notesAfter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki (po)</Text>
          <Text style={styles.notes}>{quote.notesAfter}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color="white" />
          <Text style={styles.shareButtonText}>Udostępnij</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quoteNumber: { fontSize: 16, color: '#6b7280' },
  total: { fontSize: 36, fontWeight: '700', color: '#2563eb', marginTop: 8 },
  section: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  notes: { fontSize: 16, color: '#1f2937', lineHeight: 24 },
  groupCard: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  groupM2: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, color: '#1f2937' },
  serviceQty: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  serviceTotal: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
})
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/quotes/
git commit -m "feat(mobile): add quote detail screen"
```

---

## B5: Quotes Module - Kreator

### Task B5.1: Quote store (Zustand)

**Files:**
- Create: `apps/mobile/stores/quoteStore.ts`

**Step 1: Utwórz quoteStore.ts**

Create `apps/mobile/stores/quoteStore.ts`:
```typescript
import { create } from 'zustand'
import type { QuantitySource } from '@majsterio/shared'

interface QuoteService {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  quantitySource: QuantitySource
}

interface QuoteGroup {
  id: string
  name: string
  length?: number
  width?: number
  height?: number
  manualM2?: number
  services: QuoteService[]
}

interface QuoteMaterial {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
}

interface QuoteDraft {
  clientId: string | null
  groups: QuoteGroup[]
  materials: QuoteMaterial[]
  notesBefore: string
  notesAfter: string
  disclaimer: string | null
  showDisclaimer: boolean
}

interface QuoteStore {
  draft: QuoteDraft
  currentStep: number

  // Actions
  setClientId: (clientId: string) => void
  addGroup: (group: Omit<QuoteGroup, 'id'>) => void
  updateGroup: (id: string, data: Partial<QuoteGroup>) => void
  removeGroup: (id: string) => void
  addServiceToGroup: (groupId: string, service: Omit<QuoteService, 'id'>) => void
  updateService: (groupId: string, serviceId: string, data: Partial<QuoteService>) => void
  removeService: (groupId: string, serviceId: string) => void
  addMaterial: (material: Omit<QuoteMaterial, 'id'>) => void
  removeMaterial: (id: string) => void
  setNotes: (notesBefore: string, notesAfter: string) => void
  setDisclaimer: (disclaimer: string | null, show: boolean) => void
  setStep: (step: number) => void
  reset: () => void

  // Computed
  calculateGroupM2: (group: QuoteGroup) => { walls: number; ceiling: number; floor: number }
  getTotal: () => number
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const initialDraft: QuoteDraft = {
  clientId: null,
  groups: [],
  materials: [],
  notesBefore: '',
  notesAfter: '',
  disclaimer: null,
  showDisclaimer: true,
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  draft: initialDraft,
  currentStep: 0,

  setClientId: (clientId) => set((state) => ({
    draft: { ...state.draft, clientId }
  })),

  addGroup: (group) => set((state) => ({
    draft: {
      ...state.draft,
      groups: [...state.draft.groups, { ...group, id: generateId() }]
    }
  })),

  updateGroup: (id, data) => set((state) => ({
    draft: {
      ...state.draft,
      groups: state.draft.groups.map((g) =>
        g.id === id ? { ...g, ...data } : g
      )
    }
  })),

  removeGroup: (id) => set((state) => ({
    draft: {
      ...state.draft,
      groups: state.draft.groups.filter((g) => g.id !== id)
    }
  })),

  addServiceToGroup: (groupId, service) => set((state) => ({
    draft: {
      ...state.draft,
      groups: state.draft.groups.map((g) =>
        g.id === groupId
          ? { ...g, services: [...g.services, { ...service, id: generateId() }] }
          : g
      )
    }
  })),

  updateService: (groupId, serviceId, data) => set((state) => ({
    draft: {
      ...state.draft,
      groups: state.draft.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              services: g.services.map((s) =>
                s.id === serviceId ? { ...s, ...data } : s
              )
            }
          : g
      )
    }
  })),

  removeService: (groupId, serviceId) => set((state) => ({
    draft: {
      ...state.draft,
      groups: state.draft.groups.map((g) =>
        g.id === groupId
          ? { ...g, services: g.services.filter((s) => s.id !== serviceId) }
          : g
      )
    }
  })),

  addMaterial: (material) => set((state) => ({
    draft: {
      ...state.draft,
      materials: [...state.draft.materials, { ...material, id: generateId() }]
    }
  })),

  removeMaterial: (id) => set((state) => ({
    draft: {
      ...state.draft,
      materials: state.draft.materials.filter((m) => m.id !== id)
    }
  })),

  setNotes: (notesBefore, notesAfter) => set((state) => ({
    draft: { ...state.draft, notesBefore, notesAfter }
  })),

  setDisclaimer: (disclaimer, show) => set((state) => ({
    draft: { ...state.draft, disclaimer, showDisclaimer: show }
  })),

  setStep: (step) => set({ currentStep: step }),

  reset: () => set({ draft: initialDraft, currentStep: 0 }),

  calculateGroupM2: (group) => {
    const { length, width, height } = group
    if (!length || !width) return { walls: 0, ceiling: 0, floor: 0 }

    const floor = length * width
    const ceiling = floor
    const walls = height ? 2 * (length + width) * height : 0

    return { walls, ceiling, floor }
  },

  getTotal: () => {
    const { draft, calculateGroupM2 } = get()
    let total = 0

    for (const group of draft.groups) {
      const m2 = calculateGroupM2(group)
      for (const service of group.services) {
        let qty = service.quantity
        if (service.quantitySource === 'walls') qty = m2.walls || service.quantity
        if (service.quantitySource === 'ceiling') qty = m2.ceiling || service.quantity
        if (service.quantitySource === 'floor') qty = m2.floor || service.quantity
        if (service.quantitySource === 'walls_ceiling') qty = (m2.walls + m2.ceiling) || service.quantity
        total += qty * service.pricePerUnit
      }
    }

    for (const material of draft.materials) {
      total += material.quantity * material.pricePerUnit
    }

    return Math.round(total * 100) / 100
  },
}))
```

**Step 2: Commit**

```bash
git add apps/mobile/stores/quoteStore.ts
git commit -m "feat(mobile): add quote draft store with m² calculations"
```

---

### Task B5.2: Quote creator - main screen

**Files:**
- Create: `apps/mobile/app/quote/create.tsx`

**Step 1: Utwórz quote/create.tsx**

Create `apps/mobile/app/quote/create.tsx`:
```typescript
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
    onError: (error) => {
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
```

**Step 2: Commit**

```bash
git add apps/mobile/app/quote/
git commit -m "feat(mobile): add quote creator main screen with steps"
```

---

### Task B5.3: Step 1 - Client selection

**Files:**
- Create: `apps/mobile/components/quote/StepClient.tsx`

**Step 1: Utwórz components/quote/StepClient.tsx**

```bash
mkdir -p apps/mobile/components/quote
```

Create `apps/mobile/components/quote/StepClient.tsx`:
```typescript
import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { useQuoteStore } from '../../stores/quoteStore'

interface Props {
  onNext: () => void
}

export function StepClient({ onNext }: Props) {
  const [search, setSearch] = useState('')
  const { data: clients } = trpc.clients.list.useQuery()
  const { draft, setClientId } = useQuoteStore()

  const filteredClients = clients?.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  }) ?? []

  const handleSelect = (clientId: string) => {
    setClientId(clientId)
    onNext()
  }

  const selectedClient = clients?.find((c) => c.id === draft.clientId)

  return (
    <View style={styles.container}>
      {/* Selected */}
      {selectedClient && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>Wybrany klient:</Text>
          <Text style={styles.selectedName}>
            {selectedClient.firstName} {selectedClient.lastName}
          </Text>
          <Pressable style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Dalej</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj klienta..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.clientCard,
              item.id === draft.clientId && styles.clientCardSelected,
            ]}
            onPress={() => handleSelect(item.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>
                {item.firstName} {item.lastName}
              </Text>
              {item.siteAddress && (
                <Text style={styles.clientAddress}>{item.siteAddress}</Text>
              )}
            </View>
            {item.id === draft.clientId && (
              <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
            )}
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectedCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  selectedLabel: { fontSize: 12, color: '#1e40af' },
  selectedName: { fontSize: 18, fontWeight: '600', color: '#1e40af', marginTop: 4 },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  list: { padding: 16 },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  clientCardSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  clientAddress: { fontSize: 14, color: '#6b7280', marginTop: 2 },
})
```

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/
git commit -m "feat(mobile): add client selection step"
```

---

### Task B5.4: Step 2 - Groups (rooms/sections)

**Files:**
- Create: `apps/mobile/components/quote/StepGroups.tsx`

**Step 1: Utwórz StepGroups.tsx**

Create `apps/mobile/components/quote/StepGroups.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/StepGroups.tsx
git commit -m "feat(mobile): add groups step with dimension modes"
```

---

### Task B5.5: Step 3 - Services

**Files:**
- Create: `apps/mobile/components/quote/StepServices.tsx`

**Step 1: Utwórz StepServices.tsx**

Create `apps/mobile/components/quote/StepServices.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/StepServices.tsx
git commit -m "feat(mobile): add services step with templates and quantity sources"
```

---

### Task B5.6: Step 4 - Materials

**Files:**
- Create: `apps/mobile/components/quote/StepMaterials.tsx`

**Step 1: Utwórz StepMaterials.tsx**

Create `apps/mobile/components/quote/StepMaterials.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/StepMaterials.tsx
git commit -m "feat(mobile): add materials step"
```

---

### Task B5.7: Step 5 - Preview

**Files:**
- Create: `apps/mobile/components/quote/StepPreview.tsx`

**Step 1: Utwórz StepPreview.tsx**

Create `apps/mobile/components/quote/StepPreview.tsx`:
```typescript
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Switch } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'
import { DEFAULT_DISCLAIMER } from '@majsterio/shared'

interface Props {
  onSubmit: () => void
  isLoading: boolean
}

export function StepPreview({ onSubmit, isLoading }: Props) {
  const { draft, setNotes, setDisclaimer, getTotal, calculateGroupM2 } = useQuoteStore()
  const { data: clients } = trpc.clients.list.useQuery()

  const [notesBefore, setNotesBefore] = useState(draft.notesBefore)
  const [notesAfter, setNotesAfter] = useState(draft.notesAfter)
  const [showDisclaimer, setShowDisclaimer] = useState(draft.showDisclaimer)

  const client = clients?.find((c) => c.id === draft.clientId)
  const total = getTotal()

  const handleSubmit = () => {
    setNotes(notesBefore, notesAfter)
    setDisclaimer(DEFAULT_DISCLAIMER, showDisclaimer)
    onSubmit()
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.previewLabel}>Podgląd wyceny</Text>
        <Text style={styles.total}>{total.toFixed(2)} zł</Text>
      </View>

      {/* Client */}
      {client && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klient</Text>
          <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
          {client.siteAddress && (
            <Text style={styles.clientAddress}>{client.siteAddress}</Text>
          )}
        </View>
      )}

      {/* Notes Before */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notatki (przed wycenką)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="np. Wycena obejmuje..."
          value={notesBefore}
          onChangeText={setNotesBefore}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Groups Summary */}
      {draft.groups.map((group) => {
        const m2 = calculateGroupM2(group)
        const groupTotal = group.services.reduce((sum, s) => {
          let qty = s.quantity
          if (s.quantitySource === 'floor' && m2.floor) qty = m2.floor
          if (s.quantitySource === 'walls' && m2.walls) qty = m2.walls
          if (s.quantitySource === 'ceiling' && m2.ceiling) qty = m2.ceiling
          if (s.quantitySource === 'walls_ceiling') qty = (m2.walls + m2.ceiling) || s.quantity
          return sum + qty * s.pricePerUnit
        }, 0)

        return (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupTotal}>{groupTotal.toFixed(0)} zł</Text>
            </View>
            {group.services.map((service) => (
              <View key={service.id} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  {service.quantity} {service.unit} × {service.pricePerUnit} zł
                </Text>
              </View>
            ))}
          </View>
        )
      })}

      {/* Materials Summary */}
      {draft.materials.length > 0 && (
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupName}>Materiały</Text>
            <Text style={styles.groupTotal}>
              {draft.materials.reduce((s, m) => s + m.quantity * m.pricePerUnit, 0).toFixed(0)} zł
            </Text>
          </View>
          {draft.materials.map((material) => (
            <View key={material.id} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{material.name}</Text>
              <Text style={styles.servicePrice}>
                {material.quantity} {material.unit} × {material.pricePerUnit} zł
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes After */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notatki (po wycenke)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="np. Termin realizacji..."
          value={notesAfter}
          onChangeText={setNotesAfter}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerSection}>
        <View style={styles.disclaimerHeader}>
          <Text style={styles.sectionTitle}>Warunki</Text>
          <Switch
            value={showDisclaimer}
            onValueChange={setShowDisclaimer}
            trackColor={{ true: '#2563eb' }}
          />
        </View>
        {showDisclaimer && (
          <Text style={styles.disclaimerText}>{DEFAULT_DISCLAIMER}</Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Zapisywanie...' : 'Utwórz wycenę'}
        </Text>
      </Pressable>

      <View style={styles.spacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#2563eb',
    padding: 24,
    alignItems: 'center',
  },
  previewLabel: { fontSize: 14, color: '#bfdbfe' },
  total: { fontSize: 42, fontWeight: '700', color: 'white', marginTop: 8 },
  section: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  clientName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  clientAddress: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  groupCard: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  groupName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  groupTotal: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  serviceName: { fontSize: 14, color: '#374151' },
  servicePrice: { fontSize: 14, color: '#6b7280' },
  disclaimerSection: { backgroundColor: 'white', padding: 16, marginTop: 12 },
  disclaimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disclaimerText: { fontSize: 12, color: '#6b7280', marginTop: 12, lineHeight: 18 },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 18,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  spacer: { height: 32 },
})
```

**Step 2: Utwórz barrel export**

Create `apps/mobile/components/quote/index.ts`:
```typescript
export { StepClient } from './StepClient'
export { StepGroups } from './StepGroups'
export { StepServices } from './StepServices'
export { StepMaterials } from './StepMaterials'
export { StepPreview } from './StepPreview'
```

**Step 3: Commit**

```bash
git add apps/mobile/components/quote/
git commit -m "feat(mobile): add preview step and quote components barrel"
```

---

## B6: Settings Module

### Task B6.1: Settings layout i główny ekran

**Files:**
- Create: `apps/mobile/app/(tabs)/settings/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/settings/index.tsx`

**Step 1: Utwórz settings/_layout.tsx**

Create `apps/mobile/app/(tabs)/settings/_layout.tsx`:
```typescript
import { Stack } from 'expo-router'

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="templates" options={{ title: 'Szablony usług' }} />
      <Stack.Screen name="materials" options={{ title: 'Szablony materiałów' }} />
      <Stack.Screen name="disclaimer" options={{ title: 'Warunki wyceny' }} />
      <Stack.Screen name="subscription" options={{ title: 'Subskrypcja' }} />
    </Stack>
  )
}
```

**Step 2: Utwórz settings/index.tsx**

Create `apps/mobile/app/(tabs)/settings/index.tsx`:
```typescript
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../../stores/authStore'
import { trpc } from '../../../lib/trpc'

export default function SettingsScreen() {
  const { user, logout } = useAuthStore()
  const { data: subscription } = trpc.subscriptions.status.useQuery()

  const handleLogout = () => {
    Alert.alert('Wyloguj', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: logout },
    ])
  }

  const tierLabel = {
    free: 'Darmowy',
    pro: 'Pro',
    pro_ai: 'Pro AI',
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Użytkownik'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Subscription */}
      <Link href="/(tabs)/settings/subscription" asChild>
        <Pressable style={styles.subscriptionCard}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionLabel}>Plan</Text>
            <Text style={styles.subscriptionTier}>
              {tierLabel[subscription?.tier as keyof typeof tierLabel] || 'Darmowy'}
            </Text>
          </View>
          <View style={styles.subscriptionStats}>
            <Text style={styles.statsNumber}>
              {subscription?.quotesThisMonth || 0}
            </Text>
            <Text style={styles.statsLabel}>
              / {subscription?.limits.quotesPerMonth === Infinity ? '∞' : subscription?.limits.quotesPerMonth} wycen
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>
      </Link>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szablony</Text>
        
        <Link href="/(tabs)/settings/templates" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="construct-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Szablony usług</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/materials" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="cart-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Szablony materiałów</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/disclaimer" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Warunki wyceny</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </Pressable>
      </View>

      {/* Version */}
      <Text style={styles.version}>Majsterio v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '600', color: '#2563eb' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  subscriptionInfo: { flex: 1 },
  subscriptionLabel: { fontSize: 12, color: '#bfdbfe' },
  subscriptionTier: { fontSize: 18, fontWeight: '600', color: 'white', marginTop: 2 },
  subscriptionStats: { alignItems: 'flex-end' },
  statsNumber: { fontSize: 24, fontWeight: '700', color: 'white' },
  statsLabel: { fontSize: 12, color: '#bfdbfe' },
  section: { backgroundColor: 'white', marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: { flex: 1, fontSize: 16, color: '#374151' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutText: { fontSize: 16, color: '#dc2626' },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 24,
  },
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/settings/
git commit -m "feat(mobile): add settings screen with profile and menu"
```

---

### Task B6.2: Service templates screen

**Files:**
- Create: `apps/mobile/app/(tabs)/settings/templates.tsx`

**Step 1: Utwórz settings/templates.tsx**

Create `apps/mobile/app/(tabs)/settings/templates.tsx`:
```typescript
import { useState } from 'react'
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Modal, ScrollView, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import type { QuantitySource } from '@majsterio/shared'

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
                {item.category && ` • ${item.category}`}
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
})
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/settings/templates.tsx
git commit -m "feat(mobile): add service templates management"
```

---

## B7: PDF & Share

### Task B7.1: PDF service

**Files:**
- Create: `apps/mobile/services/pdf.ts`
- Modify: `apps/mobile/package.json` (add expo-print, expo-sharing)

**Step 1: Zainstaluj zależności**

```bash
cd apps/mobile && npx expo install expo-print expo-sharing expo-file-system
```

**Step 2: Utwórz services/pdf.ts**

```bash
mkdir -p apps/mobile/services
```

Create `apps/mobile/services/pdf.ts`:
```typescript
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

interface QuoteForPdf {
  number: number
  client: {
    firstName: string
    lastName: string
    siteAddress?: string | null
  }
  groups: {
    name: string
    services: {
      name: string
      quantity: number
      unit: string
      pricePerUnit: number
      total: number
    }[]
  }[]
  materials: {
    name: string
    quantity: number
    unit: string
    pricePerUnit: number
    total: number
  }[]
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  total: number
  createdAt: Date
}

export async function generateQuotePdf(quote: QuoteForPdf): Promise<string> {
  const date = new Date(quote.createdAt).toLocaleDateString('pl-PL')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #2563eb; }
        .header .number { font-size: 18px; color: #6b7280; margin-top: 8px; }
        .client { margin-bottom: 24px; }
        .client-label { font-size: 12px; color: #6b7280; }
        .client-name { font-size: 18px; font-weight: 600; }
        .client-address { font-size: 14px; color: #6b7280; }
        .date { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .notes { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .notes-title { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .group { margin-bottom: 24px; }
        .group-name { font-size: 16px; font-weight: 600; background: #f3f4f6; padding: 12px; border-radius: 6px; }
        .service { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .service-name { flex: 1; }
        .service-qty { color: #6b7280; margin-right: 16px; }
        .service-total { font-weight: 600; }
        .materials-section { margin-top: 24px; }
        .total-section { margin-top: 32px; padding: 20px; background: #2563eb; color: white; border-radius: 8px; text-align: right; }
        .total-label { font-size: 14px; }
        .total-amount { font-size: 32px; font-weight: 700; }
        .disclaimer { margin-top: 32px; padding: 16px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WYCENA</h1>
        <div class="number">#${quote.number}</div>
      </div>

      <div class="client">
        <div class="client-label">Klient</div>
        <div class="client-name">${quote.client.firstName} ${quote.client.lastName}</div>
        ${quote.client.siteAddress ? `<div class="client-address">${quote.client.siteAddress}</div>` : ''}
        <div class="date">Data: ${date}</div>
      </div>

      ${quote.notesBefore ? `
        <div class="notes">
          <div class="notes-title">NOTATKI</div>
          <div>${quote.notesBefore}</div>
        </div>
      ` : ''}

      ${quote.groups.map((group) => `
        <div class="group">
          <div class="group-name">${group.name}</div>
          ${group.services.map((s) => `
            <div class="service">
              <span class="service-name">${s.name}</span>
              <span class="service-qty">${s.quantity} ${s.unit} × ${s.pricePerUnit} zł</span>
              <span class="service-total">${s.total.toFixed(2)} zł</span>
            </div>
          `).join('')}
        </div>
      `).join('')}

      ${quote.materials.length > 0 ? `
        <div class="materials-section">
          <div class="group-name">Materiały</div>
          ${quote.materials.map((m) => `
            <div class="service">
              <span class="service-name">${m.name}</span>
              <span class="service-qty">${m.quantity} ${m.unit} × ${m.pricePerUnit} zł</span>
              <span class="service-total">${m.total.toFixed(2)} zł</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${quote.notesAfter ? `
        <div class="notes">
          <div class="notes-title">UWAGI</div>
          <div>${quote.notesAfter}</div>
        </div>
      ` : ''}

      <div class="total-section">
        <div class="total-label">SUMA</div>
        <div class="total-amount">${quote.total.toFixed(2)} zł</div>
      </div>

      ${quote.showDisclaimer && quote.disclaimer ? `
        <div class="disclaimer">
          <strong>WARUNKI:</strong> ${quote.disclaimer}
        </div>
      ` : ''}

      <div class="footer">
        Wygenerowano w aplikacji Majsterio
      </div>
    </body>
    </html>
  `

  const { uri } = await Print.printToFileAsync({ html })
  return uri
}

export async function shareQuotePdf(pdfUri: string, quoteNumber: number): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync()
  if (!isAvailable) {
    throw new Error('Udostępnianie nie jest dostępne na tym urządzeniu')
  }

  // Copy to a proper filename
  const filename = `wycena-${quoteNumber}.pdf`
  const newUri = `${FileSystem.cacheDirectory}${filename}`
  await FileSystem.copyAsync({ from: pdfUri, to: newUri })

  await Sharing.shareAsync(newUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Wycena #${quoteNumber}`,
  })
}
```

**Step 3: Commit**

```bash
git add apps/mobile/services/ apps/mobile/package.json
git commit -m "feat(mobile): add PDF generation and sharing service"
```

---

### Task B7.2: Integrate PDF sharing in quote detail

**Files:**
- Modify: `apps/mobile/app/(tabs)/quotes/[id].tsx`

**Step 1: Zaktualizuj [id].tsx**

Add to imports:
```typescript
import { generateQuotePdf, shareQuotePdf } from '../../../services/pdf'
```

Update share button handler:
```typescript
const handleShare = async () => {
  if (!quote) return
  
  try {
    const client = clients?.find((c) => c.id === quote.clientId)
    if (!client) {
      Alert.alert('Błąd', 'Nie znaleziono klienta')
      return
    }

    const pdfUri = await generateQuotePdf({
      number: quote.number,
      client: {
        firstName: client.firstName,
        lastName: client.lastName,
        siteAddress: client.siteAddress,
      },
      groups: quote.groups?.map((g) => ({
        name: g.name,
        services: g.services?.map((s) => ({
          name: s.name,
          quantity: parseFloat(s.quantity),
          unit: s.unit,
          pricePerUnit: parseFloat(s.pricePerUnit),
          total: parseFloat(s.total),
        })) ?? [],
      })) ?? [],
      materials: quote.materials?.map((m) => ({
        name: m.name,
        quantity: parseFloat(m.quantity),
        unit: m.unit,
        pricePerUnit: parseFloat(m.pricePerUnit),
        total: parseFloat(m.total),
      })) ?? [],
      notesBefore: quote.notesBefore,
      notesAfter: quote.notesAfter,
      disclaimer: quote.disclaimer,
      showDisclaimer: quote.showDisclaimer,
      total: parseFloat(quote.total),
      createdAt: quote.createdAt,
    })

    await shareQuotePdf(pdfUri, quote.number)
  } catch (error) {
    Alert.alert('Błąd', error instanceof Error ? error.message : 'Nie udało się udostępnić')
  }
}
```

Update share button:
```typescript
<Pressable style={styles.shareButton} onPress={handleShare}>
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/quotes/
git commit -m "feat(mobile): integrate PDF sharing in quote detail"
```

---

## B8: Offline Mode

### Task B8.1: SQLite schema dla offline

**Files:**
- Create: `apps/mobile/db/schema.ts`
- Create: `apps/mobile/db/index.ts`

**Step 1: Utwórz db/schema.ts**

Create `apps/mobile/db/schema.ts`:
```typescript
// SQLite schema for offline storage
export const SCHEMA_VERSION = 1

export const CREATE_TABLES_SQL = `
  -- Offline queue for pending syncs
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retries INTEGER DEFAULT 0
  );

  -- Cached quotes
  CREATE TABLE IF NOT EXISTS quotes_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    synced_at INTEGER,
    updated_at INTEGER NOT NULL
  );

  -- Cached clients
  CREATE TABLE IF NOT EXISTS clients_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    synced_at INTEGER,
    updated_at INTEGER NOT NULL
  );

  -- Schema version
  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('version', '${SCHEMA_VERSION}');
`
```

**Step 2: Utwórz db/index.ts**

Create `apps/mobile/db/index.ts`:
```typescript
import * as SQLite from 'expo-sqlite'
import { CREATE_TABLES_SQL } from './schema'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync('majsterio.db')
  await db.execAsync(CREATE_TABLES_SQL)
  return db
}

// Sync queue operations
export async function addToSyncQueue(
  type: 'quote' | 'client',
  action: 'create' | 'update' | 'delete',
  payload: object
): Promise<void> {
  const database = await getDatabase()
  const id = Math.random().toString(36).substring(2, 9)

  await database.runAsync(
    `INSERT INTO sync_queue (id, type, action, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, type, action, JSON.stringify(payload), Date.now()]
  )
}

export async function getSyncQueue(): Promise<Array<{
  id: string
  type: string
  action: string
  payload: object
  createdAt: number
  retries: number
}>> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{
    id: string
    type: string
    action: string
    payload: string
    created_at: number
    retries: number
  }>('SELECT * FROM sync_queue ORDER BY created_at ASC')

  return result.map((row) => ({
    id: row.id,
    type: row.type,
    action: row.action,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    retries: row.retries,
  }))
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = await getDatabase()
  await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id])
}

export async function incrementRetry(id: string): Promise<void> {
  const database = await getDatabase()
  await database.runAsync(
    'UPDATE sync_queue SET retries = retries + 1 WHERE id = ?',
    [id]
  )
}

// Cache operations
export async function cacheQuotes(userId: string, quotes: object[]): Promise<void> {
  const database = await getDatabase()
  const now = Date.now()

  for (const quote of quotes) {
    await database.runAsync(
      `INSERT OR REPLACE INTO quotes_cache (id, user_id, data, synced_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [(quote as any).id, userId, JSON.stringify(quote), now, now]
    )
  }
}

export async function getCachedQuotes(userId: string): Promise<object[]> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{ data: string }>(
    'SELECT data FROM quotes_cache WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  )
  return result.map((row) => JSON.parse(row.data))
}

export async function cacheClients(userId: string, clients: object[]): Promise<void> {
  const database = await getDatabase()
  const now = Date.now()

  for (const client of clients) {
    await database.runAsync(
      `INSERT OR REPLACE INTO clients_cache (id, user_id, data, synced_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [(client as any).id, userId, JSON.stringify(client), now, now]
    )
  }
}

export async function getCachedClients(userId: string): Promise<object[]> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{ data: string }>(
    'SELECT data FROM clients_cache WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  )
  return result.map((row) => JSON.parse(row.data))
}
```

**Step 3: Commit**

```bash
git add apps/mobile/db/
git commit -m "feat(mobile): add SQLite schema and offline database operations"
```

---

### Task B8.2: Sync store

**Files:**
- Create: `apps/mobile/stores/syncStore.ts`

**Step 1: Utwórz syncStore.ts**

Create `apps/mobile/stores/syncStore.ts`:
```typescript
import { create } from 'zustand'
import NetInfo from '@react-native-community/netinfo'
import { getSyncQueue, removeFromSyncQueue, incrementRetry } from '../db'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncAt: Date | null

  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  updatePendingCount: () => Promise<void>
  processQueue: (apiClient: any) => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,

  setOnline: (isOnline) => set({ isOnline }),

  setSyncing: (isSyncing) => set({ isSyncing }),

  updatePendingCount: async () => {
    const queue = await getSyncQueue()
    set({ pendingCount: queue.length })
  },

  processQueue: async (apiClient) => {
    const { isOnline, isSyncing } = get()
    if (!isOnline || isSyncing) return

    set({ isSyncing: true })

    try {
      const queue = await getSyncQueue()

      for (const item of queue) {
        if (item.retries >= 3) {
          // Skip items that failed too many times
          continue
        }

        try {
          // Process based on type and action
          if (item.type === 'quote') {
            if (item.action === 'create') {
              await apiClient.quotes.create.mutate(item.payload)
            } else if (item.action === 'delete') {
              await apiClient.quotes.delete.mutate(item.payload)
            }
          } else if (item.type === 'client') {
            if (item.action === 'create') {
              await apiClient.clients.create.mutate(item.payload)
            } else if (item.action === 'update') {
              await apiClient.clients.update.mutate(item.payload)
            } else if (item.action === 'delete') {
              await apiClient.clients.delete.mutate(item.payload)
            }
          }

          await removeFromSyncQueue(item.id)
        } catch (error) {
          await incrementRetry(item.id)
        }
      }

      set({ lastSyncAt: new Date() })
    } finally {
      set({ isSyncing: false })
      await get().updatePendingCount()
    }
  },
}))

// Initialize network listener
export function initNetworkListener() {
  return NetInfo.addEventListener((state) => {
    useSyncStore.getState().setOnline(state.isConnected ?? false)
  })
}
```

**Step 2: Dodaj zależność**

```bash
cd apps/mobile && npx expo install @react-native-community/netinfo
```

**Step 3: Commit**

```bash
git add apps/mobile/stores/syncStore.ts apps/mobile/package.json
git commit -m "feat(mobile): add sync store with network listener"
```

---

### Task B8.3: Offline indicator component

**Files:**
- Create: `apps/mobile/components/ui/OfflineIndicator.tsx`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Utwórz OfflineIndicator.tsx**

Create `apps/mobile/components/ui/OfflineIndicator.tsx`:
```typescript
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSyncStore } from '../../stores/syncStore'

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount } = useSyncStore()
  const translateY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isOnline])

  if (isOnline && pendingCount === 0) return null

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {!isOnline ? (
        <>
          <Ionicons name="cloud-offline" size={18} color="white" />
          <Text style={styles.text}>Tryb offline</Text>
          {pendingCount > 0 && (
            <Text style={styles.pending}>({pendingCount} do synchronizacji)</Text>
          )}
        </>
      ) : isSyncing ? (
        <>
          <Ionicons name="sync" size={18} color="white" />
          <Text style={styles.text}>Synchronizacja...</Text>
        </>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 48, // Safe area
    gap: 8,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  pending: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
})
```

**Step 2: Dodaj do _layout.tsx**

Add import:
```typescript
import { OfflineIndicator } from '../components/ui/OfflineIndicator'
import { initNetworkListener, useSyncStore } from '../stores/syncStore'
```

Add in useEffect:
```typescript
useEffect(() => {
  const unsubscribe = initNetworkListener()
  useSyncStore.getState().updatePendingCount()
  
  SplashScreen.hideAsync()
  
  return () => unsubscribe()
}, [])
```

Add component after StatusBar:
```typescript
<OfflineIndicator />
```

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/ apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): add offline indicator and network listener"
```

---

## Summary

Plan Stream B Part 2 zakończony. Zawiera:

- **B4**: Lista wycen + szczegóły wyceny ✅
- **B5**: Kreator wycen (5 kroków) + Zustand store ✅
- **B6**: Settings (profil, szablony usług) ✅
- **B7**: PDF generation + sharing ✅
- **B8**: SQLite offline + sync queue + indicator ✅

**Brakuje (minor, można dodać później):**
- B6: Materials templates screen (analogicznie do service templates)
- B6: Disclaimer editor screen
- B6: Subscription upgrade screen

**Wykonanie planu:**

Plan complete and saved to `docs/plans/2026-01-12-stream-b-mobile-part2.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
