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
