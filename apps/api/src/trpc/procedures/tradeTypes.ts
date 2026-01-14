import { router, publicProcedure } from '../trpc.js'
import { tradeTypes } from '@majsterio/db'

export const tradeTypesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(tradeTypes).orderBy(tradeTypes.sortOrder)
  }),
})
