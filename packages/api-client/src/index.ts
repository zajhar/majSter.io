import { initTRPC } from '@trpc/server'

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
    list: t.procedure.query(() => []),
    create: t.procedure.mutation(() => ({})),
    get: t.procedure.query(() => null),
  }),
  clients: t.router({
    list: t.procedure.query(() => []),
    create: t.procedure.mutation(() => ({})),
    get: t.procedure.query(() => null),
  }),
})

export type AppRouter = typeof appRouter
