import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc.js'
import { userSettings, userTradeTypes } from '@majsterio/db'

export const userSettingsRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [settings] = await ctx.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1)

    const trades = await ctx.db
      .select()
      .from(userTradeTypes)
      .where(eq(userTradeTypes.userId, ctx.user.id))

    return {
      ...settings,
      tradeTypes: trades.map(t => t.tradeTypeId),
    }
  }),

  setTradeTypes: protectedProcedure
    .input(z.object({ tradeTypeIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Delete existing user trade types
      await ctx.db
        .delete(userTradeTypes)
        .where(eq(userTradeTypes.userId, ctx.user.id))

      // Insert new selections
      await ctx.db.insert(userTradeTypes).values(
        input.tradeTypeIds.map(id => ({
          userId: ctx.user.id,
          tradeTypeId: id,
        }))
      )

      // Ensure user settings exist and mark onboarding as completed
      const [existing] = await ctx.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1)

      if (existing) {
        await ctx.db
          .update(userSettings)
          .set({ onboardingCompleted: true })
          .where(eq(userSettings.userId, ctx.user.id))
      } else {
        await ctx.db.insert(userSettings).values({
          userId: ctx.user.id,
          onboardingCompleted: true,
        })
      }

      return { success: true }
    }),
})
