# Group Templates - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to create quote groups from predefined templates with preset services and prices.

**Architecture:** New `group_templates` and `group_template_services` tables store template definitions. Templates are loaded via TRPC and applied when creating a group in the quote wizard. Users can save existing groups as templates.

**Tech Stack:** Drizzle ORM, TRPC, React Native, Zustand

---

## Task 1: Database Schema - New Tables

**Files:**
- Modify: `packages/db/src/schema.ts`
- Modify: `packages/db/src/index.ts`

**Step 1: Add groupTemplates table to schema.ts**

Add after `materialTemplates` table (around line 182):

```typescript
// ========== GROUP TEMPLATES ==========

export const groupTemplates = pgTable('group_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('group_templates_user_id_idx').on(table.userId),
])

export const groupTemplateServices = pgTable('group_template_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => groupTemplates.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  quantitySource: varchar('quantity_source', { length: 20 }).default('manual').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('group_template_services_template_id_idx').on(table.templateId),
])
```

**Step 2: Export new tables from index.ts**

Add to exports in `packages/db/src/index.ts`:

```typescript
export { groupTemplates, groupTemplateServices } from './schema.js'
```

**Step 3: Push schema to database**

Run:
```bash
cd packages/db && pnpm db:push
```

Expected: Tables `group_templates` and `group_template_services` created.

**Step 4: Commit**

```bash
git add packages/db/src/schema.ts packages/db/src/index.ts
git commit -m "feat(db): add group_templates and group_template_services tables"
```

---

## Task 2: Add New Services to systemServices

**Files:**
- Modify: `apps/api/src/data/systemServices.ts`

**Step 1: Add ~18 new services**

Add these services to the appropriate category sections:

```typescript
// Add to MALOWANIE I TYNKI section:
{ name: 'Przygotowanie ścian do malowania', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 12 },
{ name: 'Malowanie dekoracyjne', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 60 },
{ name: 'Kucie tynków', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 45 },
{ name: 'Skrobanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 20 },

// Add to PODŁOGI section:
{ name: 'Skucie starych płytek', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 50 },
{ name: 'Montaż cokołów z płytek', unit: 'mb', category: 'podlogi', quantitySource: 'perimeter', defaultPrice: 45 },
{ name: 'Wylewka samopoziomująca', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 40 },

// Add to HYDRAULIKA section:
{ name: 'Punkt hydrauliczny', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 1000 },
{ name: 'Ogrzewanie podłogowe', unit: 'm2', category: 'hydraulika', quantitySource: 'floor', defaultPrice: 330 },

// Add to ELEKTRYKA section:
{ name: 'Montaż punktu oświetleniowego', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 140 },

// Add to OGÓLNOBUDOWLANE section:
{ name: 'Demontaż starego wykończenia', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 30 },
{ name: 'Zabudowa skosów GK', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 85 },
{ name: 'Sufity GK', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'ceiling', defaultPrice: 90 },
{ name: 'Paroizolacja', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 25 },
{ name: 'Klej + siatka (elewacja)', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 45 },
{ name: 'Tynk elewacyjny', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 55 },
{ name: 'Malowanie elewacji', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 25 },
{ name: 'Montaż drzwi zewnętrznych', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 700 },
{ name: 'Demontaż drzwi', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 250 },
```

**Step 2: Run seed to update services**

```bash
cd apps/api && pnpm seed:services
```

Expected: `Inserted 99 system services` (81 + 18 new)

**Step 3: Commit**

```bash
git add apps/api/src/data/systemServices.ts
git commit -m "feat(api): add 18 new construction services"
```

---

## Task 3: Create Group Templates Seed Script

**Files:**
- Create: `apps/api/src/data/groupTemplates.ts`
- Create: `apps/api/src/scripts/seedGroupTemplates.ts`
- Modify: `apps/api/package.json`

**Step 1: Create groupTemplates.ts data file**

Create `apps/api/src/data/groupTemplates.ts`:

```typescript
export interface GroupTemplateData {
  name: string
  description: string
  services: {
    name: string
    unit: string
    pricePerUnit: number
    quantitySource: string
  }[]
}

export const systemGroupTemplates: GroupTemplateData[] = [
  {
    name: 'Łazienka',
    description: 'Kompleksowy remont łazienki',
    services: [
      { name: 'Skucie starych płytek', unit: 'm2', pricePerUnit: 50, quantitySource: 'walls' },
      { name: 'Hydroizolacja podłogi', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Hydroizolacja ścian', unit: 'm2', pricePerUnit: 60, quantitySource: 'walls' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie płytek podłogowych', unit: 'm2', pricePerUnit: 130, quantitySource: 'floor' },
      { name: 'Układanie płytek ściennych', unit: 'm2', pricePerUnit: 140, quantitySource: 'walls' },
      { name: 'Punkt hydrauliczny', unit: 'szt', pricePerUnit: 1000, quantitySource: 'manual' },
      { name: 'Montaż WC', unit: 'szt', pricePerUnit: 300, quantitySource: 'manual' },
      { name: 'Montaż umywalki', unit: 'szt', pricePerUnit: 200, quantitySource: 'manual' },
      { name: 'Montaż kabiny prysznicowej', unit: 'szt', pricePerUnit: 500, quantitySource: 'manual' },
      { name: 'Montaż baterii', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Pokój - malowanie',
    description: 'Odświeżenie pokoju - gruntowanie i malowanie',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
    ],
  },
  {
    name: 'Pokój - remont',
    description: 'Pełny remont pokoju z podłogą',
    services: [
      { name: 'Demontaż starego wykończenia', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Kuchnia',
    description: 'Remont kuchni z płytkami',
    services: [
      { name: 'Skucie starych płytek', unit: 'm2', pricePerUnit: 50, quantitySource: 'walls' },
      { name: 'Układanie płytek podłogowych', unit: 'm2', pricePerUnit: 130, quantitySource: 'floor' },
      { name: 'Układanie płytek ściennych', unit: 'm2', pricePerUnit: 140, quantitySource: 'walls' },
      { name: 'Punkt hydrauliczny', unit: 'szt', pricePerUnit: 1000, quantitySource: 'manual' },
      { name: 'Montaż zlewozmywaka', unit: 'szt', pricePerUnit: 200, quantitySource: 'manual' },
      { name: 'Montaż baterii', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
      { name: 'Podłączenie zmywarki', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Stan deweloperski',
    description: 'Wykończenie mieszkania w stanie deweloperskim',
    services: [
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
      { name: 'Montaż gniazdka', unit: 'szt', pricePerUnit: 60, quantitySource: 'manual' },
      { name: 'Montaż włącznika', unit: 'szt', pricePerUnit: 50, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Mieszkanie PRL',
    description: 'Remont mieszkania z wielkiej płyty',
    services: [
      { name: 'Kucie tynków', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Skrobanie ścian', unit: 'm2', pricePerUnit: 20, quantitySource: 'walls' },
      { name: 'Demontaż starej podłogi', unit: 'm2', pricePerUnit: 25, quantitySource: 'floor' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Zabudowa poddasza',
    description: 'Wykończenie poddasza użytkowego',
    services: [
      { name: 'Zabudowa skosów GK', unit: 'm2', pricePerUnit: 85, quantitySource: 'walls' },
      { name: 'Sufity GK', unit: 'm2', pricePerUnit: 90, quantitySource: 'ceiling' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 100, quantitySource: 'walls' },
      { name: 'Paroizolacja', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
    ],
  },
  {
    name: 'Elewacja - styropian',
    description: 'Ocieplenie elewacji styropianem',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 100, quantitySource: 'walls' },
      { name: 'Klej + siatka (elewacja)', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Tynk elewacyjny', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Malowanie elewacji', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Elewacja - wełna',
    description: 'Ocieplenie elewacji wełną mineralną',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 120, quantitySource: 'walls' },
      { name: 'Klej + siatka (elewacja)', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Tynk elewacyjny', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Malowanie elewacji', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Korytarz',
    description: 'Remont korytarza/przedpokoju',
    services: [
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
]
```

**Step 2: Create seed script**

Create `apps/api/src/scripts/seedGroupTemplates.ts`:

```typescript
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
```

**Step 3: Add npm script to package.json**

Add to `apps/api/package.json` scripts:

```json
"seed:group-templates": "tsx src/scripts/seedGroupTemplates.ts"
```

**Step 4: Run seed**

```bash
cd apps/api && pnpm seed:group-templates
```

Expected output:
```
Seeding group templates...
Deleted old system group templates
  Łazienka: 11 services
  Pokój - malowanie: 4 services
  ...
Inserted 10 group templates
Done!
```

**Step 5: Commit**

```bash
git add apps/api/src/data/groupTemplates.ts apps/api/src/scripts/seedGroupTemplates.ts apps/api/package.json
git commit -m "feat(api): add group templates seed with 10 system templates"
```

---

## Task 4: TRPC Router for Group Templates

**Files:**
- Create: `apps/api/src/trpc/procedures/groupTemplates.ts`
- Modify: `apps/api/src/trpc/router.ts`
- Create: `packages/validators/src/groupTemplate.ts`
- Modify: `packages/validators/src/index.ts`

**Step 1: Create validator schema**

Create `packages/validators/src/groupTemplate.ts`:

```typescript
import { z } from 'zod'

export const groupTemplateServiceSchema = z.object({
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().positive(),
  quantitySource: z.string().default('manual'),
})

export const createGroupTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  services: z.array(groupTemplateServiceSchema).min(1),
})

export type CreateGroupTemplateInput = z.infer<typeof createGroupTemplateSchema>
export type GroupTemplateServiceInput = z.infer<typeof groupTemplateServiceSchema>
```

**Step 2: Export from validators index**

Add to `packages/validators/src/index.ts`:

```typescript
export * from './groupTemplate.js'
```

**Step 3: Create groupTemplates router**

Create `apps/api/src/trpc/procedures/groupTemplates.ts`:

```typescript
import { z } from 'zod'
import { eq, and, or } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc.js'
import { groupTemplates, groupTemplateServices } from '@majsterio/db'
import { createGroupTemplateSchema } from '@majsterio/validators'

export const groupTemplatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db
      .select()
      .from(groupTemplates)
      .where(or(
        eq(groupTemplates.userId, ctx.user.id),
        eq(groupTemplates.isSystem, true)
      ))
      .orderBy(groupTemplates.isSystem, groupTemplates.sortOrder)

    // Fetch services for each template
    const result = await Promise.all(
      templates.map(async (template) => {
        const services = await ctx.db
          .select()
          .from(groupTemplateServices)
          .where(eq(groupTemplateServices.templateId, template.id))
          .orderBy(groupTemplateServices.sortOrder)

        return {
          ...template,
          services: services.map(s => ({
            ...s,
            pricePerUnit: parseFloat(s.pricePerUnit),
          })),
        }
      })
    )

    return result
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          or(
            eq(groupTemplates.userId, ctx.user.id),
            eq(groupTemplates.isSystem, true)
          )
        ))
        .limit(1)

      if (!template) return null

      const services = await ctx.db
        .select()
        .from(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, template.id))
        .orderBy(groupTemplateServices.sortOrder)

      return {
        ...template,
        services: services.map(s => ({
          ...s,
          pricePerUnit: parseFloat(s.pricePerUnit),
        })),
      }
    }),

  create: protectedProcedure
    .input(createGroupTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .insert(groupTemplates)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          isSystem: false,
        })
        .returning()

      const serviceValues = input.services.map((service, i) => ({
        templateId: template.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: String(service.pricePerUnit),
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return template
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: createGroupTemplateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership (can't edit system templates)
      const [existing] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          eq(groupTemplates.userId, ctx.user.id),
          eq(groupTemplates.isSystem, false)
        ))
        .limit(1)

      if (!existing) {
        throw new Error('Template not found or cannot be edited')
      }

      // Update template
      await ctx.db
        .update(groupTemplates)
        .set({
          name: input.data.name,
          description: input.data.description,
          updatedAt: new Date(),
        })
        .where(eq(groupTemplates.id, input.id))

      // Delete old services and insert new ones
      await ctx.db
        .delete(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, input.id))

      const serviceValues = input.data.services.map((service, i) => ({
        templateId: input.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: String(service.pricePerUnit),
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          eq(groupTemplates.userId, ctx.user.id),
          eq(groupTemplates.isSystem, false)
        ))

      return { success: true }
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get original template
      const [original] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(eq(groupTemplates.id, input.id))
        .limit(1)

      if (!original) {
        throw new Error('Template not found')
      }

      // Get services
      const services = await ctx.db
        .select()
        .from(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, input.id))

      // Create copy
      const [newTemplate] = await ctx.db
        .insert(groupTemplates)
        .values({
          userId: ctx.user.id,
          name: `${original.name} (kopia)`,
          description: original.description,
          isSystem: false,
        })
        .returning()

      // Copy services
      const serviceValues = services.map((service, i) => ({
        templateId: newTemplate.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: service.pricePerUnit,
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return newTemplate
    }),
})
```

**Step 4: Add to main router**

Modify `apps/api/src/trpc/router.ts`:

```typescript
import { groupTemplatesRouter } from './procedures/groupTemplates.js'

// Add to appRouter:
groupTemplates: groupTemplatesRouter,
```

**Step 5: Commit**

```bash
git add packages/validators/src/groupTemplate.ts packages/validators/src/index.ts apps/api/src/trpc/procedures/groupTemplates.ts apps/api/src/trpc/router.ts
git commit -m "feat(api): add groupTemplates TRPC router with CRUD operations"
```

---

## Task 5: Mobile - StepGroups Template Selection

**Files:**
- Modify: `apps/mobile/components/quote/StepGroups.tsx`
- Modify: `apps/mobile/stores/quoteStore.ts`

**Step 1: Add template selection state to StepGroups**

Modify `apps/mobile/components/quote/StepGroups.tsx` to add:

1. Import trpc client
2. Add `useTemplate` state: `'none' | 'template'`
3. Add `selectedTemplateId` state
4. Fetch templates with `trpc.groupTemplates.list.useQuery()`
5. Show template picker when `useTemplate === 'template'`
6. Apply template services when saving group

Key changes:

```typescript
// Add imports
import { trpc } from '../../lib/trpc'

// Add to GroupFormState interface:
interface GroupFormState {
  // ... existing fields
  useTemplate: 'none' | 'template'
  selectedTemplateId: string | null
}

// Add to initialFormState:
const initialFormState: GroupFormState = {
  // ... existing fields
  useTemplate: 'none',
  selectedTemplateId: null,
}

// In component, add query:
const { data: templates } = trpc.groupTemplates.list.useQuery()

// Split templates into system and user:
const systemTemplates = templates?.filter(t => t.isSystem) ?? []
const userTemplates = templates?.filter(t => !t.isSystem) ?? []

// Modify handleSave to include template services:
const handleSave = () => {
  // ... existing validation

  let services = editingId
    ? draft.groups.find(g => g.id === editingId)?.services || []
    : []

  // If using template, add template services
  if (form.useTemplate === 'template' && form.selectedTemplateId) {
    const template = templates?.find(t => t.id === form.selectedTemplateId)
    if (template) {
      services = template.services.map(s => ({
        id: `temp_${Math.random().toString(36).slice(2)}`,
        name: s.name,
        unit: s.unit,
        pricePerUnit: s.pricePerUnit,
        quantity: 0, // Will be calculated from dimensions
        quantitySource: s.quantitySource,
      }))
    }
  }

  const groupData = {
    // ... existing fields
    services,
  }

  // ... rest of save logic
}
```

**Step 2: Add template picker UI to modal**

Add template selection UI in modal, between name input and dimension inputs:

```tsx
{/* Template selection */}
<View style={styles.radioGroup}>
  <Pressable
    style={styles.radioOption}
    onPress={() => updateField('useTemplate', 'none')}
  >
    <View style={[styles.radio, form.useTemplate === 'none' && styles.radioSelected]} />
    <Text style={styles.radioLabel}>Pusta grupa</Text>
  </Pressable>
  <Pressable
    style={styles.radioOption}
    onPress={() => updateField('useTemplate', 'template')}
  >
    <View style={[styles.radio, form.useTemplate === 'template' && styles.radioSelected]} />
    <Text style={styles.radioLabel}>Z szablonu</Text>
  </Pressable>
</View>

{form.useTemplate === 'template' && (
  <View style={styles.templatePicker}>
    {systemTemplates.length > 0 && (
      <>
        <Text style={styles.templateSectionTitle}>SYSTEMOWE</Text>
        {systemTemplates.map(t => (
          <Pressable
            key={t.id}
            style={[
              styles.templateItem,
              form.selectedTemplateId === t.id && styles.templateItemSelected
            ]}
            onPress={() => {
              updateField('selectedTemplateId', t.id)
              if (!form.name) updateField('name', t.name)
            }}
          >
            <Text style={styles.templateName}>{t.name}</Text>
            <Text style={styles.templateCount}>{t.services.length} usług</Text>
          </Pressable>
        ))}
      </>
    )}
    {userTemplates.length > 0 && (
      <>
        <Text style={styles.templateSectionTitle}>MOJE SZABLONY</Text>
        {userTemplates.map(t => (
          <Pressable
            key={t.id}
            style={[
              styles.templateItem,
              form.selectedTemplateId === t.id && styles.templateItemSelected
            ]}
            onPress={() => {
              updateField('selectedTemplateId', t.id)
              if (!form.name) updateField('name', t.name)
            }}
          >
            <Text style={styles.templateName}>{t.name}</Text>
            <Text style={styles.templateCount}>{t.services.length} usług</Text>
          </Pressable>
        ))}
      </>
    )}
  </View>
)}
```

**Step 3: Add styles**

```typescript
// Add to StyleSheet.create:
radioGroup: {
  flexDirection: 'row',
  gap: 16,
  marginBottom: 16,
},
radioOption: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
radio: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: colors.border,
},
radioSelected: {
  borderColor: colors.primary,
  backgroundColor: colors.primary,
},
radioLabel: {
  fontSize: 14,
  fontFamily: fontFamily.regular,
  color: colors.text,
},
templatePicker: {
  marginBottom: 16,
},
templateSectionTitle: {
  fontSize: 12,
  fontFamily: fontFamily.medium,
  color: colors.textSecondary,
  marginBottom: 8,
  marginTop: 8,
},
templateItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: 'transparent',
},
templateItemSelected: {
  borderColor: colors.primary,
  backgroundColor: colors.primaryLight,
},
templateName: {
  fontSize: 14,
  fontFamily: fontFamily.medium,
  color: colors.text,
},
templateCount: {
  fontSize: 12,
  fontFamily: fontFamily.regular,
  color: colors.textSecondary,
},
```

**Step 4: Test manually**

1. Open app
2. Create new quote
3. Go to step 2 (Groups)
4. Tap "Add group"
5. Select "Z szablonu"
6. Pick "Łazienka"
7. Enter dimensions
8. Save group
9. Verify services are added

**Step 5: Commit**

```bash
git add apps/mobile/components/quote/StepGroups.tsx
git commit -m "feat(mobile): add template selection when creating quote group"
```

---

## Task 6: Mobile - Save Group as Template

**Files:**
- Modify: `apps/mobile/components/quote/StepServices.tsx` or create `apps/mobile/components/quote/GroupMenu.tsx`

**Step 1: Add "Save as template" option to group menu**

In the group card or services step, add menu with save option:

```tsx
const [showSaveModal, setShowSaveModal] = useState(false)
const [templateName, setTemplateName] = useState('')

const createTemplateMutation = trpc.groupTemplates.create.useMutation({
  onSuccess: () => {
    setShowSaveModal(false)
    setTemplateName('')
    Alert.alert('Sukces', 'Szablon został zapisany')
  },
})

const handleSaveAsTemplate = (group: QuoteGroup) => {
  if (!templateName.trim()) return

  createTemplateMutation.mutate({
    name: templateName,
    services: group.services.map(s => ({
      name: s.name,
      unit: s.unit,
      pricePerUnit: s.pricePerUnit,
      quantitySource: s.quantitySource,
    })),
  })
}
```

Add modal for template name input.

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/StepServices.tsx
git commit -m "feat(mobile): add save group as template functionality"
```

---

## Task 7: Mobile - Settings Group Templates Screen

**Files:**
- Create: `apps/mobile/app/(tabs)/settings/group-templates.tsx`
- Modify: `apps/mobile/app/(tabs)/settings/index.tsx`

**Step 1: Create group-templates screen**

Create `apps/mobile/app/(tabs)/settings/group-templates.tsx`:

```tsx
import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'
import { colors, fontFamily, borderRadius } from '../../../constants/theme'

export default function GroupTemplatesScreen() {
  const { data: templates, refetch } = trpc.groupTemplates.list.useQuery()
  const deleteMutation = trpc.groupTemplates.delete.useMutation({
    onSuccess: () => refetch(),
  })
  const duplicateMutation = trpc.groupTemplates.duplicate.useMutation({
    onSuccess: () => refetch(),
  })

  const systemTemplates = templates?.filter(t => t.isSystem) ?? []
  const userTemplates = templates?.filter(t => !t.isSystem) ?? []

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Usuń szablon',
      `Czy na pewno chcesz usunąć szablon "${name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    )
  }

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate({ id })
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Szablony grup' }} />
      <FlatList
        data={[
          { type: 'header', title: 'MOJE SZABLONY' },
          ...userTemplates.map(t => ({ type: 'user', ...t })),
          { type: 'header', title: 'SYSTEMOWE' },
          ...systemTemplates.map(t => ({ type: 'system', ...t })),
        ]}
        keyExtractor={(item, index) => item.type === 'header' ? `header-${index}` : item.id}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionTitle}>{item.title}</Text>
          }

          return (
            <View style={styles.templateItem}>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.templateCount}>{item.services?.length ?? 0} usług</Text>
              </View>
              {item.type === 'user' ? (
                <View style={styles.actions}>
                  <Pressable onPress={() => handleDelete(item.id, item.name)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => handleDuplicate(item.id)}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </Pressable>
              )}
            </View>
          )
        }}
        contentContainerStyle={styles.container}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.text,
  },
  templateCount: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
})
```

**Step 2: Add link from settings index**

Add navigation item to `apps/mobile/app/(tabs)/settings/index.tsx`:

```tsx
<Pressable style={styles.menuItem} onPress={() => router.push('/settings/group-templates')}>
  <View style={styles.menuIcon}>
    <Ionicons name="layers-outline" size={24} color={colors.primary} />
  </View>
  <View style={styles.menuContent}>
    <Text style={styles.menuTitle}>Szablony grup</Text>
    <Text style={styles.menuSubtitle}>Zarządzaj szablonami pomieszczeń</Text>
  </View>
  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
</Pressable>
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/settings/group-templates.tsx apps/mobile/app/\(tabs\)/settings/index.tsx
git commit -m "feat(mobile): add group templates management in settings"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] Database has `group_templates` and `group_template_services` tables
- [ ] 99+ system services exist (81 original + 18 new)
- [ ] 10 system group templates exist
- [ ] API endpoint `groupTemplates.list` returns templates
- [ ] Mobile: Can create group from template
- [ ] Mobile: Template services are added with correct quantities
- [ ] Mobile: Can save group as template
- [ ] Mobile: Settings shows group templates screen
- [ ] Mobile: Can delete user templates
- [ ] Mobile: Can duplicate system templates

## Run Commands Summary

```bash
# Schema push
cd packages/db && pnpm db:push

# Seed services
cd apps/api && pnpm seed:services

# Seed group templates
cd apps/api && pnpm seed:group-templates

# Run mobile app
cd apps/mobile && pnpm start
```
