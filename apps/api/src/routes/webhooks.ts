import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/index.js'
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
