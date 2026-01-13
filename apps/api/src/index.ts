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

await fastify.register(cors, {
  origin: true,
})

// Better Auth handler - converts Fastify request to Web API Request
fastify.all('/api/auth/*', async (req, reply) => {
  // Construct full URL
  const protocol = req.protocol || 'http'
  const host = req.headers.host || 'localhost'
  const url = new URL(req.url, `${protocol}://${host}`)

  // Convert headers to Web API Headers
  const headers = new Headers()
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      headers.append(key, Array.isArray(value) ? value.join(', ') : value)
    }
  })

  // Create Web API Request
  const webRequest = new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' && req.body
      ? JSON.stringify(req.body)
      : undefined,
  })

  const response = await auth.handler(webRequest)

  // Copy response headers
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

// Webhooks
await registerWebhooks(fastify)

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
    fastify.log.info(`Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
