import { initTRPC } from '@trpc/server'
import { appRouter } from '../../src/trpc/router.js'
import type { Context } from '../../src/trpc/context.js'
import type { Database } from '../../src/db/index.js'

// Inner context for testing (no request/response needed)
export function createTestContext(overrides: {
  db: Database
  user?: { id: string; email: string; name: string } | null
}): Context {
  const mockLog = {
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
    trace: () => {},
    fatal: () => {},
  }

  return {
    req: {
      log: mockLog,
      id: `test-req-${Date.now()}`,
    } as unknown as Context['req'],
    res: {} as Context['res'],
    db: overrides.db,
    user: overrides.user ?? null,
  }
}

// Create tRPC caller factory for testing
const t = initTRPC.context<Context>().create()
export const createTestCaller = t.createCallerFactory(appRouter)

// Helper for authenticated caller
export function createAuthenticatedCaller(db: Database, userId = 'test-user-id') {
  const ctx = createTestContext({
    db,
    user: { id: userId, email: 'test@example.com', name: 'Test User' },
  })
  return createTestCaller(ctx)
}

// Helper for unauthenticated caller
export function createPublicCaller(db: Database) {
  const ctx = createTestContext({ db, user: null })
  return createTestCaller(ctx)
}
