import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '../db'

let _auth: ReturnType<typeof betterAuth> | null = null

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins: [
      'exp://*',  // Expo development
      'majsterio://*',  // Production app scheme
    ],
  })
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_, prop) {
    if (!_auth) {
      _auth = createAuth()
    }
    return _auth[prop as keyof ReturnType<typeof betterAuth>]
  },
})

export type Auth = ReturnType<typeof betterAuth>
