import { z } from 'zod'
import { eq, and, or } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc.js'
import { groupTemplates, groupTemplateServices } from '@majsterio/db'
import { createGroupTemplateSchema } from '@majsterio/validators'

export const groupTemplatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db
      .select()
      .from(groupTemplates)
      .where(or(
        eq(groupTemplates.userId, ctx.user.id),
        eq(groupTemplates.isSystem, true)
      ))
      .orderBy(groupTemplates.isSystem, groupTemplates.sortOrder)

    // Fetch services for each template
    const result = await Promise.all(
      templates.map(async (template) => {
        const services = await ctx.db
          .select()
          .from(groupTemplateServices)
          .where(eq(groupTemplateServices.templateId, template.id))
          .orderBy(groupTemplateServices.sortOrder)

        return {
          ...template,
          services: services.map(s => ({
            ...s,
            pricePerUnit: parseFloat(s.pricePerUnit),
          })),
        }
      })
    )

    return result
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          or(
            eq(groupTemplates.userId, ctx.user.id),
            eq(groupTemplates.isSystem, true)
          )
        ))
        .limit(1)

      if (!template) return null

      const services = await ctx.db
        .select()
        .from(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, template.id))
        .orderBy(groupTemplateServices.sortOrder)

      return {
        ...template,
        services: services.map(s => ({
          ...s,
          pricePerUnit: parseFloat(s.pricePerUnit),
        })),
      }
    }),

  create: protectedProcedure
    .input(createGroupTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .insert(groupTemplates)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          isSystem: false,
        })
        .returning()

      const serviceValues = input.services.map((service, i) => ({
        templateId: template.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: String(service.pricePerUnit),
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return template
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: createGroupTemplateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership (can't edit system templates)
      const [existing] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          eq(groupTemplates.userId, ctx.user.id),
          eq(groupTemplates.isSystem, false)
        ))
        .limit(1)

      if (!existing) {
        throw new Error('Template not found or cannot be edited')
      }

      // Update template
      await ctx.db
        .update(groupTemplates)
        .set({
          name: input.data.name,
          description: input.data.description,
          updatedAt: new Date(),
        })
        .where(eq(groupTemplates.id, input.id))

      // Delete old services and insert new ones
      await ctx.db
        .delete(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, input.id))

      const serviceValues = input.data.services.map((service, i) => ({
        templateId: input.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: String(service.pricePerUnit),
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(groupTemplates)
        .where(and(
          eq(groupTemplates.id, input.id),
          eq(groupTemplates.userId, ctx.user.id),
          eq(groupTemplates.isSystem, false)
        ))

      return { success: true }
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get original template
      const [original] = await ctx.db
        .select()
        .from(groupTemplates)
        .where(eq(groupTemplates.id, input.id))
        .limit(1)

      if (!original) {
        throw new Error('Template not found')
      }

      // Get services
      const services = await ctx.db
        .select()
        .from(groupTemplateServices)
        .where(eq(groupTemplateServices.templateId, input.id))

      // Create copy
      const [newTemplate] = await ctx.db
        .insert(groupTemplates)
        .values({
          userId: ctx.user.id,
          name: `${original.name} (kopia)`,
          description: original.description,
          isSystem: false,
        })
        .returning()

      // Copy services
      const serviceValues = services.map((service, i) => ({
        templateId: newTemplate.id,
        name: service.name,
        unit: service.unit,
        pricePerUnit: service.pricePerUnit,
        quantitySource: service.quantitySource,
        sortOrder: i,
      }))

      await ctx.db.insert(groupTemplateServices).values(serviceValues)

      return newTemplate
    }),
})
