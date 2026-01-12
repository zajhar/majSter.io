import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@majsterio/api-client'

export const trpc = createTRPCReact<AppRouter>()
