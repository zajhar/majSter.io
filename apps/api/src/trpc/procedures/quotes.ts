import { z } from 'zod'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure, paidProcedure } from '../trpc.js'
import { quotes, quoteGroups, quoteServices, quoteMaterials, clients, subscriptions } from '@majsterio/db'
import { createQuoteSchema, updateQuoteSchema } from '@majsterio/validators'
import { incrementQuoteCount } from '../../lib/subscription.js'
import type { Database } from '../../db/index.js'

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

// Efficient query to fetch quote with all relations
async function fetchQuoteWithRelations(db: Database, quoteId: string, userId: string) {
  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(
      eq(quotes.id, quoteId),
      eq(quotes.userId, userId)
    ))

  if (!quote) return null

  // Fetch all data in parallel instead of sequential loops
  const [groupsData, materialsData] = await Promise.all([
    db
      .select()
      .from(quoteGroups)
      .where(eq(quoteGroups.quoteId, quote.id))
      .orderBy(quoteGroups.sortOrder),
    db
      .select()
      .from(quoteMaterials)
      .where(eq(quoteMaterials.quoteId, quote.id))
      .orderBy(quoteMaterials.sortOrder),
  ])

  // Get all group IDs and fetch services in one query
  const groupIds = groupsData.map(g => g.id)
  const servicesData = groupIds.length > 0
    ? await db
        .select()
        .from(quoteServices)
        .where(inArray(quoteServices.groupId, groupIds))
        .orderBy(quoteServices.sortOrder)
    : []

  // Group services by groupId
  const servicesByGroup = new Map<string, typeof servicesData>()
  for (const service of servicesData) {
    const existing = servicesByGroup.get(service.groupId) || []
    existing.push(service)
    servicesByGroup.set(service.groupId, existing)
  }

  const groupsWithServices = groupsData.map(group => ({
    ...group,
    services: servicesByGroup.get(group.id) || [],
  }))

  return {
    ...quote,
    groups: groupsWithServices,
    materials: materialsData,
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
      return fetchQuoteWithRelations(ctx.db, input.id, ctx.user.id)
    }),

  create: paidProcedure
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

      // Increment quote count for subscription
      await incrementQuoteCount(ctx.user.id)

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

  update: protectedProcedure
    .input(updateQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Sprawdź czy wycena należy do użytkownika
      const [existing] = await ctx.db
        .select()
        .from(quotes)
        .where(and(eq(quotes.id, id), eq(quotes.userId, ctx.user.id)))

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quote not found' })
      }

      // Usuń stare grupy, usługi i materiały (cascade usunie services)
      await ctx.db.delete(quoteGroups).where(eq(quoteGroups.quoteId, id))
      await ctx.db.delete(quoteMaterials).where(eq(quoteMaterials.quoteId, id))

      // Aktualizuj podstawowe dane wyceny
      await ctx.db
        .update(quotes)
        .set({
          clientId: data.clientId ?? null,
          notesBefore: data.notesBefore,
          notesAfter: data.notesAfter,
          disclaimer: data.disclaimer,
          showDisclaimer: data.showDisclaimer ?? true,
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, id))

      let totalSum = 0

      // Utwórz nowe grupy i usługi
      for (let i = 0; i < data.groups.length; i++) {
        const groupInput = data.groups[i]
        const m2 = calculateM2(groupInput.length, groupInput.width, groupInput.height)

        const [group] = await ctx.db
          .insert(quoteGroups)
          .values({
            quoteId: id,
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

      // Utwórz nowe materiały
      if (data.materials) {
        for (let i = 0; i < data.materials.length; i++) {
          const materialInput = data.materials[i]
          const total = materialInput.quantity * materialInput.pricePerUnit
          totalSum += total

          await ctx.db.insert(quoteMaterials).values({
            quoteId: id,
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

      // Aktualizuj sumę
      const [updated] = await ctx.db
        .update(quotes)
        .set({ total: totalSum.toString() })
        .where(eq(quotes.id, id))
        .returning()

      return updated
    }),

  generatePdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch quote with all relations efficiently
      const quoteData = await fetchQuoteWithRelations(ctx.db, input.id, ctx.user.id)

      if (!quoteData) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quote not found' })
      }

      // Fetch client (może być null)
      let client: { firstName: string; lastName: string; siteAddress: string | null } | null = null
      if (quoteData.clientId) {
        const [clientData] = await ctx.db
          .select()
          .from(clients)
          .where(eq(clients.id, quoteData.clientId))
        client = clientData ?? null
      }

      // Check subscription for pro status
      const [subscription] = await ctx.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))

      const isPro = subscription?.tier !== 'free'

      // Generate PDF
      const { generateQuotePdf } = await import('../../lib/pdf/index.js')

      const pdfBuffer = await generateQuotePdf({
        number: quoteData.number,
        total: quoteData.total,
        notesBefore: quoteData.notesBefore,
        notesAfter: quoteData.notesAfter,
        disclaimer: quoteData.disclaimer,
        showDisclaimer: quoteData.showDisclaimer,
        createdAt: quoteData.createdAt,
        client: client ? {
          firstName: client.firstName,
          lastName: client.lastName,
          siteAddress: client.siteAddress,
        } : null,
        groups: quoteData.groups,
        materials: quoteData.materials,
      }, isPro)

      // Return as base64
      return {
        filename: `wycena-${quoteData.number}.pdf`,
        data: pdfBuffer.toString('base64'),
        mimeType: 'application/pdf',
      }
    }),
})
