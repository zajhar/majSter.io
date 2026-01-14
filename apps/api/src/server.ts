import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env from monorepo root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { buildApp } from './app.js'
import { closeDb } from './db/index.js'
import { validateEnv } from './env.js'

// Validate environment variables on startup
validateEnv()

const app = await buildApp()

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Received shutdown signal')

  try {
    await app.close()
    app.log.info('Fastify server closed')

    await closeDb()
    app.log.info('Database connection closed')

    process.exit(0)
  } catch (err) {
    app.log.error(err, 'Error during shutdown')
    process.exit(1)
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Start server
try {
  const port = Number(process.env.PORT) || 3001
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`Server running on port ${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
