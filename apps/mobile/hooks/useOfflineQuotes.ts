import { useEffect, useState, useCallback } from 'react'
import { trpc } from '../lib/trpc'
import { useSyncStore } from '../stores/syncStore'
import { useAuthStore } from '../stores/authStore'
import {
  addToSyncQueue,
  cacheQuotes,
  cacheQuote,
  getCachedQuotes,
  getCachedQuoteById,
  deleteFromQuotesCache,
} from '../db'
import type { Quote, CreateQuoteInput } from '@majsterio/shared'

// Quote list item type (API returns loose types)
export interface QuoteListItem {
  id: string
  userId: string
  clientId: string
  number: number
  status: string
  notesBefore: string | null
  notesAfter: string | null
  disclaimer: string | null
  showDisclaimer: boolean
  total: number | string
  createdAt: Date | string
  updatedAt: Date | string
  syncedAt: Date | string | null
}

// Generate temporary ID for offline items
function generateTempId(): string {
  return `temp_${Math.random().toString(36).substring(2, 11)}`
}

// Hook for single quote by ID with offline cache fallback
export function useQuoteById(id: string | undefined) {
  const { isOnline } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const [cachedData, setCachedData] = useState<Quote | null>(null)
  const [isLoadingCache, setIsLoadingCache] = useState(true)

  // Online query
  const query = trpc.quotes.byId.useQuery(
    { id: id! },
    { enabled: isOnline && !!id }
  )

  // Cache data when fetched online
  useEffect(() => {
    if (query.data && user?.id) {
      cacheQuote(user.id, query.data)
    }
  }, [query.data, user?.id])

  // Load from cache when offline
  useEffect(() => {
    async function loadCache() {
      if (id) {
        setIsLoadingCache(true)
        const cached = await getCachedQuoteById(id)
        setCachedData(cached as Quote | null)
        setIsLoadingCache(false)
      }
    }
    loadCache()
  }, [id, isOnline])

  return {
    data: isOnline ? query.data : cachedData,
    isLoading: isOnline ? query.isLoading : isLoadingCache,
    isOffline: !isOnline,
  }
}

// Hook for quotes list with offline cache fallback
export function useQuotesList() {
  const { isOnline } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const [cachedData, setCachedData] = useState<QuoteListItem[]>([])
  const [isLoadingCache, setIsLoadingCache] = useState(true)

  // Online query
  const query = trpc.quotes.list.useQuery(undefined, {
    enabled: isOnline,
  })

  // Cache data when fetched online
  useEffect(() => {
    if (query.data && user?.id) {
      cacheQuotes(user.id, query.data as unknown as object[])
    }
  }, [query.data, user?.id])

  // Load from cache when offline or on mount
  useEffect(() => {
    async function loadCache() {
      if (user?.id) {
        setIsLoadingCache(true)
        const cached = await getCachedQuotes(user.id)
        setCachedData(cached as QuoteListItem[])
        setIsLoadingCache(false)
      }
    }
    loadCache()
  }, [user?.id, isOnline])

  return {
    data: isOnline ? query.data : cachedData,
    isLoading: isOnline ? query.isLoading : isLoadingCache,
    isOffline: !isOnline,
    refetch: query.refetch,
  }
}

// Hook for creating quote with offline support
export function useCreateQuote() {
  const { isOnline } = useSyncStore()
  const { updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const utils = trpc.useUtils()

  const mutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate()
    },
  })

  const create = useCallback(
    async (input: CreateQuoteInput): Promise<{ success: boolean; tempId?: string; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: 'Nie jesteś zalogowany' }
      }

      if (isOnline) {
        // Online: send directly to API
        try {
          const result = await mutation.mutateAsync(input)
          // Cache the new quote
          await cacheQuote(user.id, result)
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      } else {
        // Offline: save to cache and queue
        const tempId = generateTempId()

        // Create temporary quote object for cache
        const tempQuote: Quote = {
          id: tempId,
          userId: user.id,
          clientId: input.clientId,
          number: 0, // Will be assigned by server
          status: 'draft',
          notesBefore: input.notesBefore ?? null,
          notesAfter: input.notesAfter ?? null,
          disclaimer: input.disclaimer ?? null,
          showDisclaimer: input.showDisclaimer ?? true,
          total: calculateTotal(input),
          createdAt: new Date(),
          updatedAt: new Date(),
          syncedAt: null,
          groups: input.groups.map((g, gi) => ({
            id: `${tempId}_g${gi}`,
            quoteId: tempId,
            name: g.name,
            length: g.length ?? null,
            width: g.width ?? null,
            height: g.height ?? null,
            wallsM2: null,
            ceilingM2: null,
            floorM2: null,
            manualM2: g.manualM2 ?? null,
            manualFloor: g.manualFloor ?? null,
            manualCeiling: g.manualCeiling ?? null,
            manualWalls: g.manualWalls ?? null,
            manualPerimeter: g.manualPerimeter ?? null,
            sortOrder: gi,
            services: g.services.map((s, si) => ({
              id: `${tempId}_g${gi}_s${si}`,
              groupId: `${tempId}_g${gi}`,
              name: s.name,
              quantity: s.quantity,
              unit: s.unit,
              pricePerUnit: s.pricePerUnit,
              total: s.quantity * s.pricePerUnit,
              quantitySource: s.quantitySource,
              sortOrder: si,
            })),
          })),
          materials: (input.materials ?? []).map((m, mi) => ({
            id: `${tempId}_m${mi}`,
            quoteId: tempId,
            groupId: m.groupId ?? null,
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            pricePerUnit: m.pricePerUnit,
            total: m.quantity * m.pricePerUnit,
            sortOrder: mi,
          })),
        }

        // Save to local cache
        await cacheQuote(user.id, tempQuote)

        // Add to sync queue
        await addToSyncQueue('quote', 'create', { tempId, ...input })
        await updatePendingCount()

        return { success: true, tempId }
      }
    },
    [isOnline, mutation, user?.id, updatePendingCount]
  )

  return {
    create,
    isPending: mutation.isPending,
  }
}

// Helper to calculate total from input
function calculateTotal(input: CreateQuoteInput): number {
  let total = 0

  for (const group of input.groups) {
    for (const service of group.services) {
      total += service.quantity * service.pricePerUnit
    }
  }

  for (const material of input.materials ?? []) {
    total += material.quantity * material.pricePerUnit
  }

  return total
}

// Hook for deleting quote with offline support
export function useDeleteQuote() {
  const { isOnline } = useSyncStore()
  const { updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const utils = trpc.useUtils()

  const mutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate()
    },
  })

  const deleteQuote = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: 'Nie jesteś zalogowany' }
      }

      // Remove from local cache immediately
      await deleteFromQuotesCache(id)

      if (isOnline) {
        try {
          await mutation.mutateAsync({ id })
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      } else {
        // Offline: queue for later
        await addToSyncQueue('quote', 'delete', { id })
        await updatePendingCount()
        return { success: true }
      }
    },
    [isOnline, mutation, user?.id, updatePendingCount]
  )

  return {
    deleteQuote,
    isPending: mutation.isPending,
  }
}

// Combined hook for convenience
export function useOfflineQuotes() {
  return {
    list: useQuotesList(),
    create: useCreateQuote(),
    delete: useDeleteQuote(),
  }
}
