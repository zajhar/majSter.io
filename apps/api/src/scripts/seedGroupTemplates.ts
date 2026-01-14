import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

import { getDb, closeDb } from '../db/index.js'
import { groupTemplates, groupTemplateServices, user } from '@majsterio/db'
import { systemGroupTemplates } from '../data/groupTemplates.js'
import { eq } from 'drizzle-orm'

const SYSTEM_USER_ID = 'system'

async function seed() {
  console.log('Seeding group templates...')

  const db = getDb()

  // Ensure system user exists
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

  // Delete old system group templates
  await db.delete(groupTemplates).where(eq(groupTemplates.isSystem, true))
  console.log('Deleted old system group templates')

  // Insert new templates
  for (let i = 0; i < systemGroupTemplates.length; i++) {
    const template = systemGroupTemplates[i]

    const [inserted] = await db.insert(groupTemplates).values({
      userId: SYSTEM_USER_ID,
      name: template.name,
      description: template.description,
      isSystem: true,
      sortOrder: i,
    }).returning()

    // Insert services for this template
    const serviceValues = template.services.map((service, j) => ({
      templateId: inserted.id,
      name: service.name,
      unit: service.unit,
      pricePerUnit: String(service.pricePerUnit),
      quantitySource: service.quantitySource,
      sortOrder: j,
    }))

    await db.insert(groupTemplateServices).values(serviceValues)

    console.log(`  ${template.name}: ${template.services.length} services`)
  }

  console.log(`\nInserted ${systemGroupTemplates.length} group templates`)

  await closeDb()
  console.log('Done!')
}

seed().catch(console.error)
