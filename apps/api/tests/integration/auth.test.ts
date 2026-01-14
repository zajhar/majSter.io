import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestApp } from '../helpers/app.js'
import { getDb } from '../helpers/db.js'
import type { FastifyInstance } from 'fastify'
import { sql } from 'drizzle-orm'

describe('Auth Endpoints', () => {
  let app: FastifyInstance
  const testEmail = `auth-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    // Cleanup test user from Better Auth tables
    const db = getDb()
    try {
      await db.execute(sql`DELETE FROM "user" WHERE email = ${testEmail}`)
    } catch {
      // Table might not exist or user not created
    }
    await app.close()
  })

  describe('POST /api/auth/sign-up/email', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: testEmail,
          password: testPassword,
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(200)

      const body = response.json()
      expect(body.user).toBeDefined()
      expect(body.user.email).toBe(testEmail)
      expect(body.user.name).toBe('Test User')
      expect(body.user.id).toBeDefined()
    })

    it('should reject duplicate email registration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: testEmail,
          password: testPassword,
          name: 'Another User',
        },
      })

      // Better Auth returns 422 or 400 for duplicate email
      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })

    it('should reject registration with weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: `weak-pwd-${Date.now()}@example.com`,
          password: '123', // Too short
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })

    it('should reject registration with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: 'not-an-email',
          password: testPassword,
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })

    it('should reject registration without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: `missing-fields-${Date.now()}@example.com`,
          // Missing password
        },
      })

      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /api/auth/sign-in/email', () => {
    it('should sign in with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      })

      expect(response.statusCode).toBe(200)

      const body = response.json()
      expect(body.user).toBeDefined()
      expect(body.user.email).toBe(testEmail)

      // Better Auth sets session in cookies
      const setCookie = response.headers['set-cookie']
      expect(setCookie).toBeDefined()
    })

    it('should reject sign-in with wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: {
          email: testEmail,
          password: 'WrongPassword123!',
        },
      })

      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })

    it('should reject sign-in with non-existent email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: {
          email: 'nonexistent@example.com',
          password: testPassword,
        },
      })

      expect(response.statusCode).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /api/auth/get-session', () => {
    let sessionCookie: string

    beforeEach(async () => {
      // Sign in to get a session
      const signInResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      })

      // Extract session cookie
      const setCookieHeader = signInResponse.headers['set-cookie']
      if (Array.isArray(setCookieHeader)) {
        sessionCookie = setCookieHeader.join('; ')
      } else if (setCookieHeader) {
        sessionCookie = setCookieHeader
      }
    })

    it('should return session for authenticated user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/get-session',
        headers: {
          cookie: sessionCookie,
        },
      })

      expect(response.statusCode).toBe(200)

      const body = response.json()
      expect(body.session).toBeDefined()
      expect(body.user).toBeDefined()
      expect(body.user.email).toBe(testEmail)
    })

    it('should return null session for unauthenticated request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/get-session',
      })

      expect(response.statusCode).toBe(200)

      const body = response.json()
      // Better Auth returns null or { session: null } when not authenticated
      expect(body === null || body?.session === null).toBe(true)
    })
  })

  describe('POST /api/auth/sign-out', () => {
    it('should sign out authenticated user', async () => {
      // First sign in
      const signInResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      })

      const setCookieHeader = signInResponse.headers['set-cookie']
      let sessionCookie: string
      if (Array.isArray(setCookieHeader)) {
        sessionCookie = setCookieHeader.join('; ')
      } else if (setCookieHeader) {
        sessionCookie = setCookieHeader
      } else {
        sessionCookie = ''
      }

      // Sign out
      const signOutResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-out',
        headers: {
          cookie: sessionCookie,
        },
      })

      expect(signOutResponse.statusCode).toBe(200)

      // Verify session is invalidated by checking get-session returns null
      const sessionResponse = await app.inject({
        method: 'GET',
        url: '/api/auth/get-session',
        headers: {
          cookie: sessionCookie,
        },
      })

      expect(sessionResponse.statusCode).toBe(200)
      const sessionBody = sessionResponse.json()
      // After sign-out, session should be null (Better Auth returns null or { session: null })
      expect(sessionBody === null || sessionBody?.session === null).toBe(true)
    })
  })
})

describe('Auth + tRPC Integration', () => {
  let app: FastifyInstance
  const testEmail = `trpc-auth-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  beforeAll(async () => {
    app = await createTestApp()

    // Register test user
    await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      payload: {
        email: testEmail,
        password: testPassword,
        name: 'tRPC Test User',
      },
    })
  })

  afterAll(async () => {
    // Cleanup
    const db = getDb()
    try {
      await db.execute(sql`DELETE FROM "user" WHERE email = ${testEmail}`)
    } catch {
      // Ignore
    }
    await app.close()
  })

  it('should access protected tRPC endpoints with valid session', async () => {
    // Sign in
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      payload: {
        email: testEmail,
        password: testPassword,
      },
    })

    const setCookieHeader = signInResponse.headers['set-cookie']
    let sessionCookie: string
    if (Array.isArray(setCookieHeader)) {
      sessionCookie = setCookieHeader.join('; ')
    } else if (setCookieHeader) {
      sessionCookie = setCookieHeader
    } else {
      sessionCookie = ''
    }

    // Call protected tRPC endpoint (clients.list)
    const trpcResponse = await app.inject({
      method: 'GET',
      url: '/trpc/clients.list',
      headers: {
        cookie: sessionCookie,
      },
    })

    expect(trpcResponse.statusCode).toBe(200)

    const body = trpcResponse.json()
    expect(body.result).toBeDefined()
    expect(body.result.data).toBeDefined()
    expect(Array.isArray(body.result.data)).toBe(true)
  })

  it('should reject protected tRPC endpoints without session', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/trpc/clients.list',
    })

    // tRPC returns 401 wrapped in JSON
    const body = response.json()
    expect(body.error).toBeDefined()
    expect(body.error.data.code).toBe('UNAUTHORIZED')
  })
})
