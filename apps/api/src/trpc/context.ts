import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db'

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
  // TODO: Add auth session lookup here
  const user: User | null = null

  return {
    req,
    res,
    db,
    user,
  }
}
