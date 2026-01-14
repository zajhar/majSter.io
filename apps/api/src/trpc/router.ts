import { router, publicProcedure, protectedProcedure } from './trpc.js'
import { clientsRouter } from './procedures/clients.js'
import { quotesRouter } from './procedures/quotes.js'
import { templatesRouter } from './procedures/templates.js'
import { subscriptionsRouter } from './procedures/subscriptions.js'
import { groupTemplatesRouter } from './procedures/groupTemplates.js'
import { tradeTypesRouter } from './procedures/tradeTypes.js'

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
  groupTemplates: groupTemplatesRouter,
  tradeTypes: tradeTypesRouter,
})

export type AppRouter = typeof appRouter
