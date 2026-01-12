import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'
import { quotesRouter } from './procedures/quotes'
import { templatesRouter } from './procedures/templates'
import { subscriptionsRouter } from './procedures/subscriptions'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
  quotes: quotesRouter,
  templates: templatesRouter,
  subscriptions: subscriptionsRouter,
})

export type AppRouter = typeof appRouter
