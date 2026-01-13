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

// Graceful shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
