import * as SQLite from 'expo-sqlite'
import { CREATE_TABLES_SQL } from './schema'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync('majsterio.db')
  await db.execAsync(CREATE_TABLES_SQL)
  return db
}

// Sync queue operations
export async function addToSyncQueue(
  type: 'quote' | 'client',
  action: 'create' | 'update' | 'delete',
  payload: object
): Promise<void> {
  const database = await getDatabase()
  const id = Math.random().toString(36).substring(2, 9)

  await database.runAsync(
    `INSERT INTO sync_queue (id, type, action, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, type, action, JSON.stringify(payload), Date.now()]
  )
}

export async function getSyncQueue(): Promise<Array<{
  id: string
  type: string
  action: string
  payload: object
  createdAt: number
  retries: number
}>> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{
    id: string
    type: string
    action: string
    payload: string
    created_at: number
    retries: number
  }>('SELECT * FROM sync_queue ORDER BY created_at ASC')

  return result.map((row) => ({
    id: row.id,
    type: row.type,
    action: row.action,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    retries: row.retries,
  }))
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = await getDatabase()
  await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id])
}

export async function incrementRetry(id: string): Promise<void> {
  const database = await getDatabase()
  await database.runAsync(
    'UPDATE sync_queue SET retries = retries + 1 WHERE id = ?',
    [id]
  )
}

// Cache operations
export async function cacheQuotes(userId: string, quotes: object[]): Promise<void> {
  const database = await getDatabase()
  const now = Date.now()

  for (const quote of quotes) {
    await database.runAsync(
      `INSERT OR REPLACE INTO quotes_cache (id, user_id, data, synced_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [(quote as any).id, userId, JSON.stringify(quote), now, now]
    )
  }
}

export async function getCachedQuotes(userId: string): Promise<object[]> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{ data: string }>(
    'SELECT data FROM quotes_cache WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  )
  return result.map((row) => JSON.parse(row.data))
}

export async function cacheClients(userId: string, clients: object[]): Promise<void> {
  const database = await getDatabase()
  const now = Date.now()

  for (const client of clients) {
    await database.runAsync(
      `INSERT OR REPLACE INTO clients_cache (id, user_id, data, synced_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [(client as any).id, userId, JSON.stringify(client), now, now]
    )
  }
}

export async function getCachedClients(userId: string): Promise<object[]> {
  const database = await getDatabase()
  const result = await database.getAllAsync<{ data: string }>(
    'SELECT data FROM clients_cache WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  )
  return result.map((row) => JSON.parse(row.data))
}
