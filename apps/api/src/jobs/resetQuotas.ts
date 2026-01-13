import { getDb } from '../db/index.js'
import { subscriptions } from '@majsterio/db'

export async function resetMonthlyQuotas() {
  const db = getDb()

  await db
    .update(subscriptions)
    .set({
      quotesThisMonth: 0,
    })

  console.log('Monthly quotas reset successfully')
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  resetMonthlyQuotas()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
