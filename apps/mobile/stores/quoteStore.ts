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
