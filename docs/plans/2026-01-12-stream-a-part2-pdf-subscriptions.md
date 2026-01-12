# Stream A Part 2: PDF Generation & Subscription Logic

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dodanie generowania PDF wycen oraz pełnej logiki subskrypcji z RevenueCat do istniejącego API.

**Architecture:** PDF generowany server-side z react-pdf (@react-pdf/renderer), opcjonalnie upload do S3/Cloudflare R2. RevenueCat webhooks dla real-time subscription updates.

**Tech Stack:** @react-pdf/renderer, RevenueCat Server API, Cloudflare R2 (opcjonalnie)

**Branch:** `feat/api-foundation` (kontynuacja)

**Prerequisites:** Stream A Part 1 ukończony (A1-A3 + A4.1)

---

## A4: PDF Generation

### Task A4.3: Setup @react-pdf/renderer

**Files:**
- Modify: `apps/api/package.json`
- Create: `apps/api/src/lib/pdf/styles.ts`

**Step 1: Dodaj dependencies**

Update `apps/api/package.json` dependencies:
```json
{
  "dependencies": {
    "@react-pdf/renderer": "^4.3.0"
  }
}
```

Run: `pnpm install`

**Step 2: Utwórz lib/pdf katalog**

```bash
mkdir -p apps/api/src/lib/pdf
```

**Step 3: Utwórz styles.ts**

Create `apps/api/src/lib/pdf/styles.ts`:
```typescript
import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  quoteNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clientInfo: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientAddress: {
    fontSize: 11,
    color: '#6b7280',
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 10,
  },
  notes: {
    fontSize: 10,
    color: '#374151',
    padding: 10,
    backgroundColor: '#fefce8',
    marginBottom: 15,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#dbeafe',
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  groupM2: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colName: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'right',
  },
  colUnit: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  disclaimer: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})
```

**Step 4: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add @react-pdf/renderer and PDF styles"
```

---

### Task A4.4: PDF Template Component

**Files:**
- Create: `apps/api/src/lib/pdf/QuotePdfTemplate.tsx`

**Step 1: Utwórz QuotePdfTemplate.tsx**

Create `apps/api/src/lib/pdf/QuotePdfTemplate.tsx`:
```typescript
import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles } from './styles'
import { DEFAULT_DISCLAIMER } from '@majsterio/shared'

interface Client {
  firstName: string
  lastName: string
  siteAddress?: string | null
}

interface Service {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface Group {
  name: string
  wallsM2?: string | null
  ceilingM2?: string | null
  floorM2?: string | null
  services: Service[]
}

interface Material {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface QuoteData {
  number: number
  total: string
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  createdAt: Date
  client: Client
  groups: Group[]
  materials: Material[]
}

interface Props {
  quote: QuoteData
  isPro?: boolean
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function QuotePdfTemplate({ quote, isPro = false }: Props) {
  const disclaimerText = quote.disclaimer ?? DEFAULT_DISCLAIMER

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Majsterio</Text>
          <Text style={styles.quoteNumber}>WYCENA #{quote.number}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {quote.client.firstName} {quote.client.lastName}
          </Text>
          {quote.client.siteAddress && (
            <Text style={styles.clientAddress}>{quote.client.siteAddress}</Text>
          )}
          <Text style={styles.date}>Data: {formatDate(quote.createdAt)}</Text>
        </View>

        {/* Notes Before */}
        {quote.notesBefore && (
          <View style={styles.section}>
            <Text style={styles.notes}>{quote.notesBefore}</Text>
          </View>
        )}

        {/* Groups with Services */}
        {quote.groups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <View style={styles.groupHeader}>
              <Text>
                {group.name}
                {group.floorM2 && (
                  <Text style={styles.groupM2}> ({formatCurrency(group.floorM2)} m²)</Text>
                )}
              </Text>
            </View>

            {/* Services Table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colName, styles.headerText]}>Usługa</Text>
                <Text style={[styles.colQty, styles.headerText]}>Ilość</Text>
                <Text style={[styles.colUnit, styles.headerText]}>J.m.</Text>
                <Text style={[styles.colPrice, styles.headerText]}>Cena</Text>
                <Text style={[styles.colTotal, styles.headerText]}>Wartość</Text>
              </View>

              {group.services.map((service, serviceIndex) => (
                <View key={serviceIndex} style={styles.tableRow}>
                  <Text style={styles.colName}>{service.name}</Text>
                  <Text style={styles.colQty}>{formatCurrency(service.quantity)}</Text>
                  <Text style={styles.colUnit}>{service.unit}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(service.pricePerUnit)} zł</Text>
                  <Text style={styles.colTotal}>{formatCurrency(service.total)} zł</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Materials */}
        {quote.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MATERIAŁY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colName, styles.headerText]}>Materiał</Text>
                <Text style={[styles.colQty, styles.headerText]}>Ilość</Text>
                <Text style={[styles.colUnit, styles.headerText]}>J.m.</Text>
                <Text style={[styles.colPrice, styles.headerText]}>Cena</Text>
                <Text style={[styles.colTotal, styles.headerText]}>Wartość</Text>
              </View>

              {quote.materials.map((material, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.colName}>{material.name}</Text>
                  <Text style={styles.colQty}>{formatCurrency(material.quantity)}</Text>
                  <Text style={styles.colUnit}>{material.unit}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(material.pricePerUnit)} zł</Text>
                  <Text style={styles.colTotal}>{formatCurrency(material.total)} zł</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>SUMA:</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.total)} zł</Text>
        </View>

        {/* Notes After */}
        {quote.notesAfter && (
          <View style={styles.section}>
            <Text style={styles.notes}>{quote.notesAfter}</Text>
          </View>
        )}

        {/* Disclaimer */}
        {quote.showDisclaimer && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>WARUNKI:</Text>
            <Text style={styles.disclaimerText}>{disclaimerText}</Text>
          </View>
        )}

        {/* Footer */}
        {!isPro && (
          <Text style={styles.footer}>
            Wygenerowano w Majsterio (darmowa wersja) • majsterio.pl
          </Text>
        )}
      </Page>
    </Document>
  )
}
```

**Step 2: Commit**

```bash
git add apps/api/src/lib/pdf/
git commit -m "feat(api): add QuotePdfTemplate component"
```

---

### Task A4.5: PDF Generation Service

**Files:**
- Create: `apps/api/src/lib/pdf/index.ts`

**Step 1: Utwórz lib/pdf/index.ts**

Create `apps/api/src/lib/pdf/index.ts`:
```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePdfTemplate } from './QuotePdfTemplate'
import React from 'react'

interface Client {
  firstName: string
  lastName: string
  siteAddress?: string | null
}

interface Service {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface Group {
  name: string
  wallsM2?: string | null
  ceilingM2?: string | null
  floorM2?: string | null
  services: Service[]
}

interface Material {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface QuoteData {
  number: number
  total: string
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  createdAt: Date
  client: Client
  groups: Group[]
  materials: Material[]
}

export async function generateQuotePdf(quote: QuoteData, isPro: boolean = false): Promise<Buffer> {
  const element = React.createElement(QuotePdfTemplate, { quote, isPro })
  const buffer = await renderToBuffer(element)
  return Buffer.from(buffer)
}

export { QuotePdfTemplate }
```

**Step 2: Commit**

```bash
git add apps/api/src/lib/pdf/
git commit -m "feat(api): add PDF generation service"
```

---

### Task A4.6: Quotes generatePdf procedure

**Files:**
- Modify: `apps/api/src/trpc/procedures/quotes.ts`

**Step 1: Dodaj generatePdf procedure**

Add to `apps/api/src/trpc/procedures/quotes.ts` (before the closing `})`:
```typescript
  generatePdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch quote with all relations
      const [quote] = await ctx.db
        .select()
        .from(quotes)
        .where(and(
          eq(quotes.id, input.id),
          eq(quotes.userId, ctx.user.id)
        ))

      if (!quote) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quote not found' })
      }

      // Fetch client
      const [client] = await ctx.db
        .select()
        .from(clients)
        .where(eq(clients.id, quote.clientId))

      if (!client) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' })
      }

      // Fetch groups with services
      const groupsData = await ctx.db
        .select()
        .from(quoteGroups)
        .where(eq(quoteGroups.quoteId, quote.id))
        .orderBy(quoteGroups.sortOrder)

      const groupsWithServices = await Promise.all(
        groupsData.map(async (group) => {
          const services = await ctx.db
            .select()
            .from(quoteServices)
            .where(eq(quoteServices.groupId, group.id))
            .orderBy(quoteServices.sortOrder)

          return { ...group, services }
        })
      )

      // Fetch materials
      const materialsData = await ctx.db
        .select()
        .from(quoteMaterials)
        .where(eq(quoteMaterials.quoteId, quote.id))
        .orderBy(quoteMaterials.sortOrder)

      // Check subscription for pro status
      const [subscription] = await ctx.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))

      const isPro = subscription?.tier !== 'free'

      // Generate PDF
      const { generateQuotePdf } = await import('../lib/pdf')

      const pdfBuffer = await generateQuotePdf({
        number: quote.number,
        total: quote.total,
        notesBefore: quote.notesBefore,
        notesAfter: quote.notesAfter,
        disclaimer: quote.disclaimer,
        showDisclaimer: quote.showDisclaimer,
        createdAt: quote.createdAt,
        client: {
          firstName: client.firstName,
          lastName: client.lastName,
          siteAddress: client.siteAddress,
        },
        groups: groupsWithServices,
        materials: materialsData,
      }, isPro)

      // Return as base64
      return {
        filename: `wycena-${quote.number}.pdf`,
        data: pdfBuffer.toString('base64'),
        mimeType: 'application/pdf',
      }
    }),
```

**Step 2: Dodaj importy na górze pliku**

Add at top of `apps/api/src/trpc/procedures/quotes.ts`:
```typescript
import { TRPCError } from '@trpc/server'
import { clients, subscriptions } from '@majsterio/db'
```

**Step 3: Commit**

```bash
git add apps/api/src/trpc/procedures/quotes.ts
git commit -m "feat(api): add quotes.generatePdf procedure"
```

---

## A5: Subscription Logic

### Task A5.1: RevenueCat webhook endpoint

**Files:**
- Create: `apps/api/src/routes/webhooks.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/.env.example`

**Step 1: Utwórz routes/webhooks.ts**

Create `apps/api/src/routes/webhooks.ts`:
```typescript
import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { subscriptions } from '@majsterio/db'

const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET

interface RevenueCatEvent {
  event: {
    type: string
    app_user_id: string
    product_id: string
    expiration_at_ms?: number
  }
}

export async function registerWebhooks(app: FastifyInstance) {
  app.post('/webhooks/revenuecat', async (req, reply) => {
    // Verify webhook secret
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const body = req.body as RevenueCatEvent
    const { type, app_user_id, product_id, expiration_at_ms } = body.event

    const db = getDb()

    try {
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
              externalId: body.event.app_user_id,
              provider: 'revenuecat',
            })
            .where(eq(subscriptions.userId, app_user_id))

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

          break
        }

        case 'BILLING_ISSUE': {
          await db
            .update(subscriptions)
            .set({
              status: 'past_due',
            })
            .where(eq(subscriptions.userId, app_user_id))

          break
        }

        case 'SUBSCRIBER_ALIAS': {
          // Handle user ID alias - update externalId
          break
        }
      }

      return reply.send({ received: true })
    } catch (error) {
      req.log.error(error, 'RevenueCat webhook error')
      return reply.status(500).send({ error: 'Internal error' })
    }
  })
}
```

**Step 2: Zaktualizuj index.ts**

Add to `apps/api/src/index.ts` after auth handler:
```typescript
import { registerWebhooks } from './routes/webhooks'

// ... existing code ...

// Webhooks
await registerWebhooks(fastify)
```

**Step 3: Zaktualizuj .env.example**

Add to `apps/api/.env.example`:
```env
# RevenueCat
REVENUECAT_WEBHOOK_SECRET=your-revenuecat-webhook-secret
```

**Step 4: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add RevenueCat webhook endpoint"
```

---

### Task A5.2: Subscription middleware for tRPC

**Files:**
- Modify: `apps/api/src/trpc/trpc.ts`
- Create: `apps/api/src/lib/subscription.ts`

**Step 1: Utwórz lib/subscription.ts**

Create `apps/api/src/lib/subscription.ts`:
```typescript
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { subscriptions } from '@majsterio/db'
import { SUBSCRIPTION_LIMITS } from '@majsterio/shared'

export async function getSubscriptionStatus(userId: string) {
  const db = getDb()

  let [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))

  // Create default subscription if not exists
  if (!subscription) {
    [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        tier: 'free',
        status: 'active',
        quotesThisMonth: 0,
      })
      .returning()
  }

  const tier = subscription.tier as keyof typeof SUBSCRIPTION_LIMITS
  const limits = SUBSCRIPTION_LIMITS[tier]

  return {
    subscription,
    limits,
    canCreateQuote: subscription.quotesThisMonth < limits.quotesPerMonth,
    quotesRemaining: limits.quotesPerMonth === Infinity
      ? Infinity
      : limits.quotesPerMonth - subscription.quotesThisMonth,
  }
}

export async function incrementQuoteCount(userId: string) {
  const db = getDb()

  await db
    .update(subscriptions)
    .set({
      quotesThisMonth: db.raw`quotes_this_month + 1`,
    })
    .where(eq(subscriptions.userId, userId))
}
```

**Step 2: Dodaj paidProcedure do trpc.ts**

Add to `apps/api/src/trpc/trpc.ts`:
```typescript
import { getSubscriptionStatus } from '../lib/subscription'

// ... existing code ...

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

**Step 3: Export paidProcedure**

Update `apps/api/src/trpc/index.ts`:
```typescript
export { router, publicProcedure, protectedProcedure, paidProcedure } from './trpc'
```

**Step 4: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add subscription middleware and paidProcedure"
```

---

### Task A5.3: Apply subscription limits to quotes.create

**Files:**
- Modify: `apps/api/src/trpc/procedures/quotes.ts`

**Step 1: Zmień quotes.create na paidProcedure**

Update `apps/api/src/trpc/procedures/quotes.ts`:

Change import:
```typescript
import { router, protectedProcedure, paidProcedure } from '../trpc'
```

Change `create` procedure to use `paidProcedure`:
```typescript
  create: paidProcedure
    .input(createQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      // ... existing implementation ...

      // After successful creation, increment quote count
      const { incrementQuoteCount } = await import('../lib/subscription')
      await incrementQuoteCount(ctx.user.id)

      return { ...quote, total: totalSum.toString() }
    }),
```

**Step 2: Commit**

```bash
git add apps/api/src/trpc/
git commit -m "feat(api): enforce subscription limits on quote creation"
```

---

### Task A5.4: Monthly quota reset job

**Files:**
- Create: `apps/api/src/jobs/resetQuotas.ts`
- Modify: `apps/api/package.json`

**Step 1: Utwórz jobs/resetQuotas.ts**

Create `apps/api/src/jobs/resetQuotas.ts`:
```typescript
import { getDb } from '../db'
import { subscriptions } from '@majsterio/db'

export async function resetMonthlyQuotas() {
  const db = getDb()

  await db
    .update(subscriptions)
    .set({
      quotesThisMonth: 0,
    })

  console.log('Monthly quotas reset successfully')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetMonthlyQuotas()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
```

**Step 2: Dodaj script do package.json**

Add to `apps/api/package.json` scripts:
```json
{
  "scripts": {
    "job:reset-quotas": "tsx src/jobs/resetQuotas.ts"
  }
}
```

**Step 3: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add monthly quota reset job"
```

---

## Summary

Stream A Part 2 po ukończeniu zawiera:
- ✅ PDF generation z @react-pdf/renderer
- ✅ QuotePdfTemplate z polskim formatowaniem
- ✅ quotes.generatePdf procedure
- ✅ RevenueCat webhook endpoint
- ✅ Subscription middleware (paidProcedure)
- ✅ Quote limits enforcement
- ✅ Monthly quota reset job

**Deploy notes:**
1. Add `REVENUECAT_WEBHOOK_SECRET` to Railway env
2. Configure RevenueCat webhook URL: `https://api.majsterio.pl/webhooks/revenuecat`
3. Setup cron job for `pnpm --filter api job:reset-quotas` (1st of month)

**Next:** Stream B (Mobile) lub dodatkowe features (logo upload, S3 storage).
