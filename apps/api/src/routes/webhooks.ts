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
        if (firstKey) processedEvents.delete(firstKey)
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
