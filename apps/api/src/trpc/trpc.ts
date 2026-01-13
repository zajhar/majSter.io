import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context.js'
import { getSubscriptionStatus } from '../lib/subscription.js'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { canCreateQuote, quotesRemaining } = await getSubscriptionStatus(ctx.user.id)

  if (!canCreateQuote) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Przekroczono limit wycen. Pozostało: ${quotesRemaining}. Przejdź na Pro!`,
    })
  }

  return next({ ctx })
})
