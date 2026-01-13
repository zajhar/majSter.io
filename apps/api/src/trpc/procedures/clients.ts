import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc.js'
import { clients } from '@majsterio/db'
import { createClientSchema, updateClientSchema } from '@majsterio/validators'

export const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(clients)
      .where(eq(clients.userId, ctx.user.id))
      .orderBy(desc(clients.createdAt))

    return result
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .select()
        .from(clients)
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))

      return client ?? null
    }),

  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .insert(clients)
        .values({
          userId: ctx.user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          siteAddress: input.siteAddress,
          notes: input.notes,
        })
        .returning()

      return client
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateClientSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .update(clients)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))
        .returning()

      return client
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(clients)
        .where(and(
          eq(clients.id, input.id),
          eq(clients.userId, ctx.user.id)
        ))

      return { success: true }
    }),
})
