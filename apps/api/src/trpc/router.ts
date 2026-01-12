import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
})

export type AppRouter = typeof appRouter
