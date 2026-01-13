import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from '../trpc/index.js'

const trpcPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  })
}

export default fp(trpcPlugin, {
  name: 'trpc',
})
