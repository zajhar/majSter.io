import { z } from 'zod'
import { eq, and, or } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { serviceTemplates, materialTemplates } from '@majsterio/db'
import { createServiceTemplateSchema, createMaterialTemplateSchema } from '@majsterio/validators'

export const templatesRouter = router({
  services: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const result = await ctx.db
        .select()
        .from(serviceTemplates)
        .where(or(
          eq(serviceTemplates.userId, ctx.user.id),
          eq(serviceTemplates.isSystem, true)
        ))
        .orderBy(serviceTemplates.sortOrder)

      return result
    }),

    upsert: protectedProcedure
      .input(z.object({
        id: z.string().uuid().optional(),
        data: createServiceTemplateSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.id) {
          // Update
          const [template] = await ctx.db
            .update(serviceTemplates)
            .set(input.data)
            .where(and(
              eq(serviceTemplates.id, input.id),
              eq(serviceTemplates.userId, ctx.user.id)
            ))
            .returning()
          return template
        } else {
          // Create
          const [template] = await ctx.db
            .insert(serviceTemplates)
            .values({
              userId: ctx.user.id,
              ...input.data,
            })
            .returning()
          return template
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .delete(serviceTemplates)
          .where(and(
            eq(serviceTemplates.id, input.id),
            eq(serviceTemplates.userId, ctx.user.id),
            eq(serviceTemplates.isSystem, false) // Can't delete system templates
          ))
        return { success: true }
      }),
  }),

  materials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const result = await ctx.db
        .select()
        .from(materialTemplates)
        .where(or(
          eq(materialTemplates.userId, ctx.user.id),
          eq(materialTemplates.isSystem, true)
        ))

      return result
    }),

    upsert: protectedProcedure
      .input(z.object({
        id: z.string().uuid().optional(),
        data: createMaterialTemplateSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        const linkedServiceIds = input.data.linkedServiceIds
          ? JSON.stringify(input.data.linkedServiceIds)
          : null

        if (input.id) {
          const [template] = await ctx.db
            .update(materialTemplates)
            .set({
              ...input.data,
              linkedServiceIds,
            })
            .where(and(
              eq(materialTemplates.id, input.id),
              eq(materialTemplates.userId, ctx.user.id)
            ))
            .returning()
          return template
        } else {
          const [template] = await ctx.db
            .insert(materialTemplates)
            .values({
              userId: ctx.user.id,
              ...input.data,
              linkedServiceIds,
            })
            .returning()
          return template
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .delete(materialTemplates)
          .where(and(
            eq(materialTemplates.id, input.id),
            eq(materialTemplates.userId, ctx.user.id),
            eq(materialTemplates.isSystem, false)
          ))
        return { success: true }
      }),
  }),
})
