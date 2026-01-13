import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { getDb } from '../db/index.js'
import { auth } from '../lib/auth.js'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const db = getDb()

  let user: { id: string; email: string; name: string } | null = null

  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    })

    if (session?.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || '',
      }
    }
  } catch (error) {
    // Log auth errors but don't fail the request - user will be null
    req.log.warn({
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    }, 'Failed to get user session')
  }

  return {
    req,
    res,
    db,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
