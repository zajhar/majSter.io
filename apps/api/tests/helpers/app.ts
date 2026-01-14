import { buildApp, type AppOptions } from '../../src/app.js'
import type { FastifyInstance } from 'fastify'

export async function createTestApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const app = await buildApp({
    logger: false,
    skipRateLimit: true,
    ...opts,
  })

  await app.ready()
  return app
}
