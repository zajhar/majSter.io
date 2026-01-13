import { eq, sql } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc.js'
import { subscriptions } from '@majsterio/db'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'

export const subscriptionsRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    let [subscription] = await ctx.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))

    // Create default subscription if not exists
    if (!subscription) {
      [subscription] = await ctx.db
        .insert(subscriptions)
        .values({
          userId: ctx.user.id,
          tier: 'free',
          status: 'active',
          quotesThisMonth: 0,
        })
        .returning()
    }

    const tier = subscription.tier as keyof typeof SUBSCRIPTION_LIMITS
    const limits = SUBSCRIPTION_LIMITS[tier]

    return {
      ...subscription,
      limits,
      canCreateQuote: subscription.quotesThisMonth < limits.quotesPerMonth,
      quotesRemaining: limits.quotesPerMonth === Infinity
        ? Infinity
        : limits.quotesPerMonth - subscription.quotesThisMonth,
    }
  }),

  incrementQuoteCount: protectedProcedure.mutation(async ({ ctx }) => {
    const [subscription] = await ctx.db
      .update(subscriptions)
      .set({
        quotesThisMonth: sql`${subscriptions.quotesThisMonth} + 1`,
      })
      .where(eq(subscriptions.userId, ctx.user.id))
      .returning()

    return subscription
  }),
})
