import { initTRPC } from '@trpc/server'
import { z } from 'zod'

// Stub types for mobile app compilation
interface Quote {
  id: string
  number: number
  total: number
  status: string
  clientId: string
  notesBefore: string | null
  notesAfter: string | null
  disclaimer: string | null
  showDisclaimer: boolean
  groups: {
    id: string
    name: string
    floorM2: number | null
    services: {
      id: string
      name: string
      quantity: number
      unit: string
      pricePerUnit: number
      total: number
    }[]
  }[]
  materials: {
    id: string
    name: string
    quantity: number
    unit: string
    pricePerUnit: number
    total: number
  }[]
  createdAt: Date
}

interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  siteAddress: string | null
  notes: string | null
}

interface ServiceTemplate {
  id: string
  name: string
  defaultPrice: number | null
  unit: string
  quantitySource: string | null
  category: string | null
  isSystem: boolean
}

interface MaterialTemplate {
  id: string
  name: string
  defaultPrice: number | null
  unit: string
  consumption: number | null
  isSystem: boolean
}

interface Settings {
  defaultDisclaimer: string | null
  showDisclaimerByDefault: boolean
}

// Input schemas
const createClientInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

const createQuoteInput = z.object({
  clientId: z.string(),
  notesBefore: z.string().optional(),
  notesAfter: z.string().optional(),
  disclaimer: z.string().optional(),
  showDisclaimer: z.boolean().optional(),
  groups: z.array(z.object({
    name: z.string(),
    floorM2: z.number().optional(),
    services: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      pricePerUnit: z.number(),
    })),
  })).optional(),
  materials: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    pricePerUnit: z.number(),
  })).optional(),
})

const upsertServiceTemplateInput = z.object({
  id: z.string().optional(),
  data: z.object({
    name: z.string(),
    defaultPrice: z.number().optional(),
    unit: z.string(),
    quantitySource: z.string().optional(),
    category: z.string().optional(),
  }),
})

const upsertMaterialTemplateInput = z.object({
  id: z.string().optional(),
  data: z.object({
    name: z.string(),
    defaultPrice: z.number().optional(),
    unit: z.string(),
    consumption: z.number().optional(),
  }),
})

const updateSettingsInput = z.object({
  defaultDisclaimer: z.string().nullable().optional(),
  showDisclaimerByDefault: z.boolean().optional(),
})

// Stub tRPC router - will be replaced when API is implemented
const t = initTRPC.create()

// Placeholder procedures for mobile app to compile
const appRouter = t.router({
  subscriptions: t.router({
    status: t.procedure.query(() => ({
      tier: 'free' as const,
      quotesThisMonth: 0,
      limits: { quotesPerMonth: 10 },
    })),
  }),
  quotes: t.router({
    list: t.procedure.query((): Quote[] => []),
    create: t.procedure.input(createQuoteInput).mutation(() => ({} as Quote)),
    byId: t.procedure.input(z.object({ id: z.string() })).query((): Quote | null => null),
    delete: t.procedure.input(z.object({ id: z.string() })).mutation(() => ({})),
  }),
  clients: t.router({
    list: t.procedure.query((): Client[] => []),
    create: t.procedure.input(createClientInput).mutation(() => ({} as Client)),
    get: t.procedure.input(z.object({ id: z.string() })).query((): Client | null => null),
  }),
  templates: t.router({
    services: t.router({
      list: t.procedure.query((): ServiceTemplate[] => []),
      upsert: t.procedure.input(upsertServiceTemplateInput).mutation(() => ({} as ServiceTemplate)),
      delete: t.procedure.input(z.object({ id: z.string() })).mutation(() => ({})),
    }),
    materials: t.router({
      list: t.procedure.query((): MaterialTemplate[] => []),
      upsert: t.procedure.input(upsertMaterialTemplateInput).mutation(() => ({} as MaterialTemplate)),
      delete: t.procedure.input(z.object({ id: z.string() })).mutation(() => ({})),
    }),
  }),
  settings: t.router({
    get: t.procedure.query((): Settings => ({
      defaultDisclaimer: null,
      showDisclaimerByDefault: true,
    })),
    update: t.procedure.input(updateSettingsInput).mutation(() => ({} as Settings)),
  }),
})

export type AppRouter = typeof appRouter
