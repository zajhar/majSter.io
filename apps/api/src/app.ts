import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import compress from '@fastify/compress'
import { sql } from 'drizzle-orm'
import { getDb } from './db/index.js'
import authPlugin from './plugins/auth.js'
import trpcPlugin from './plugins/trpc.js'
import { registerWebhooks } from './routes/webhooks.js'

export interface AppOptions {
  logger?: boolean | object
  skipRateLimit?: boolean
}

export async function buildApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTest = process.env.NODE_ENV === 'test'

  const fastify = Fastify({
    logger: opts.logger ?? (isTest ? false : {
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
    }),
    requestIdHeader: 'x-request-id',
    genReqId: (req) => req.headers['x-request-id'] as string || crypto.randomUUID(),
    requestTimeout: 30000,
  })

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number }

    request.log.error({
      err,
      requestId: request.id,
      url: request.url,
      method: request.method,
    }, 'Unhandled error')

    const statusCode = err.statusCode ?? 500
    const message = statusCode >= 500 && isProduction
      ? 'Internal Server Error'
      : err.message

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
  await fastify.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : false,
  })
  await fastify.register(compress)

  if (!opts.skipRateLimit) {
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    })
  }

  await fastify.register(cors, {
    origin: isProduction
      ? [
          /^exp:\/\/.*/,
          /^majsterio:\/\/.*/,
          process.env.WEB_URL,
        ].filter(Boolean) as (string | RegExp)[]
      : true,
  })
  await fastify.register(authPlugin)
  await fastify.register(trpcPlugin)

  // Routes
  await registerWebhooks(fastify)

  // Health endpoint with DB check and response schema
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            database: { type: 'string' },
          },
          required: ['status', 'timestamp', 'database'],
        },
      },
    },
  }, async () => {
    const db = getDb()
    await db.execute(sql`SELECT 1`)
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }
  })

  return fastify
}
