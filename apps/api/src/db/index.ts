import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@majsterio/db'

let client: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (db) return db

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  client = postgres(connectionString, {
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  })

  db = drizzle(client, { schema })
  return db
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}

export type Database = ReturnType<typeof getDb>
