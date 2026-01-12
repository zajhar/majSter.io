import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db'
import { auth } from '../lib/auth'

export interface User {
  id: string
  email: string
  name: string
}

export interface Context {
  req: FastifyRequest
  res: FastifyReply
  db: typeof db
  user: User | null
}

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }): Promise<Context> {
  let user: User | null = null

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
  } catch {
    // No session, user stays null
  }

  return {
    req,
    res,
    db,
    user,
  }
}
