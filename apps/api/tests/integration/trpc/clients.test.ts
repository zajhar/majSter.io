import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TRPCError } from '@trpc/server'
import { createAuthenticatedCaller, createPublicCaller } from '../../helpers/trpc.js'
import { getDb, cleanupTestData, createTestUser } from '../../helpers/db.js'

describe('tRPC Clients Router', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>
  let authenticatedCaller: ReturnType<typeof createAuthenticatedCaller>
  let publicCaller: ReturnType<typeof createPublicCaller>

  beforeAll(async () => {
    testUser = await createTestUser()
    const db = getDb()
    authenticatedCaller = createAuthenticatedCaller(db, testUser.id)
    publicCaller = createPublicCaller(db)
  })

  afterAll(async () => {
    await cleanupTestData(testUser.id)
  })

  describe('list', () => {
    it('should reject unauthenticated requests', async () => {
      await expect(publicCaller.clients.list()).rejects.toThrow(TRPCError)
    })

    it('should return empty array for new user', async () => {
      const clients = await authenticatedCaller.clients.list()
      expect(clients).toEqual([])
    })
  })

  describe('create', () => {
    it('should create a new client', async () => {
      const client = await authenticatedCaller.clients.create({
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '123456789',
      })

      expect(client).toMatchObject({
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '123456789',
      })
      expect(client.id).toBeDefined()
      expect(client.userId).toBe(testUser.id)
    })

    it('should create client with minimal data', async () => {
      const client = await authenticatedCaller.clients.create({
        firstName: 'Anna',
        lastName: 'Nowak',
      })

      expect(client).toMatchObject({
        firstName: 'Anna',
        lastName: 'Nowak',
      })
      expect(client.phone).toBeNull()
    })
  })

  describe('byId', () => {
    it('should return null for non-existent client', async () => {
      const client = await authenticatedCaller.clients.byId({
        id: '00000000-0000-0000-0000-000000000000',
      })
      expect(client).toBeNull()
    })

    it('should return created client', async () => {
      const created = await authenticatedCaller.clients.create({
        firstName: 'Test',
        lastName: 'ById',
      })

      const found = await authenticatedCaller.clients.byId({ id: created.id })
      expect(found).toMatchObject({
        id: created.id,
        firstName: 'Test',
        lastName: 'ById',
      })
    })

    it('should not return other users clients', async () => {
      // Create another user and their client
      const otherUser = await createTestUser()
      const otherCaller = createAuthenticatedCaller(getDb(), otherUser.id)
      const otherClient = await otherCaller.clients.create({
        firstName: 'Other',
        lastName: 'User',
      })

      // Try to access as our test user - should return null
      const result = await authenticatedCaller.clients.byId({ id: otherClient.id })
      expect(result).toBeNull()

      // Cleanup other user's data
      await cleanupTestData(otherUser.id)
    })
  })

  describe('update', () => {
    it('should update client data', async () => {
      const client = await authenticatedCaller.clients.create({
        firstName: 'Before',
        lastName: 'Update',
      })

      const updated = await authenticatedCaller.clients.update({
        id: client.id,
        data: {
          firstName: 'After',
          phone: '999888777',
        },
      })

      expect(updated).toMatchObject({
        id: client.id,
        firstName: 'After',
        lastName: 'Update',
        phone: '999888777',
      })
    })
  })

  describe('delete', () => {
    it('should delete client', async () => {
      const client = await authenticatedCaller.clients.create({
        firstName: 'To',
        lastName: 'Delete',
      })

      const result = await authenticatedCaller.clients.delete({ id: client.id })
      expect(result).toEqual({ success: true })

      // Verify deleted
      const found = await authenticatedCaller.clients.byId({ id: client.id })
      expect(found).toBeNull()
    })
  })
})
