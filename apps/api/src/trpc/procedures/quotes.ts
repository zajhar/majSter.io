import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { quotes, quoteGroups, quoteServices, quoteMaterials } from '@majsterio/db'
import { createQuoteSchema } from '@majsterio/validators'

// Helper to calculate m² from dimensions
function calculateM2(length?: number, width?: number, height?: number) {
  if (!length || !width) return { wallsM2: null, ceilingM2: null, floorM2: null }

  const floorM2 = length * width
  const ceilingM2 = floorM2
  const wallsM2 = height ? 2 * (length + width) * height : null

  return { wallsM2, ceilingM2, floorM2 }
}

// Helper to get quantity based on source
function getQuantity(source: string, group: { wallsM2: number | null; ceilingM2: number | null; floorM2: number | null; manualM2: number | null }, manualQuantity: number): number {
  switch (source) {
    case 'walls': return group.wallsM2 ?? manualQuantity
    case 'ceiling': return group.ceilingM2 ?? manualQuantity
    case 'floor': return group.floorM2 ?? manualQuantity
    case 'walls_ceiling': return (group.wallsM2 ?? 0) + (group.ceilingM2 ?? 0) || manualQuantity
    default: return manualQuantity
  }
}

export const quotesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, ctx.user.id))
      .orderBy(desc(quotes.createdAt))

    return result
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [quote] = await ctx.db
        .select()
        .from(quotes)
        .where(and(
          eq(quotes.id, input.id),
          eq(quotes.userId, ctx.user.id)
        ))

      if (!quote) return null

      // Fetch groups
      const groups = await ctx.db
        .select()
        .from(quoteGroups)
        .where(eq(quoteGroups.quoteId, quote.id))
        .orderBy(quoteGroups.sortOrder)

      // Fetch services for each group
      const groupsWithServices = await Promise.all(
        groups.map(async (group) => {
          const services = await ctx.db
            .select()
            .from(quoteServices)
            .where(eq(quoteServices.groupId, group.id))
            .orderBy(quoteServices.sortOrder)

          return { ...group, services }
        })
      )

      // Fetch materials
      const materials = await ctx.db
        .select()
        .from(quoteMaterials)
        .where(eq(quoteMaterials.quoteId, quote.id))
        .orderBy(quoteMaterials.sortOrder)

      return {
        ...quote,
        groups: groupsWithServices,
        materials,
      }
    }),

  create: protectedProcedure
    .input(createQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Create quote
      const [quote] = await ctx.db
        .insert(quotes)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          notesBefore: input.notesBefore,
          notesAfter: input.notesAfter,
          disclaimer: input.disclaimer,
          showDisclaimer: input.showDisclaimer ?? true,
        })
        .returning()

      let totalSum = 0

      // Create groups and services
      for (let i = 0; i < input.groups.length; i++) {
        const groupInput = input.groups[i]
        const m2 = calculateM2(groupInput.length, groupInput.width, groupInput.height)

        const [group] = await ctx.db
          .insert(quoteGroups)
          .values({
            quoteId: quote.id,
            name: groupInput.name,
            length: groupInput.length?.toString(),
            width: groupInput.width?.toString(),
            height: groupInput.height?.toString(),
            wallsM2: m2.wallsM2?.toString(),
            ceilingM2: m2.ceilingM2?.toString(),
            floorM2: m2.floorM2?.toString(),
            manualM2: groupInput.manualM2?.toString(),
            sortOrder: i,
          })
          .returning()

        // Create services
        for (let j = 0; j < groupInput.services.length; j++) {
          const serviceInput = groupInput.services[j]
          const quantity = getQuantity(
            serviceInput.quantitySource,
            {
              wallsM2: m2.wallsM2,
              ceilingM2: m2.ceilingM2,
              floorM2: m2.floorM2,
              manualM2: groupInput.manualM2 ?? null
            },
            serviceInput.quantity
          )
          const total = quantity * serviceInput.pricePerUnit
          totalSum += total

          await ctx.db.insert(quoteServices).values({
            groupId: group.id,
            name: serviceInput.name,
            quantity: quantity.toString(),
            unit: serviceInput.unit,
            pricePerUnit: serviceInput.pricePerUnit.toString(),
            total: total.toString(),
            quantitySource: serviceInput.quantitySource,
            sortOrder: j,
          })
        }
      }

      // Create materials
      if (input.materials) {
        for (let i = 0; i < input.materials.length; i++) {
          const materialInput = input.materials[i]
          const total = materialInput.quantity * materialInput.pricePerUnit
          totalSum += total

          await ctx.db.insert(quoteMaterials).values({
            quoteId: quote.id,
            groupId: materialInput.groupId,
            name: materialInput.name,
            quantity: materialInput.quantity.toString(),
            unit: materialInput.unit,
            pricePerUnit: materialInput.pricePerUnit.toString(),
            total: total.toString(),
            sortOrder: i,
          })
        }
      }

      // Update quote total
      await ctx.db
        .update(quotes)
        .set({ total: totalSum.toString() })
        .where(eq(quotes.id, quote.id))

      return { ...quote, total: totalSum.toString() }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(quotes)
        .where(and(
          eq(quotes.id, input.id),
          eq(quotes.userId, ctx.user.id)
        ))

      return { success: true }
    }),
})
