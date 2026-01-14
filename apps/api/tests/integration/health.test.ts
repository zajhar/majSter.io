import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp } from '../helpers/app.js'
import type { FastifyInstance } from 'fastify'

describe('Health Endpoint', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 200 with status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)

    const body = response.json()
    expect(body).toMatchObject({
      status: 'ok',
      database: 'connected',
    })
    expect(body.timestamp).toBeDefined()
  })

  it('should return proper content-type', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.headers['content-type']).toContain('application/json')
  })
})

describe('Not Found Handler', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 for unknown routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/unknown-route',
    })

    expect(response.statusCode).toBe(404)

    const body = response.json()
    expect(body.error).toMatchObject({
      message: 'Route not found',
      statusCode: 404,
    })
    expect(body.error.requestId).toBeDefined()
  })
})
