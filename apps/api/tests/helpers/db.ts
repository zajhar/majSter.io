import { getDb, closeDb } from '../../src/db/index.js'
import { clients, quotes, quoteGroups, quoteServices, quoteMaterials, subscriptions, user } from '@majsterio/db'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export { getDb, closeDb }

// Test data factory - creates a real user in the database
export async function createTestUser() {
  const db = getDb()
  const id = randomUUID()
  const email = `test-${Date.now()}@example.com`
  const name = 'Test User'

  await db.insert(user).values({
    id,
    email,
    name,
    emailVerified: false,
  })

  return { id, email, name }
}

// Sync version for context creation (user must already exist)
export function createTestUserData() {
  return {
    id: randomUUID(),
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
  }
}

// Cleanup helpers - deletes all test data for a user
export async function cleanupTestData(userId: string) {
  const db = getDb()

  // Get all quotes for user to delete their related data
  const userQuotes = await db.select({ id: quotes.id }).from(quotes).where(eq(quotes.userId, userId))
  const quoteIds = userQuotes.map(q => q.id)

  if (quoteIds.length > 0) {
    // Get all groups for these quotes
    const groups = await db.select({ id: quoteGroups.id }).from(quoteGroups).where(eq(quoteGroups.quoteId, quoteIds[0]))

    // Delete in correct order due to foreign keys
    for (const quoteId of quoteIds) {
      const quoteGroupsData = await db.select({ id: quoteGroups.id }).from(quoteGroups).where(eq(quoteGroups.quoteId, quoteId))
      for (const group of quoteGroupsData) {
        await db.delete(quoteServices).where(eq(quoteServices.groupId, group.id))
      }
      await db.delete(quoteMaterials).where(eq(quoteMaterials.quoteId, quoteId))
      await db.delete(quoteGroups).where(eq(quoteGroups.quoteId, quoteId))
    }
    await db.delete(quotes).where(eq(quotes.userId, userId))
  }

  await db.delete(clients).where(eq(clients.userId, userId))
  await db.delete(subscriptions).where(eq(subscriptions.userId, userId))

  // Delete the user from Better Auth table (cascade will handle sessions/accounts)
  await db.delete(user).where(eq(user.id, userId))
}

// Create test subscription
export async function createTestSubscription(userId: string, tier: 'free' | 'pro' | 'pro_ai' = 'free') {
  const db = getDb()
  const [sub] = await db.insert(subscriptions).values({
    userId,
    tier,
    status: 'active',
    quotesThisMonth: 0,
  }).returning()
  return sub
}
