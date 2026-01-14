import { beforeAll, afterAll, vi } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../../../.env') })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'test-secret-for-testing-only'
process.env.REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || 'test-webhook-secret'

// Validate required env vars for tests
if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL is required for running tests.')
  console.error('Create a .env file in the project root with DATABASE_URL set.\n')
  process.exit(1)
}

// Global test timeout
vi.setConfig({ testTimeout: 10000 })

beforeAll(async () => {
  // Any global setup
})

afterAll(async () => {
  // Close database connection after all tests
  const { closeDb } = await import('../src/db/index.js')
  await closeDb()
})
