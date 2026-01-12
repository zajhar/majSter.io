import { router, publicProcedure, protectedProcedure } from './trpc'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})

export type AppRouter = typeof appRouter
