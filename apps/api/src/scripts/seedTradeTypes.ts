import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

import { getDb, closeDb } from '../db/index.js'
import { tradeTypes } from '@majsterio/db'
import { tradeTypesData } from '../data/tradeTypes.js'

async function seed() {
  console.log('Seeding trade types...')

  const db = getDb()

  // Delete existing trade types and insert fresh
  await db.delete(tradeTypes)
  console.log('Deleted old trade types')

  // Insert all trade types
  await db.insert(tradeTypes).values(tradeTypesData)

  console.log(`Inserted ${tradeTypesData.length} trade types:`)
  for (const t of tradeTypesData) {
    console.log(`  - ${t.name} (${t.id})`)
  }

  await closeDb()
  console.log('Done!')
}

seed().catch(console.error)
