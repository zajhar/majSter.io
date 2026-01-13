# Faza 0: Setup Wspólny - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Utworzenie współdzielonych pakietów (types, validators, db schema), Docker dla lokalnej bazy, oraz branchy dla równoległej pracy.

**Architecture:** Monorepo z Turborepo. Pakiety w `packages/` są współdzielone między `apps/api` i `apps/mobile`. Typy TypeScript + Zod validators + Drizzle schema jako single source of truth. PostgreSQL w Docker dla lokalnego developmentu.

**Tech Stack:** TypeScript, Zod, Drizzle ORM, pnpm workspaces, Docker

---

## Task 0: Docker setup dla PostgreSQL

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

**Step 1: Utwórz docker-compose.yml**

Create `docker-compose.yml` (w roocie projektu):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: majsterio-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: majsterio
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Step 2: Utwórz .env.example w roocie**

Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/majsterio
```

**Step 3: Dodaj do .gitignore**

Append to `.gitignore`:
```
.env
.env.local
```

**Step 4: Uruchom bazę**

Run: `docker compose up -d`
Expected: Container `majsterio-db` running

**Step 5: Sprawdź połączenie**

Run: `docker compose exec postgres psql -U postgres -d majsterio -c "SELECT 1"`
Expected: Returns 1

**Step 6: Commit**

```bash
git add docker-compose.yml .env.example .gitignore
git commit -m "chore: add Docker Compose for local PostgreSQL"
```

---

## Task 1: Utworzenie struktury packages/shared

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Step 1: Utwórz katalog i package.json**

```bash
mkdir -p packages/shared/src
```

**Step 2: Utwórz package.json**

Create `packages/shared/package.json`:
```json
{
  "name": "@majsterio/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  }
}
```

**Step 3: Utwórz tsconfig.json**

Create `packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 4: Utwórz src/index.ts (placeholder)**

Create `packages/shared/src/index.ts`:
```typescript
// @majsterio/shared - współdzielone typy
export * from './types'
```

**Step 5: Zweryfikuj strukturę**

Run: `ls -la packages/shared/`
Expected: package.json, tsconfig.json, src/

**Step 6: Commit**

```bash
git add packages/shared/
git commit -m "chore: add packages/shared scaffold"
```

---

## Task 2: Typy - Client

**Files:**
- Create: `packages/shared/src/types/client.ts`
- Create: `packages/shared/src/types/index.ts`

**Step 1: Utwórz katalog types**

```bash
mkdir -p packages/shared/src/types
```

**Step 2: Utwórz client.ts**

Create `packages/shared/src/types/client.ts`:
```typescript
export interface Client {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string | null
  siteAddress: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientInput {
  firstName: string
  lastName: string
  phone?: string
  siteAddress?: string
  notes?: string
}

export interface UpdateClientInput {
  firstName?: string
  lastName?: string
  phone?: string
  siteAddress?: string
  notes?: string
}
```

**Step 3: Utwórz types/index.ts**

Create `packages/shared/src/types/index.ts`:
```typescript
export * from './client'
```

**Step 4: Zaktualizuj główny index.ts**

Update `packages/shared/src/index.ts`:
```typescript
// @majsterio/shared - współdzielone typy
export * from './types'
```

**Step 5: Sprawdź typy**

Run: `cd packages/shared && pnpm check-types`
Expected: No errors

**Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add Client types"
```

---

## Task 3: Typy - Quote, QuoteGroup, QuoteService

**Files:**
- Create: `packages/shared/src/types/quote.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Utwórz quote.ts**

Create `packages/shared/src/types/quote.ts`:
```typescript
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export type QuantitySource = 'walls' | 'ceiling' | 'floor' | 'walls_ceiling' | 'manual'

export interface QuoteService {
  id: string
  groupId: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  quantitySource: QuantitySource
  sortOrder: number
}

export interface QuoteGroup {
  id: string
  quoteId: string
  name: string
  // Wymiary (opcjonalne)
  length: number | null
  width: number | null
  height: number | null
  // Obliczone m² (cache)
  wallsM2: number | null
  ceilingM2: number | null
  floorM2: number | null
  // Lub ręczne m²
  manualM2: number | null
  sortOrder: number
  services: QuoteService[]
}

export interface QuoteMaterial {
  id: string
  quoteId: string
  groupId: string | null
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  sortOrder: number
}

export interface Quote {
  id: string
  userId: string
  clientId: string
  number: number
  status: QuoteStatus
  notesBefore: string | null
  notesAfter: string | null
  disclaimer: string | null
  showDisclaimer: boolean
  total: number
  createdAt: Date
  updatedAt: Date
  syncedAt: Date | null
  // Relations
  groups: QuoteGroup[]
  materials: QuoteMaterial[]
}

export interface CreateQuoteInput {
  clientId: string
  notesBefore?: string
  notesAfter?: string
  disclaimer?: string
  showDisclaimer?: boolean
  groups: CreateQuoteGroupInput[]
  materials?: CreateQuoteMaterialInput[]
}

export interface CreateQuoteGroupInput {
  name: string
  length?: number
  width?: number
  height?: number
  manualM2?: number
  services: CreateQuoteServiceInput[]
}

export interface CreateQuoteServiceInput {
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  quantitySource: QuantitySource
}

export interface CreateQuoteMaterialInput {
  groupId?: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
}
```

**Step 2: Zaktualizuj types/index.ts**

Update `packages/shared/src/types/index.ts`:
```typescript
export * from './client'
export * from './quote'
```

**Step 3: Sprawdź typy**

Run: `cd packages/shared && pnpm check-types`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add Quote, QuoteGroup, QuoteService types"
```

---

## Task 4: Typy - ServiceTemplate, MaterialTemplate

**Files:**
- Create: `packages/shared/src/types/template.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Utwórz template.ts**

Create `packages/shared/src/types/template.ts`:
```typescript
import type { QuantitySource } from './quote'

export interface ServiceTemplate {
  id: string
  userId: string
  name: string
  defaultPrice: number | null
  unit: string
  quantitySource: QuantitySource
  category: string | null
  isSystem: boolean
  sortOrder: number
}

export interface CreateServiceTemplateInput {
  name: string
  defaultPrice?: number
  unit: string
  quantitySource: QuantitySource
  category?: string
}

export interface MaterialTemplate {
  id: string
  userId: string
  name: string
  defaultPrice: number | null
  unit: string
  consumption: number | null  // zużycie per m²
  linkedServiceIds: string[]
  isSystem: boolean
}

export interface CreateMaterialTemplateInput {
  name: string
  defaultPrice?: number
  unit: string
  consumption?: number
  linkedServiceIds?: string[]
}
```

**Step 2: Zaktualizuj types/index.ts**

Update `packages/shared/src/types/index.ts`:
```typescript
export * from './client'
export * from './quote'
export * from './template'
```

**Step 3: Sprawdź typy**

Run: `cd packages/shared && pnpm check-types`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add ServiceTemplate, MaterialTemplate types"
```

---

## Task 5: Typy - User, UserSettings, Subscription

**Files:**
- Create: `packages/shared/src/types/user.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Utwórz user.ts**

Create `packages/shared/src/types/user.ts`:
```typescript
export type SubscriptionTier = 'free' | 'pro' | 'pro_ai'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due'
export type TradeType = 'construction' | 'plumbing' | 'electrical' | 'hvac' | 'other'

export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  businessName: string | null
  businessLogo: string | null
  defaultDisclaimer: string | null
  showDisclaimerByDefault: boolean
  tradeType: TradeType | null
}

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  quotesThisMonth: number
  periodStart: Date | null
  periodEnd: Date | null
  externalId: string | null
  provider: string | null
}

export const DEFAULT_DISCLAIMER = `Niniejsza wycena ma charakter orientacyjny i jest ważna na dzień wystawienia. Nie uwzględnia ewentualnych zmian cen materiałów oraz prac dodatkowych wykraczających poza opisany zakres. Ostateczna cena może ulec zmianie po szczegółowych oględzinach.`

export const SUBSCRIPTION_LIMITS = {
  free: {
    quotesPerMonth: 10,
    customTemplates: 3,
    historyDays: 30,
  },
  pro: {
    quotesPerMonth: Infinity,
    customTemplates: Infinity,
    historyDays: Infinity,
  },
  pro_ai: {
    quotesPerMonth: Infinity,
    customTemplates: Infinity,
    historyDays: Infinity,
  },
} as const
```

**Step 2: Zaktualizuj types/index.ts**

Update `packages/shared/src/types/index.ts`:
```typescript
export * from './client'
export * from './quote'
export * from './template'
export * from './user'
```

**Step 3: Sprawdź typy**

Run: `cd packages/shared && pnpm check-types`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add User, UserSettings, Subscription types"
```

---

## Task 6: Utworzenie packages/validators

**Files:**
- Create: `packages/validators/package.json`
- Create: `packages/validators/tsconfig.json`
- Create: `packages/validators/src/index.ts`

**Step 1: Utwórz katalog i package.json**

```bash
mkdir -p packages/validators/src
```

**Step 2: Utwórz package.json**

Create `packages/validators/package.json`:
```json
{
  "name": "@majsterio/validators",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  }
}
```

**Step 3: Utwórz tsconfig.json**

Create `packages/validators/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 4: Utwórz src/index.ts (placeholder)**

Create `packages/validators/src/index.ts`:
```typescript
// @majsterio/validators - Zod schemas
export * from './client'
export * from './quote'
export * from './template'
```

**Step 5: Commit**

```bash
git add packages/validators/
git commit -m "chore: add packages/validators scaffold"
```

---

## Task 7: Validators - Client

**Files:**
- Create: `packages/validators/src/client.ts`

**Step 1: Utwórz client.ts**

Create `packages/validators/src/client.ts`:
```typescript
import { z } from 'zod'

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'Imię jest wymagane').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane').max(100),
  phone: z.string().max(20).optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

export const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateClientSchema = z.infer<typeof createClientSchema>
export type UpdateClientSchema = z.infer<typeof updateClientSchema>
```

**Step 2: Zainstaluj zod**

Run: `pnpm install`

**Step 3: Sprawdź typy**

Run: `cd packages/validators && pnpm check-types`
Expected: No errors (może być błąd bo brakuje innych plików - to OK na razie)

**Step 4: Commit**

```bash
git add packages/validators/
git commit -m "feat(validators): add Client schemas"
```

---

## Task 8: Validators - Quote

**Files:**
- Create: `packages/validators/src/quote.ts`

**Step 1: Utwórz quote.ts**

Create `packages/validators/src/quote.ts`:
```typescript
import { z } from 'zod'

export const quantitySourceSchema = z.enum(['walls', 'ceiling', 'floor', 'walls_ceiling', 'manual'])

export const createQuoteServiceSchema = z.object({
  name: z.string().min(1, 'Nazwa usługi jest wymagana').max(200),
  quantity: z.number().positive('Ilość musi być większa od 0'),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().min(0, 'Cena nie może być ujemna'),
  quantitySource: quantitySourceSchema,
})

export const createQuoteGroupSchema = z.object({
  name: z.string().min(1, 'Nazwa grupy jest wymagana').max(100),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  manualM2: z.number().positive().optional(),
  services: z.array(createQuoteServiceSchema).min(1, 'Dodaj co najmniej jedną usługę'),
})

export const createQuoteMaterialSchema = z.object({
  groupId: z.string().uuid().optional(),
  name: z.string().min(1, 'Nazwa materiału jest wymagana').max(200),
  quantity: z.number().positive('Ilość musi być większa od 0'),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().min(0, 'Cena nie może być ujemna'),
})

export const createQuoteSchema = z.object({
  clientId: z.string().uuid('Nieprawidłowy ID klienta'),
  notesBefore: z.string().optional(),
  notesAfter: z.string().optional(),
  disclaimer: z.string().optional(),
  showDisclaimer: z.boolean().optional().default(true),
  groups: z.array(createQuoteGroupSchema).min(1, 'Dodaj co najmniej jedną grupę'),
  materials: z.array(createQuoteMaterialSchema).optional(),
})

export type CreateQuoteSchema = z.infer<typeof createQuoteSchema>
export type CreateQuoteGroupSchema = z.infer<typeof createQuoteGroupSchema>
export type CreateQuoteServiceSchema = z.infer<typeof createQuoteServiceSchema>
export type CreateQuoteMaterialSchema = z.infer<typeof createQuoteMaterialSchema>
```

**Step 2: Sprawdź typy**

Run: `cd packages/validators && pnpm check-types`
Expected: No errors (może być błąd bo brakuje template.ts)

**Step 3: Commit**

```bash
git add packages/validators/
git commit -m "feat(validators): add Quote schemas"
```

---

## Task 9: Validators - Template

**Files:**
- Create: `packages/validators/src/template.ts`

**Step 1: Utwórz template.ts**

Create `packages/validators/src/template.ts`:
```typescript
import { z } from 'zod'
import { quantitySourceSchema } from './quote'

export const createServiceTemplateSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(200),
  defaultPrice: z.number().min(0).optional(),
  unit: z.string().min(1).max(20),
  quantitySource: quantitySourceSchema,
  category: z.string().max(50).optional(),
})

export const createMaterialTemplateSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(200),
  defaultPrice: z.number().min(0).optional(),
  unit: z.string().min(1).max(20),
  consumption: z.number().positive().optional(),
  linkedServiceIds: z.array(z.string().uuid()).optional(),
})

export type CreateServiceTemplateSchema = z.infer<typeof createServiceTemplateSchema>
export type CreateMaterialTemplateSchema = z.infer<typeof createMaterialTemplateSchema>
```

**Step 2: Sprawdź typy**

Run: `cd packages/validators && pnpm check-types`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/validators/
git commit -m "feat(validators): add Template schemas"
```

---

## Task 10: Utworzenie packages/db (Drizzle schema)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/schema.ts`

**Step 1: Utwórz katalog i package.json**

```bash
mkdir -p packages/db/src
```

**Step 2: Utwórz package.json**

Create `packages/db/package.json`:
```json
{
  "name": "@majsterio/db",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "~5.9.2"
  },
  "peerDependencies": {
    "postgres": "^3.4.0"
  }
}
```

**Step 3: Utwórz tsconfig.json**

Create `packages/db/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 4: Utwórz src/index.ts**

Create `packages/db/src/index.ts`:
```typescript
// @majsterio/db - Drizzle schema
export * from './schema'
```

**Step 5: Commit**

```bash
git add packages/db/
git commit -m "chore: add packages/db scaffold"
```

---

## Task 11: Drizzle Schema - wszystkie tabele

**Files:**
- Create: `packages/db/src/schema.ts`

**Step 1: Utwórz schema.ts**

Create `packages/db/src/schema.ts`:
```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  serial,
  index,
} from 'drizzle-orm/pg-core'

// ========== CLIENTS ==========

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  siteAddress: text('site_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('clients_user_id_idx').on(table.userId),
])

// ========== QUOTES ==========

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  number: serial('number'),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  notesBefore: text('notes_before'),
  notesAfter: text('notes_after'),
  disclaimer: text('disclaimer'),
  showDisclaimer: boolean('show_disclaimer').default(true).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  syncedAt: timestamp('synced_at'),
}, (table) => [
  index('quotes_user_id_idx').on(table.userId),
  index('quotes_client_id_idx').on(table.clientId),
])

// ========== QUOTE GROUPS ==========

export const quoteGroups = pgTable('quote_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  length: decimal('length', { precision: 6, scale: 2 }),
  width: decimal('width', { precision: 6, scale: 2 }),
  height: decimal('height', { precision: 6, scale: 2 }),
  wallsM2: decimal('walls_m2', { precision: 8, scale: 2 }),
  ceilingM2: decimal('ceiling_m2', { precision: 8, scale: 2 }),
  floorM2: decimal('floor_m2', { precision: 8, scale: 2 }),
  manualM2: decimal('manual_m2', { precision: 8, scale: 2 }),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_groups_quote_id_idx').on(table.quoteId),
])

// ========== QUOTE SERVICES ==========

export const quoteServices = pgTable('quote_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => quoteGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  quantitySource: varchar('quantity_source', { length: 20 }).default('manual').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_services_group_id_idx').on(table.groupId),
])

// ========== QUOTE MATERIALS ==========

export const quoteMaterials = pgTable('quote_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => quoteGroups.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_materials_quote_id_idx').on(table.quoteId),
])

// ========== SERVICE TEMPLATES ==========

export const serviceTemplates = pgTable('service_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  defaultPrice: decimal('default_price', { precision: 10, scale: 2 }),
  unit: varchar('unit', { length: 20 }).notNull(),
  quantitySource: varchar('quantity_source', { length: 20 }).default('manual').notNull(),
  category: varchar('category', { length: 50 }),
  isSystem: boolean('is_system').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('service_templates_user_id_idx').on(table.userId),
])

// ========== MATERIAL TEMPLATES ==========

export const materialTemplates = pgTable('material_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  defaultPrice: decimal('default_price', { precision: 10, scale: 2 }),
  unit: varchar('unit', { length: 20 }).notNull(),
  consumption: decimal('consumption', { precision: 8, scale: 4 }),
  linkedServiceIds: text('linked_service_ids'), // JSON array
  isSystem: boolean('is_system').default(false).notNull(),
}, (table) => [
  index('material_templates_user_id_idx').on(table.userId),
])

// ========== USER SETTINGS ==========

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  businessName: varchar('business_name', { length: 200 }),
  businessLogo: text('business_logo'),
  defaultDisclaimer: text('default_disclaimer'),
  showDisclaimerByDefault: boolean('show_disclaimer_default').default(true).notNull(),
  tradeType: varchar('trade_type', { length: 50 }),
})

// ========== SUBSCRIPTIONS ==========

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  tier: varchar('tier', { length: 20 }).default('free').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  quotesThisMonth: integer('quotes_this_month').default(0).notNull(),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  externalId: varchar('external_id', { length: 100 }),
  provider: varchar('provider', { length: 20 }),
})
```

**Step 2: Zainstaluj zależności**

Run: `pnpm install`

**Step 3: Sprawdź typy**

Run: `cd packages/db && pnpm check-types`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/db/
git commit -m "feat(db): add complete Drizzle schema"
```

---

## Task 12: Utworzenie branchy dla streamów

**Step 1: Sprawdź status git**

Run: `git status`
Expected: Clean working directory

**Step 2: Utwórz branch dla API**

```bash
git branch feat/api-foundation
```

**Step 3: Utwórz branch dla Mobile**

```bash
git branch feat/mobile-foundation
```

**Step 4: Wylistuj branche**

Run: `git branch -a`
Expected: main, feat/api-foundation, feat/mobile-foundation

**Step 5: Push branchy (opcjonalnie)**

```bash
git push -u origin feat/api-foundation
git push -u origin feat/mobile-foundation
```

**Step 6: Commit do main (zaktualizuj PLAN.md)**

Update `docs/PLAN.md` - zaznacz checkboxy Fazy 0:
```markdown
### Faza 0: Setup Wspólny (PRZED podziałem)
- [x] Utworzenie packages/shared/types/*.ts
- [x] Utworzenie packages/validators/*.ts
- [x] Utworzenie packages/db/schema.ts
- [x] Git branches: feat/api-foundation, feat/mobile-foundation
```

```bash
git add docs/PLAN.md
git commit -m "docs: mark Faza 0 as complete"
```

---

## Execution Complete

Po zakończeniu Fazy 0:

**Stream A (Backend):**
```bash
git checkout feat/api-foundation
# Kontynuuj z docs/plans/stream-a-backend.md
```

**Stream B (Mobile):**
```bash
git checkout feat/mobile-foundation
# Kontynuuj z docs/plans/stream-b-mobile.md
```
