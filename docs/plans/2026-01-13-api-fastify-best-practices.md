# API Fastify Best Practices Refactoring Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Majsterio API to follow Fastify best practices for production-readiness, focusing on error handling, performance, and observability.

**Architecture:** Transform from ad-hoc patterns to plugin-based Fastify architecture with proper error boundaries, structured logging, database connection management, and request lifecycle hooks.

**Tech Stack:** Fastify 5, tRPC 11, Drizzle ORM, Pino (Fastify's built-in logger), Zod

**Branch:** `refactor/api-best-practices`

---

## Phase 1: Foundation - Error Handling & Logging

### Task 1.1: Configure Fastify Logger with Pino

**Files:**
- Modify: `apps/api/src/index.ts`

**Step 1: Update Fastify configuration with proper logging**

Replace the current Fastify initialization in `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from './trpc/index.js'
import { auth } from './lib/auth.js'
import { registerWebhooks } from './routes/webhooks.js'

const isProduction = process.env.NODE_ENV === 'production'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    ...(isProduction ? {} : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
  requestIdHeader: 'x-request-id',
  genReqId: (req) => req.headers['x-request-id'] as string || crypto.randomUUID(),
})
```

**Step 2: Add pino-pretty as dev dependency**

Run: `pnpm --filter api add -D pino-pretty`

**Step 3: Verify logger works**

Run: `pnpm --filter api dev`
Expected: Colored log output with timestamps in development

**Step 4: Commit**

```bash
git add apps/api/
git commit -m "feat(api): configure Fastify logger with Pino"
```

---

### Task 1.2: Add Global Error Handler

**Files:**
- Modify: `apps/api/src/index.ts`

**Step 1: Add error handler after Fastify initialization**

Add after the `fastify` const in `apps/api/src/index.ts`:
```typescript
// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error({
    err: error,
    requestId: request.id,
    url: request.url,
    method: request.method,
  }, 'Unhandled error')

  // Don't expose internal errors in production
  const statusCode = error.statusCode ?? 500
  const message = statusCode >= 500 && isProduction
    ? 'Internal Server Error'
    : error.message

  reply.status(statusCode).send({
    error: {
      message,
      statusCode,
      requestId: request.id,
    },
  })
})

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  request.log.warn({
    requestId: request.id,
    url: request.url,
    method: request.method,
  }, 'Route not found')

  reply.status(404).send({
    error: {
      message: 'Route not found',
      statusCode: 404,
      requestId: request.id,
    },
  })
})
```

**Step 2: Verify error handling**

Run: `curl http://localhost:3001/nonexistent`
Expected: `{"error":{"message":"Route not found","statusCode":404,"requestId":"..."}}`

**Step 3: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat(api): add global error and not-found handlers"
```

---

### Task 1.3: Add Request Lifecycle Hooks

**Files:**
- Modify: `apps/api/src/index.ts`

**Step 1: Add request logging hooks**

Add after error handlers in `apps/api/src/index.ts`:
```typescript
// Request logging
fastify.addHook('onRequest', async (request) => {
  request.log.info({
    requestId: request.id,
    url: request.url,
    method: request.method,
    userAgent: request.headers['user-agent'],
  }, 'Incoming request')
})

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({
    requestId: request.id,
    url: request.url,
    method: request.method,
    statusCode: reply.statusCode,
    responseTime: reply.elapsedTime,
  }, 'Request completed')
})
```

**Step 2: Verify request logging**

Run: `curl http://localhost:3001/health`
Expected: See "Incoming request" and "Request completed" logs

**Step 3: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat(api): add request lifecycle logging hooks"
```

---

## Phase 2: Database & Graceful Shutdown

### Task 2.1: Refactor Database Connection with Proper Cleanup

**Files:**
- Modify: `apps/api/src/db/index.ts`

**Step 1: Rewrite database module with connection management**

Replace `apps/api/src/db/index.ts`:
```typescript
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
```

**Step 2: Verify database connection**

Run: `pnpm --filter api dev`
Expected: No errors on startup

**Step 3: Commit**

```bash
git add apps/api/src/db/index.ts
git commit -m "refactor(api): add database connection pooling and cleanup"
```

---

### Task 2.2: Add Graceful Shutdown

**Files:**
- Modify: `apps/api/src/index.ts`

**Step 1: Import closeDb**

Add to imports in `apps/api/src/index.ts`:
```typescript
import { closeDb } from './db/index.js'
```

**Step 2: Replace start function with graceful shutdown**

Replace the `start` function and its call at the end of `apps/api/src/index.ts`:
```typescript
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Received shutdown signal')

  try {
    await fastify.close()
    fastify.log.info('Fastify server closed')

    await closeDb()
    fastify.log.info('Database connection closed')

    process.exit(0)
  } catch (err) {
    fastify.log.error(err, 'Error during shutdown')
    process.exit(1)
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
```

**Step 3: Test graceful shutdown**

Run: Start server with `pnpm --filter api dev`, then press Ctrl+C
Expected: See "Received shutdown signal", "Fastify server closed", "Database connection closed"

**Step 4: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat(api): add graceful shutdown with database cleanup"
```

---

## Phase 3: tRPC Error Handling & Logging

### Task 3.1: Add tRPC Error Formatter

**Files:**
- Modify: `apps/api/src/trpc/trpc.ts`

**Step 1: Add error formatter to tRPC initialization**

Replace `apps/api/src/trpc/trpc.ts`:
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context.js'
import { getSubscriptionStatus } from '../lib/subscription.js'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error, ctx }) {
    // Log the error with request context
    if (ctx?.req) {
      ctx.req.log.error({
        error: error.message,
        code: error.code,
        path: shape.data?.path,
        requestId: ctx.req.id,
      }, 'tRPC error')
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        requestId: ctx?.req?.id,
      },
    }
  },
})

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

export const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { canCreateQuote, quotesRemaining } = await getSubscriptionStatus(ctx.user.id)

  if (!canCreateQuote) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Przekroczono limit wycen. Pozostało: ${quotesRemaining}. Przejdź na Pro!`,
    })
  }

  return next({ ctx })
})
```

**Step 2: Verify error formatting**

Test by triggering an unauthorized request
Expected: Error logged with requestId, response includes requestId

**Step 3: Commit**

```bash
git add apps/api/src/trpc/trpc.ts
git commit -m "feat(api): add tRPC error formatter with logging"
```

---

### Task 3.2: Fix Silent Error Handling in Context

**Files:**
- Modify: `apps/api/src/trpc/context.ts`

**Step 1: Fix silent catch block**

Replace `apps/api/src/trpc/context.ts`:
```typescript
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { getDb } from '../db/index.js'
import { auth } from '../lib/auth.js'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const db = getDb()

  let user: { id: string; email: string; name: string } | null = null

  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    })

    if (session?.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || '',
      }
    }
  } catch (error) {
    // Log auth errors but don't fail the request - user will be null
    req.log.warn({
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    }, 'Failed to get user session')
  }

  return {
    req,
    res,
    db,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

**Step 2: Verify auth errors are logged**

Run: `pnpm --filter api dev`
Expected: Auth failures now logged instead of silently swallowed

**Step 3: Commit**

```bash
git add apps/api/src/trpc/context.ts
git commit -m "fix(api): log auth errors instead of silently swallowing"
```

---

## Phase 4: Performance - Fix N+1 Queries

### Task 4.1: Fix N+1 in quotes.byId

**Files:**
- Modify: `apps/api/src/trpc/procedures/quotes.ts`

**Step 1: Add efficient query for quote with relations**

Add helper function after imports in `apps/api/src/trpc/procedures/quotes.ts`:
```typescript
// Efficient query to fetch quote with all relations
async function fetchQuoteWithRelations(db: Database, quoteId: string, userId: string) {
  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(
      eq(quotes.id, quoteId),
      eq(quotes.userId, userId)
    ))

  if (!quote) return null

  // Fetch all data in parallel instead of sequential loops
  const [groupsData, materialsData] = await Promise.all([
    db
      .select()
      .from(quoteGroups)
      .where(eq(quoteGroups.quoteId, quote.id))
      .orderBy(quoteGroups.sortOrder),
    db
      .select()
      .from(quoteMaterials)
      .where(eq(quoteMaterials.quoteId, quote.id))
      .orderBy(quoteMaterials.sortOrder),
  ])

  // Get all group IDs and fetch services in one query
  const groupIds = groupsData.map(g => g.id)
  const servicesData = groupIds.length > 0
    ? await db
        .select()
        .from(quoteServices)
        .where(inArray(quoteServices.groupId, groupIds))
        .orderBy(quoteServices.sortOrder)
    : []

  // Group services by groupId
  const servicesByGroup = new Map<string, typeof servicesData>()
  for (const service of servicesData) {
    const existing = servicesByGroup.get(service.groupId) || []
    existing.push(service)
    servicesByGroup.set(service.groupId, existing)
  }

  const groupsWithServices = groupsData.map(group => ({
    ...group,
    services: servicesByGroup.get(group.id) || [],
  }))

  return {
    ...quote,
    groups: groupsWithServices,
    materials: materialsData,
  }
}
```

**Step 2: Add inArray import**

Update imports at top of file:
```typescript
import { eq, and, desc, inArray } from 'drizzle-orm'
```

**Step 3: Add Database type import**

Add after other imports:
```typescript
import type { Database } from '../../db/index.js'
```

**Step 4: Replace byId procedure**

Replace the `byId` procedure:
```typescript
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return fetchQuoteWithRelations(ctx.db, input.id, ctx.user.id)
    }),
```

**Step 5: Verify query count reduction**

Run: Enable query logging and call byId
Expected: 3-4 queries instead of N+1 queries

**Step 6: Commit**

```bash
git add apps/api/src/trpc/procedures/quotes.ts
git commit -m "perf(api): fix N+1 query in quotes.byId using parallel fetching"
```

---

### Task 4.2: Fix N+1 in quotes.generatePdf

**Files:**
- Modify: `apps/api/src/trpc/procedures/quotes.ts`

**Step 1: Refactor generatePdf to use fetchQuoteWithRelations**

Replace the `generatePdf` procedure:
```typescript
  generatePdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch quote with all relations efficiently
      const quoteData = await fetchQuoteWithRelations(ctx.db, input.id, ctx.user.id)

      if (!quoteData) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quote not found' })
      }

      // Fetch client
      const [client] = await ctx.db
        .select()
        .from(clients)
        .where(eq(clients.id, quoteData.clientId))

      if (!client) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' })
      }

      // Check subscription for pro status
      const [subscription] = await ctx.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))

      const isPro = subscription?.tier !== 'free'

      // Generate PDF
      const { generateQuotePdf } = await import('../../lib/pdf/index.js')

      const pdfBuffer = await generateQuotePdf({
        number: quoteData.number,
        total: quoteData.total,
        notesBefore: quoteData.notesBefore,
        notesAfter: quoteData.notesAfter,
        disclaimer: quoteData.disclaimer,
        showDisclaimer: quoteData.showDisclaimer,
        createdAt: quoteData.createdAt,
        client: {
          firstName: client.firstName,
          lastName: client.lastName,
          siteAddress: client.siteAddress,
        },
        groups: quoteData.groups,
        materials: quoteData.materials,
      }, isPro)

      // Return as base64
      return {
        filename: `wycena-${quoteData.number}.pdf`,
        data: pdfBuffer.toString('base64'),
        mimeType: 'application/pdf',
      }
    }),
```

**Step 2: Verify generatePdf works**

Run: Test PDF generation endpoint
Expected: PDF generated successfully with reduced queries

**Step 3: Commit**

```bash
git add apps/api/src/trpc/procedures/quotes.ts
git commit -m "perf(api): fix N+1 query in quotes.generatePdf"
```

---

## Phase 5: Webhook Security

### Task 5.1: Add Webhook Request Validation

**Files:**
- Modify: `apps/api/src/routes/webhooks.ts`

**Step 1: Add Zod schema for webhook validation**

Replace `apps/api/src/routes/webhooks.ts`:
```typescript
import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/index.js'
import { subscriptions } from '@majsterio/db'

const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET

// Zod schema for webhook validation
const revenueCatEventSchema = z.object({
  event: z.object({
    type: z.string(),
    app_user_id: z.string(),
    product_id: z.string(),
    expiration_at_ms: z.number().optional(),
    id: z.string().optional(), // Event ID for idempotency
  }),
})

type RevenueCatEvent = z.infer<typeof revenueCatEventSchema>

// Simple in-memory idempotency cache (use Redis in production)
const processedEvents = new Set<string>()
const MAX_CACHE_SIZE = 10000

export async function registerWebhooks(app: FastifyInstance) {
  app.post('/webhooks/revenuecat', async (req, reply) => {
    const requestId = req.id

    // Verify webhook secret
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
      req.log.warn({ requestId }, 'Webhook unauthorized attempt')
      return reply.status(401).send({
        error: 'Unauthorized',
        requestId,
      })
    }

    // Validate request body
    const parseResult = revenueCatEventSchema.safeParse(req.body)
    if (!parseResult.success) {
      req.log.warn({
        requestId,
        errors: parseResult.error.errors,
      }, 'Webhook validation failed')
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parseResult.error.errors,
        requestId,
      })
    }

    const body = parseResult.data
    const { type, app_user_id, product_id, expiration_at_ms, id: eventId } = body.event

    // Idempotency check
    if (eventId) {
      if (processedEvents.has(eventId)) {
        req.log.info({ requestId, eventId }, 'Duplicate webhook event, skipping')
        return reply.send({ received: true, duplicate: true, requestId })
      }

      // Add to cache with size limit
      if (processedEvents.size >= MAX_CACHE_SIZE) {
        const firstKey = processedEvents.values().next().value
        processedEvents.delete(firstKey)
      }
      processedEvents.add(eventId)
    }

    const db = getDb()

    try {
      req.log.info({
        requestId,
        eventType: type,
        userId: app_user_id,
        eventId,
      }, 'Processing webhook event')

      switch (type) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'PRODUCT_CHANGE': {
          const tier = product_id.includes('pro_ai') ? 'pro_ai' : 'pro'
          const periodEnd = expiration_at_ms ? new Date(expiration_at_ms) : null

          await db
            .update(subscriptions)
            .set({
              tier,
              status: 'active',
              periodEnd,
              externalId: app_user_id,
              provider: 'revenuecat',
            })
            .where(eq(subscriptions.userId, app_user_id))

          req.log.info({ requestId, userId: app_user_id, tier }, 'Subscription activated')
          break
        }

        case 'CANCELLATION':
        case 'EXPIRATION': {
          await db
            .update(subscriptions)
            .set({
              status: 'cancelled',
            })
            .where(eq(subscriptions.userId, app_user_id))

          req.log.info({ requestId, userId: app_user_id }, 'Subscription cancelled')
          break
        }

        case 'BILLING_ISSUE': {
          await db
            .update(subscriptions)
            .set({
              status: 'past_due',
            })
            .where(eq(subscriptions.userId, app_user_id))

          req.log.info({ requestId, userId: app_user_id }, 'Subscription billing issue')
          break
        }

        case 'SUBSCRIBER_ALIAS': {
          req.log.info({ requestId, userId: app_user_id }, 'Subscriber alias event (no-op)')
          break
        }

        default:
          req.log.warn({ requestId, eventType: type }, 'Unknown webhook event type')
      }

      return reply.send({ received: true, requestId })
    } catch (error) {
      req.log.error({
        err: error,
        requestId,
        eventType: type,
        userId: app_user_id,
      }, 'Webhook processing error')

      return reply.status(500).send({
        error: 'Internal error',
        requestId,
      })
    }
  })
}
```

**Step 2: Verify webhook validation**

Test: Send invalid JSON to webhook endpoint
Expected: 400 response with validation errors

**Step 3: Commit**

```bash
git add apps/api/src/routes/webhooks.ts
git commit -m "feat(api): add webhook validation, idempotency, and structured logging"
```

---

## Phase 6: Plugin Architecture

### Task 6.1: Convert to Plugin-Based Architecture

**Files:**
- Create: `apps/api/src/plugins/auth.ts`
- Create: `apps/api/src/plugins/trpc.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create auth plugin**

Create `apps/api/src/plugins/auth.ts`:
```typescript
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { auth } from '../lib/auth.js'

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.all('/api/auth/*', async (req, reply) => {
    const response = await auth.handler(req.raw)

    response.headers.forEach((value: string, key: string) => {
      reply.header(key, value)
    })

    reply.status(response.status)

    if (response.body) {
      const text = await response.text()
      return reply.send(text)
    }

    return reply.send()
  })
}

export default fp(authPlugin, {
  name: 'auth',
})
```

**Step 2: Create tRPC plugin**

Create `apps/api/src/plugins/trpc.ts`:
```typescript
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from '../trpc/index.js'

const trpcPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  })
}

export default fp(trpcPlugin, {
  name: 'trpc',
})
```

**Step 3: Add fastify-plugin dependency**

Run: `pnpm --filter api add fastify-plugin`

**Step 4: Update index.ts to use plugins**

Replace plugin registrations in `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { closeDb } from './db/index.js'
import authPlugin from './plugins/auth.js'
import trpcPlugin from './plugins/trpc.js'
import { registerWebhooks } from './routes/webhooks.js'

const isProduction = process.env.NODE_ENV === 'production'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    ...(isProduction ? {} : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
  requestIdHeader: 'x-request-id',
  genReqId: (req) => req.headers['x-request-id'] as string || crypto.randomUUID(),
})

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error({
    err: error,
    requestId: request.id,
    url: request.url,
    method: request.method,
  }, 'Unhandled error')

  const statusCode = error.statusCode ?? 500
  const message = statusCode >= 500 && isProduction
    ? 'Internal Server Error'
    : error.message

  reply.status(statusCode).send({
    error: {
      message,
      statusCode,
      requestId: request.id,
    },
  })
})

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  request.log.warn({
    requestId: request.id,
    url: request.url,
    method: request.method,
  }, 'Route not found')

  reply.status(404).send({
    error: {
      message: 'Route not found',
      statusCode: 404,
      requestId: request.id,
    },
  })
})

// Request logging
fastify.addHook('onRequest', async (request) => {
  request.log.info({
    requestId: request.id,
    url: request.url,
    method: request.method,
    userAgent: request.headers['user-agent'],
  }, 'Incoming request')
})

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({
    requestId: request.id,
    url: request.url,
    method: request.method,
    statusCode: reply.statusCode,
    responseTime: reply.elapsedTime,
  }, 'Request completed')
})

// Register plugins
await fastify.register(cors, { origin: true })
await fastify.register(authPlugin)
await fastify.register(trpcPlugin)

// Routes
await registerWebhooks(fastify)

// Health endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Server lifecycle
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Received shutdown signal')

  try {
    await fastify.close()
    fastify.log.info('Fastify server closed')

    await closeDb()
    fastify.log.info('Database connection closed')

    process.exit(0)
  } catch (err) {
    fastify.log.error(err, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
```

**Step 5: Verify plugins load correctly**

Run: `pnpm --filter api dev`
Expected: Server starts with all plugins registered

**Step 6: Commit**

```bash
git add apps/api/
git commit -m "refactor(api): convert to plugin-based Fastify architecture"
```

---

## Phase 7: Final Cleanup

### Task 7.1: Update .env.example with New Variables

**Files:**
- Modify: `apps/api/.env.example`

**Step 1: Add new environment variables**

Update `apps/api/.env.example`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/majsterio
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# RevenueCat
REVENUECAT_WEBHOOK_SECRET=your-revenuecat-webhook-secret
```

**Step 2: Commit**

```bash
git add apps/api/.env.example
git commit -m "docs(api): update .env.example with all environment variables"
```

---

### Task 7.2: Run Full Verification

**Step 1: Run type check**

Run: `pnpm --filter api check-types`
Note: Pre-existing drizzle version mismatch errors will persist until that's fixed

**Step 2: Start server and test**

Run: `pnpm --filter api dev`

Test endpoints:
- `curl http://localhost:3001/health`
- `curl http://localhost:3001/nonexistent` (should return 404 with requestId)

**Step 3: Final commit**

```bash
git add .
git commit -m "chore(api): complete Fastify best practices refactoring"
```

---

## Summary

After completing this plan, the API will have:

1. **Structured Logging** - Pino with request IDs, pretty printing in dev
2. **Global Error Handling** - Consistent error responses with request correlation
3. **Request Lifecycle Hooks** - Logging for all requests
4. **Database Connection Management** - Pooling, timeouts, graceful cleanup
5. **Graceful Shutdown** - Proper cleanup of server and database
6. **tRPC Error Formatting** - Logged errors with request context
7. **Fixed N+1 Queries** - Parallel fetching instead of loops
8. **Webhook Security** - Zod validation, idempotency, structured logging
9. **Plugin Architecture** - Modular, testable Fastify plugins

**Known Remaining Issues (out of scope):**
- Drizzle ORM version mismatch (requires dependency audit)
- Missing .js extensions in some imports (TypeScript config issue)
- No pagination on list endpoints (separate task)
- No rate limiting (separate security task)
