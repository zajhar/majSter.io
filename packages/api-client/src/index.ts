import { initTRPC } from '@trpc/server'
import { z } from 'zod'

// Stub types for mobile app compilation
interface Quote {
  id: string
  number: string
  total: number
  status: string
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

// Input schemas
const createClientInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

const createQuoteInput = z.object({
  clientId: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })).optional(),
})

// Stub tRPC router - will be replaced when API is implemented
const t = initTRPC.create()

// Placeholder procedures for mobile app to compile
const appRouter = t.router({
  subscriptions: t.router({
    status: t.procedure.query(() => ({
      quotesThisMonth: 0,
      limits: { quotesPerMonth: 10 },
    })),
  }),
  quotes: t.router({
    list: t.procedure.query((): Quote[] => []),
    create: t.procedure.input(createQuoteInput).mutation(() => ({} as Quote)),
    get: t.procedure.input(z.object({ id: z.string() })).query((): Quote | null => null),
  }),
  clients: t.router({
    list: t.procedure.query((): Client[] => []),
    create: t.procedure.input(createClientInput).mutation(() => ({} as Client)),
    get: t.procedure.input(z.object({ id: z.string() })).query((): Client | null => null),
  }),
})

export type AppRouter = typeof appRouter
