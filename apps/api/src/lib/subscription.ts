import { eq, sql } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import { subscriptions } from '@majsterio/db'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'

export async function getSubscriptionStatus(userId: string) {
  const db = getDb()

  let [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))

  // Create default subscription if not exists
  if (!subscription) {
    [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        tier: 'free',
        status: 'active',
        quotesThisMonth: 0,
      })
      .returning()
  }

  const tier = subscription.tier as keyof typeof SUBSCRIPTION_LIMITS
  const limits = SUBSCRIPTION_LIMITS[tier]

  return {
    subscription,
    limits,
    canCreateQuote: subscription.quotesThisMonth < limits.quotesPerMonth,
    quotesRemaining: limits.quotesPerMonth === Infinity
      ? Infinity
      : limits.quotesPerMonth - subscription.quotesThisMonth,
  }
}

export async function incrementQuoteCount(userId: string) {
  const db = getDb()

  await db
    .update(subscriptions)
    .set({
      quotesThisMonth: sql`${subscriptions.quotesThisMonth} + 1`,
    })
    .where(eq(subscriptions.userId, userId))
}
