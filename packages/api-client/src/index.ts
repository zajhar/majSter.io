import { initTRPC } from '@trpc/server'

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
    create: t.procedure.mutation(() => ({} as Quote)),
    get: t.procedure.query((): Quote | null => null),
  }),
  clients: t.router({
    list: t.procedure.query((): Client[] => []),
    create: t.procedure.mutation(() => ({} as Client)),
    get: t.procedure.query((): Client | null => null),
  }),
})

export type AppRouter = typeof appRouter
