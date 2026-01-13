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
