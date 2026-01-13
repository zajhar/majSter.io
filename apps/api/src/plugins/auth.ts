import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { auth } from '../lib/auth.js'

const authPlugin: FastifyPluginAsync = async (fastify) => {
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
