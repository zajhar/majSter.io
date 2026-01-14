import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

import { getDb, closeDb } from '../db/index.js'
import { serviceTemplates, user } from '@majsterio/db'
import { systemServices, CATEGORIES } from '../data/systemServices.js'
import { eq } from 'drizzle-orm'

const SYSTEM_USER_ID = 'system'

async function seed() {
  console.log('Seeding system services...')

  const db = getDb()

  // Upewnij się, że użytkownik systemowy istnieje
  const existingUser = await db.select().from(user).where(eq(user.id, SYSTEM_USER_ID)).limit(1)
  if (existingUser.length === 0) {
    await db.insert(user).values({
      id: SYSTEM_USER_ID,
      name: 'System',
      email: 'system@majsterio.pl',
      emailVerified: true,
    })
    console.log('Created system user')
  }

  // Usuń stare systemowe usługi
  await db.delete(serviceTemplates).where(eq(serviceTemplates.isSystem, true))
  console.log('Deleted old system services')

  // Dodaj nowe
  const values = systemServices.map((service, index) => ({
    userId: SYSTEM_USER_ID,
    name: service.name,
    unit: service.unit,
    category: service.category,
    quantitySource: service.quantitySource,
    defaultPrice: String(service.defaultPrice),
    isSystem: true,
    sortOrder: index,
  }))

  await db.insert(serviceTemplates).values(values)
  console.log(`Inserted ${values.length} system services`)

  // Podsumowanie
  const categories = Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>
  for (const cat of categories) {
    const count = systemServices.filter(s => s.category === cat).length
    console.log(`  ${CATEGORIES[cat]}: ${count}`)
  }

  await closeDb()
  console.log('Done!')
}

seed().catch(console.error)
