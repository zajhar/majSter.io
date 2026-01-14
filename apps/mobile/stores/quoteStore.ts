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
  manualFloor?: number
  manualCeiling?: number
  manualWalls?: number
  manualPerimeter?: number
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
  mode: 'create' | 'edit'
  editingQuoteId: string | null

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
  initForEdit: (quote: {
    id: string
    clientId: string | null
    groups: Array<{
      name: string
      length?: string | null
      width?: string | null
      height?: string | null
      manualM2?: string | null
      manualFloor?: string | null
      manualCeiling?: string | null
      manualWalls?: string | null
      manualPerimeter?: string | null
      services: Array<{
        name: string
        quantity: string
        unit: string
        pricePerUnit: string
        quantitySource: string
      }>
    }>
    materials: Array<{
      name: string
      quantity: string
      unit: string
      pricePerUnit: string
    }>
    notesBefore?: string | null
    notesAfter?: string | null
    disclaimer?: string | null
    showDisclaimer: boolean
  }) => void

  // Computed
  calculateGroupM2: (group: QuoteGroup) => { walls: number; ceiling: number; floor: number; perimeter: number }
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
  mode: 'create' as const,
  editingQuoteId: null,

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

  reset: () => set({ draft: initialDraft, currentStep: 0, mode: 'create', editingQuoteId: null }),

  initForEdit: (quote) => set({
    mode: 'edit',
    editingQuoteId: quote.id,
    currentStep: 0,
    draft: {
      clientId: quote.clientId,
      groups: quote.groups.map((g) => ({
        id: generateId(),
        name: g.name,
        length: g.length ? parseFloat(g.length) : undefined,
        width: g.width ? parseFloat(g.width) : undefined,
        height: g.height ? parseFloat(g.height) : undefined,
        manualM2: g.manualM2 ? parseFloat(g.manualM2) : undefined,
        manualFloor: g.manualFloor ? parseFloat(g.manualFloor) : undefined,
        manualCeiling: g.manualCeiling ? parseFloat(g.manualCeiling) : undefined,
        manualWalls: g.manualWalls ? parseFloat(g.manualWalls) : undefined,
        manualPerimeter: g.manualPerimeter ? parseFloat(g.manualPerimeter) : undefined,
        services: g.services.map((s) => ({
          id: generateId(),
          name: s.name,
          quantity: parseFloat(s.quantity),
          unit: s.unit,
          pricePerUnit: parseFloat(s.pricePerUnit),
          quantitySource: s.quantitySource as QuantitySource,
        })),
      })),
      materials: quote.materials.map((m) => ({
        id: generateId(),
        name: m.name,
        quantity: parseFloat(m.quantity),
        unit: m.unit,
        pricePerUnit: parseFloat(m.pricePerUnit),
      })),
      notesBefore: quote.notesBefore ?? '',
      notesAfter: quote.notesAfter ?? '',
      disclaimer: quote.disclaimer ?? null,
      showDisclaimer: quote.showDisclaimer,
    },
  }),

  calculateGroupM2: (group) => {
    const { length, width, height, manualFloor, manualCeiling, manualWalls, manualPerimeter } = group

    // If manual values provided, use them
    if (manualFloor !== undefined || manualCeiling !== undefined || manualWalls !== undefined || manualPerimeter !== undefined) {
      return {
        floor: manualFloor ?? 0,
        ceiling: manualCeiling ?? 0,
        walls: manualWalls ?? 0,
        perimeter: manualPerimeter ?? 0,
      }
    }

    // Otherwise calculate from dimensions
    if (!length || !width) return { walls: 0, ceiling: 0, floor: 0, perimeter: 0 }

    const floor = length * width
    const ceiling = floor
    const walls = height ? 2 * (length + width) * height : 0
    const perimeter = 2 * (length + width)

    return { walls, ceiling, floor, perimeter }
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
        if (service.quantitySource === 'perimeter') qty = m2.perimeter || service.quantity
        total += qty * service.pricePerUnit
      }
    }

    for (const material of draft.materials) {
      total += material.quantity * material.pricePerUnit
    }

    return Math.round(total * 100) / 100
  },
}))
