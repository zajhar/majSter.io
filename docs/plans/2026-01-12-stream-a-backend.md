# Stream A: Backend (API) - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Zbudowanie kompletnego API z Fastify + tRPC + Better Auth + Drizzle, zdeplojowanego na Railway.

**Architecture:** Fastify jako HTTP server, tRPC dla type-safe RPC, Better Auth dla autentykacji, Drizzle ORM dla PostgreSQL. Wszystko w `apps/api`.

**Tech Stack:** Fastify, tRPC, Better Auth, Drizzle ORM, PostgreSQL, Railway

**Branch:** `feat/api-foundation`

**Prerequisites:** Faza 0 ukończona (packages/shared, validators, db)

---

## A1: Fundament API

### Task A1.1: Setup Fastify z TypeScript

**Files:**
- Modify: `apps/api/package.json`
- Create: `apps/api/src/index.ts`

**Step 1: Zaktualizuj package.json**

Update `apps/api/package.json`:
```json
{
  "name": "api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@majsterio/db": "workspace:*",
    "@majsterio/shared": "workspace:*",
    "@majsterio/validators": "workspace:*",
    "fastify": "^5.2.0",
    "@fastify/cors": "^10.0.0",
    "drizzle-orm": "^0.38.0",
    "postgres": "^3.4.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "drizzle-kit": "^0.30.0",
    "tsx": "^4.19.0",
    "typescript": "~5.9.2"
  }
}
```

**Step 2: Zaktualizuj src/index.ts**

Update `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: true,
})

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

**Step 3: Zainstaluj zależności**

Run: `pnpm install`

**Step 4: Uruchom dev server**

Run: `pnpm --filter api dev`
Expected: Server running on port 3001

**Step 5: Test health endpoint**

Run: `curl http://localhost:3001/health`
Expected: `{"status":"ok","timestamp":"..."}`

**Step 6: Commit**

```bash
git add apps/api/
git commit -m "feat(api): setup Fastify with health endpoint"
```

---

### Task A1.2: Setup Drizzle ORM + PostgreSQL connection

**Files:**
- Create: `apps/api/src/db/index.ts`
- Create: `apps/api/drizzle.config.ts`
- Create: `apps/api/.env.example`

**Step 1: Utwórz katalog db**

```bash
mkdir -p apps/api/src/db
```

**Step 2: Utwórz db/index.ts**

Create `apps/api/src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@majsterio/db'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export type Database = typeof db
```

**Step 3: Utwórz drizzle.config.ts**

Create `apps/api/drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../../packages/db/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Step 4: Utwórz .env.example**

Create `apps/api/.env.example`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/majsterio
PORT=3001
```

**Step 5: Utwórz .env (lokalna kopia)**

Create `apps/api/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/majsterio
PORT=3001
```

**Step 6: Dodaj .env do .gitignore**

Append to `apps/api/.gitignore` (create if not exists):
```
.env
```

**Step 7: Commit**

```bash
git add apps/api/src/db/ apps/api/drizzle.config.ts apps/api/.env.example apps/api/.gitignore
git commit -m "feat(api): setup Drizzle ORM with PostgreSQL"
```

---

### Task A1.3: Setup tRPC z Fastify

**Files:**
- Create: `apps/api/src/trpc/trpc.ts`
- Create: `apps/api/src/trpc/context.ts`
- Create: `apps/api/src/trpc/router.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/package.json`

**Step 1: Dodaj tRPC dependencies**

Update `apps/api/package.json` dependencies:
```json
{
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "@trpc/server/adapters/fastify": "^11.0.0"
  }
}
```

Run: `pnpm install`

**Step 2: Utwórz trpc/trpc.ts**

Create `apps/api/src/trpc/trpc.ts`:
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})
```

**Step 3: Utwórz trpc/context.ts**

Create `apps/api/src/trpc/context.ts`:
```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db'

export interface User {
  id: string
  email: string
  name: string
}

export interface Context {
  req: FastifyRequest
  res: FastifyReply
  db: typeof db
  user: User | null
}

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }): Promise<Context> {
  // TODO: Add auth session lookup here
  const user: User | null = null

  return {
    req,
    res,
    db,
    user,
  }
}
```

**Step 4: Utwórz trpc/router.ts**

Create `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure } from './trpc'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),
})

export type AppRouter = typeof appRouter
```

**Step 5: Utwórz trpc/index.ts**

Create `apps/api/src/trpc/index.ts`:
```typescript
export { appRouter, type AppRouter } from './router'
export { createContext, type Context } from './context'
export { router, publicProcedure, protectedProcedure } from './trpc'
```

**Step 6: Zaktualizuj src/index.ts z tRPC**

Update `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from './trpc'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: true,
})

// tRPC
await fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
  },
})

// Legacy health endpoint (keep for Railway health checks)
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

**Step 7: Test tRPC endpoint**

Run: `pnpm --filter api dev`
Run: `curl http://localhost:3001/trpc/health`
Expected: `{"result":{"data":{"status":"ok","timestamp":"..."}}}`

**Step 8: Commit**

```bash
git add apps/api/src/trpc/ apps/api/package.json
git commit -m "feat(api): setup tRPC with Fastify adapter"
```

---

### Task A1.4: Export AppRouter type dla mobile

**Files:**
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/src/index.ts`

**Step 1: Utwórz katalog**

```bash
mkdir -p packages/api-client/src
```

**Step 2: Utwórz package.json**

Create `packages/api-client/package.json`:
```json
{
  "name": "@majsterio/api-client",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "api": "workspace:*"
  }
}
```

**Step 3: Utwórz src/index.ts**

Create `packages/api-client/src/index.ts`:
```typescript
// Re-export AppRouter type for mobile/web clients
export type { AppRouter } from 'api/src/trpc'
```

**Step 4: Commit**

```bash
git add packages/api-client/
git commit -m "feat: add api-client package for tRPC types"
```

---

## A2: Auth (Better Auth)

### Task A2.1: Setup Better Auth

**Files:**
- Create: `apps/api/src/lib/auth.ts`
- Modify: `apps/api/package.json`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/.env.example`

**Step 1: Dodaj Better Auth dependencies**

Update `apps/api/package.json` dependencies:
```json
{
  "dependencies": {
    "better-auth": "^1.2.0"
  }
}
```

Run: `pnpm install`

**Step 2: Utwórz lib/auth.ts**

Create `apps/api/src/lib/auth.ts`:
```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    'exp://*',  // Expo development
    'majsterio://*',  // Production app scheme
  ],
})

export type Auth = typeof auth
```

**Step 3: Zaktualizuj .env.example**

Update `apps/api/.env.example`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/majsterio
PORT=3001

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Step 4: Zarejestruj auth w Fastify**

Update `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from './trpc'
import { auth } from './lib/auth'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: true,
})

// Better Auth handler
fastify.all('/api/auth/*', async (req, reply) => {
  const response = await auth.handler(req.raw)

  // Copy headers
  response.headers.forEach((value, key) => {
    reply.header(key, value)
  })

  reply.status(response.status)

  if (response.body) {
    const text = await response.text()
    return reply.send(text)
  }

  return reply.send()
})

// tRPC
await fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
  },
})

// Health endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

**Step 5: Commit**

```bash
git add apps/api/
git commit -m "feat(api): setup Better Auth with Google OAuth"
```

---

### Task A2.2: Integracja auth z tRPC context

**Files:**
- Modify: `apps/api/src/trpc/context.ts`

**Step 1: Zaktualizuj context.ts**

Update `apps/api/src/trpc/context.ts`:
```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db'
import { auth } from '../lib/auth'

export interface User {
  id: string
  email: string
  name: string
}

export interface Context {
  req: FastifyRequest
  res: FastifyReply
  db: typeof db
  user: User | null
}

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }): Promise<Context> {
  let user: User | null = null

  try {
    const session = await auth.api.getSession({
      headers: req.headers as Headers,
    })

    if (session?.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || '',
      }
    }
  } catch (error) {
    // No session, user stays null
  }

  return {
    req,
    res,
    db,
    user,
  }
}
```

**Step 2: Dodaj auth procedure do routera**

Update `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure, protectedProcedure } from './trpc'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})

export type AppRouter = typeof appRouter
```

**Step 3: Test protected endpoint (should fail without auth)**

Run: `curl http://localhost:3001/trpc/me`
Expected: `{"error":{"message":"Not authenticated","code":"UNAUTHORIZED"}}`

**Step 4: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): integrate Better Auth with tRPC context"
```

---

## A3: Core Procedures

### Task A3.1: Clients procedures

**Files:**
- Create: `apps/api/src/trpc/procedures/clients.ts`
- Modify: `apps/api/src/trpc/router.ts`

**Step 1: Utwórz clients.ts**

Create `apps/api/src/trpc/procedures/clients.ts`:
```typescript
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { clients } from '@majsterio/db'
import { createClientSchema, updateClientSchema } from '@majsterio/validators'

export const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(clients)
      .where(eq(clients.userId, ctx.user.id))
      .orderBy(desc(clients.createdAt))

    return result
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .select()
        .from(clients)
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))

      return client ?? null
    }),

  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .insert(clients)
        .values({
          userId: ctx.user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          siteAddress: input.siteAddress,
          notes: input.notes,
        })
        .returning()

      return client
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateClientSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .update(clients)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))
        .returning()

      return client
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(clients)
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))

      return { success: true }
    }),
})
```

**Step 2: Zaktualizuj router.ts**

Update `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
})

export type AppRouter = typeof appRouter
```

**Step 3: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): add clients CRUD procedures"
```

---

### Task A3.2: Quotes procedures (basic CRUD)

**Files:**
- Create: `apps/api/src/trpc/procedures/quotes.ts`
- Modify: `apps/api/src/trpc/router.ts`

**Step 1: Utwórz quotes.ts**

Create `apps/api/src/trpc/procedures/quotes.ts`:
```typescript
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { quotes, quoteGroups, quoteServices, quoteMaterials } from '@majsterio/db'
import { createQuoteSchema } from '@majsterio/validators'

// Helper to calculate m² from dimensions
function calculateM2(length?: number, width?: number, height?: number) {
  if (!length || !width) return { wallsM2: null, ceilingM2: null, floorM2: null }

  const floorM2 = length * width
  const ceilingM2 = floorM2
  const wallsM2 = height ? 2 * (length + width) * height : null

  return { wallsM2, ceilingM2, floorM2 }
}

// Helper to get quantity based on source
function getQuantity(source: string, group: { wallsM2: number | null; ceilingM2: number | null; floorM2: number | null; manualM2: number | null }, manualQuantity: number): number {
  switch (source) {
    case 'walls': return group.wallsM2 ?? manualQuantity
    case 'ceiling': return group.ceilingM2 ?? manualQuantity
    case 'floor': return group.floorM2 ?? manualQuantity
    case 'walls_ceiling': return (group.wallsM2 ?? 0) + (group.ceilingM2 ?? 0) || manualQuantity
    default: return manualQuantity
  }
}

export const quotesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, ctx.user.id))
      .orderBy(desc(quotes.createdAt))

    return result
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [quote] = await ctx.db
        .select()
        .from(quotes)
        .where(and(
          eq(quotes.id, input.id),
          eq(quotes.userId, ctx.user.id)
        ))

      if (!quote) return null

      // Fetch groups
      const groups = await ctx.db
        .select()
        .from(quoteGroups)
        .where(eq(quoteGroups.quoteId, quote.id))
        .orderBy(quoteGroups.sortOrder)

      // Fetch services for each group
      const groupsWithServices = await Promise.all(
        groups.map(async (group) => {
          const services = await ctx.db
            .select()
            .from(quoteServices)
            .where(eq(quoteServices.groupId, group.id))
            .orderBy(quoteServices.sortOrder)

          return { ...group, services }
        })
      )

      // Fetch materials
      const materials = await ctx.db
        .select()
        .from(quoteMaterials)
        .where(eq(quoteMaterials.quoteId, quote.id))
        .orderBy(quoteMaterials.sortOrder)

      return {
        ...quote,
        groups: groupsWithServices,
        materials,
      }
    }),

  create: protectedProcedure
    .input(createQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Create quote
      const [quote] = await ctx.db
        .insert(quotes)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          notesBefore: input.notesBefore,
          notesAfter: input.notesAfter,
          disclaimer: input.disclaimer,
          showDisclaimer: input.showDisclaimer ?? true,
        })
        .returning()

      let totalSum = 0

      // Create groups and services
      for (let i = 0; i < input.groups.length; i++) {
        const groupInput = input.groups[i]
        const m2 = calculateM2(groupInput.length, groupInput.width, groupInput.height)

        const [group] = await ctx.db
          .insert(quoteGroups)
          .values({
            quoteId: quote.id,
            name: groupInput.name,
            length: groupInput.length?.toString(),
            width: groupInput.width?.toString(),
            height: groupInput.height?.toString(),
            wallsM2: m2.wallsM2?.toString(),
            ceilingM2: m2.ceilingM2?.toString(),
            floorM2: m2.floorM2?.toString(),
            manualM2: groupInput.manualM2?.toString(),
            sortOrder: i,
          })
          .returning()

        // Create services
        for (let j = 0; j < groupInput.services.length; j++) {
          const serviceInput = groupInput.services[j]
          const quantity = getQuantity(
            serviceInput.quantitySource,
            {
              wallsM2: m2.wallsM2,
              ceilingM2: m2.ceilingM2,
              floorM2: m2.floorM2,
              manualM2: groupInput.manualM2 ?? null
            },
            serviceInput.quantity
          )
          const total = quantity * serviceInput.pricePerUnit
          totalSum += total

          await ctx.db.insert(quoteServices).values({
            groupId: group.id,
            name: serviceInput.name,
            quantity: quantity.toString(),
            unit: serviceInput.unit,
            pricePerUnit: serviceInput.pricePerUnit.toString(),
            total: total.toString(),
            quantitySource: serviceInput.quantitySource,
            sortOrder: j,
          })
        }
      }

      // Create materials
      if (input.materials) {
        for (let i = 0; i < input.materials.length; i++) {
          const materialInput = input.materials[i]
          const total = materialInput.quantity * materialInput.pricePerUnit
          totalSum += total

          await ctx.db.insert(quoteMaterials).values({
            quoteId: quote.id,
            groupId: materialInput.groupId,
            name: materialInput.name,
            quantity: materialInput.quantity.toString(),
            unit: materialInput.unit,
            pricePerUnit: materialInput.pricePerUnit.toString(),
            total: total.toString(),
            sortOrder: i,
          })
        }
      }

      // Update quote total
      await ctx.db
        .update(quotes)
        .set({ total: totalSum.toString() })
        .where(eq(quotes.id, quote.id))

      return { ...quote, total: totalSum.toString() }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(quotes)
        .where(and(
          eq(quotes.id, input.id),
          eq(quotes.userId, ctx.user.id)
        ))

      return { success: true }
    }),
})
```

**Step 2: Zaktualizuj router.ts**

Update `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'
import { quotesRouter } from './procedures/quotes'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
  quotes: quotesRouter,
})

export type AppRouter = typeof appRouter
```

**Step 3: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): add quotes CRUD procedures with m² calculations"
```

---

### Task A3.3: Templates procedures

**Files:**
- Create: `apps/api/src/trpc/procedures/templates.ts`
- Modify: `apps/api/src/trpc/router.ts`

**Step 1: Utwórz templates.ts**

Create `apps/api/src/trpc/procedures/templates.ts`:
```typescript
import { z } from 'zod'
import { eq, and, or } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { serviceTemplates, materialTemplates } from '@majsterio/db'
import { createServiceTemplateSchema, createMaterialTemplateSchema } from '@majsterio/validators'

export const templatesRouter = router({
  services: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const result = await ctx.db
        .select()
        .from(serviceTemplates)
        .where(or(
          eq(serviceTemplates.userId, ctx.user.id),
          eq(serviceTemplates.isSystem, true)
        ))
        .orderBy(serviceTemplates.sortOrder)

      return result
    }),

    upsert: protectedProcedure
      .input(z.object({
        id: z.string().uuid().optional(),
        data: createServiceTemplateSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.id) {
          // Update
          const [template] = await ctx.db
            .update(serviceTemplates)
            .set(input.data)
            .where(and(
              eq(serviceTemplates.id, input.id),
              eq(serviceTemplates.userId, ctx.user.id)
            ))
            .returning()
          return template
        } else {
          // Create
          const [template] = await ctx.db
            .insert(serviceTemplates)
            .values({
              userId: ctx.user.id,
              ...input.data,
            })
            .returning()
          return template
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .delete(serviceTemplates)
          .where(and(
            eq(serviceTemplates.id, input.id),
            eq(serviceTemplates.userId, ctx.user.id),
            eq(serviceTemplates.isSystem, false) // Can't delete system templates
          ))
        return { success: true }
      }),
  }),

  materials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const result = await ctx.db
        .select()
        .from(materialTemplates)
        .where(or(
          eq(materialTemplates.userId, ctx.user.id),
          eq(materialTemplates.isSystem, true)
        ))

      return result
    }),

    upsert: protectedProcedure
      .input(z.object({
        id: z.string().uuid().optional(),
        data: createMaterialTemplateSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        const linkedServiceIds = input.data.linkedServiceIds
          ? JSON.stringify(input.data.linkedServiceIds)
          : null

        if (input.id) {
          const [template] = await ctx.db
            .update(materialTemplates)
            .set({
              ...input.data,
              linkedServiceIds,
            })
            .where(and(
              eq(materialTemplates.id, input.id),
              eq(materialTemplates.userId, ctx.user.id)
            ))
            .returning()
          return template
        } else {
          const [template] = await ctx.db
            .insert(materialTemplates)
            .values({
              userId: ctx.user.id,
              ...input.data,
              linkedServiceIds,
            })
            .returning()
          return template
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .delete(materialTemplates)
          .where(and(
            eq(materialTemplates.id, input.id),
            eq(materialTemplates.userId, ctx.user.id),
            eq(materialTemplates.isSystem, false)
          ))
        return { success: true }
      }),
  }),
})
```

**Step 2: Zaktualizuj router.ts**

Update `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'
import { quotesRouter } from './procedures/quotes'
import { templatesRouter } from './procedures/templates'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
  quotes: quotesRouter,
  templates: templatesRouter,
})

export type AppRouter = typeof appRouter
```

**Step 3: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): add templates CRUD procedures"
```

---

### Task A3.4: Subscription procedures

**Files:**
- Create: `apps/api/src/trpc/procedures/subscriptions.ts`
- Modify: `apps/api/src/trpc/router.ts`

**Step 1: Utwórz subscriptions.ts**

Create `apps/api/src/trpc/procedures/subscriptions.ts`:
```typescript
import { eq } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { subscriptions } from '@majsterio/db'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'

export const subscriptionsRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    let [subscription] = await ctx.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))

    // Create default subscription if not exists
    if (!subscription) {
      [subscription] = await ctx.db
        .insert(subscriptions)
        .values({
          userId: ctx.user.id,
          tier: 'free',
          status: 'active',
          quotesThisMonth: 0,
        })
        .returning()
    }

    const tier = subscription.tier as keyof typeof SUBSCRIPTION_LIMITS
    const limits = SUBSCRIPTION_LIMITS[tier]

    return {
      ...subscription,
      limits,
      canCreateQuote: subscription.quotesThisMonth < limits.quotesPerMonth,
      quotesRemaining: limits.quotesPerMonth === Infinity
        ? Infinity
        : limits.quotesPerMonth - subscription.quotesThisMonth,
    }
  }),

  incrementQuoteCount: protectedProcedure.mutation(async ({ ctx }) => {
    const [subscription] = await ctx.db
      .update(subscriptions)
      .set({
        quotesThisMonth: ctx.db.raw`quotes_this_month + 1`,
      })
      .where(eq(subscriptions.userId, ctx.user.id))
      .returning()

    return subscription
  }),
})
```

**Step 2: Zaktualizuj router.ts (final)**

Update `apps/api/src/trpc/router.ts`:
```typescript
import { router, publicProcedure, protectedProcedure } from './trpc'
import { clientsRouter } from './procedures/clients'
import { quotesRouter } from './procedures/quotes'
import { templatesRouter } from './procedures/templates'
import { subscriptionsRouter } from './procedures/subscriptions'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  clients: clientsRouter,
  quotes: quotesRouter,
  templates: templatesRouter,
  subscriptions: subscriptionsRouter,
})

export type AppRouter = typeof appRouter
```

**Step 3: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): add subscriptions procedures"
```

---

## A4: Deploy to Railway

### Task A4.1: Przygotowanie do deployu

**Files:**
- Create: `apps/api/Dockerfile`
- Modify: `apps/api/package.json`

**Step 1: Utwórz Dockerfile**

Create `apps/api/Dockerfile`:
```dockerfile
FROM node:20-slim AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
```

**Step 2: Dodaj script do migracji**

Update `apps/api/package.json` scripts:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  }
}
```

**Step 3: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add Dockerfile and db migration scripts"
```

---

### Task A4.2: Railway setup (manual)

**This is a manual task - document the steps:**

1. Go to railway.app and create new project
2. Add PostgreSQL service
3. Add API service from GitHub repo
4. Set environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Set build command: `pnpm install && pnpm --filter api build`
6. Set start command: `pnpm --filter api start`
7. Run migrations: `pnpm --filter api db:push`

**Step 1: Po deploy - test health**

Run: `curl https://your-app.railway.app/health`
Expected: `{"status":"ok","timestamp":"..."}`

**Step 2: Update docs/PLAN.md**

Mark A1 tasks as complete.

**Step 3: Commit progress**

```bash
git add docs/PLAN.md
git commit -m "docs: mark Stream A - A1 complete"
```

---

## Summary

Stream A po ukończeniu zawiera:
- ✅ Fastify + tRPC + Better Auth
- ✅ Drizzle ORM + PostgreSQL
- ✅ All CRUD procedures (clients, quotes, templates, subscriptions)
- ✅ Railway deployment

**Next:** Stream A może kontynuować z A4 (PDF Generation) i A5 (Subscription Logic) lub czekać na integrację z Stream B.
