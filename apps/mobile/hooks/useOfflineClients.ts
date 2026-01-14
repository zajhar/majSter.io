import { useEffect, useState, useCallback } from 'react'
import { trpc } from '../lib/trpc'
import { useSyncStore } from '../stores/syncStore'
import { useAuthStore } from '../stores/authStore'
import {
  addToSyncQueue,
  cacheClients,
  cacheClient,
  getCachedClients,
  getCachedClientById,
  deleteFromClientsCache,
} from '../db'
import type { Client, CreateClientInput, UpdateClientInput } from '@majsterio/shared'

// Generate temporary ID for offline items
function generateTempId(): string {
  return `temp_${Math.random().toString(36).substring(2, 11)}`
}

// Hook for single client by ID with offline cache fallback
export function useClientById(id: string | undefined) {
  const { isOnline } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const [cachedData, setCachedData] = useState<Client | null>(null)
  const [isLoadingCache, setIsLoadingCache] = useState(true)

  // Online query
  const query = trpc.clients.byId.useQuery(
    { id: id! },
    { enabled: isOnline && !!id }
  )

  // Cache data when fetched online
  useEffect(() => {
    if (query.data && user?.id) {
      cacheClient(user.id, query.data)
    }
  }, [query.data, user?.id])

  // Load from cache when offline
  useEffect(() => {
    async function loadCache() {
      if (id) {
        setIsLoadingCache(true)
        const cached = await getCachedClientById(id)
        setCachedData(cached as Client | null)
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

// Hook for clients list with offline cache fallback
export function useClientsList() {
  const { isOnline } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const [cachedData, setCachedData] = useState<Client[]>([])
  const [isLoadingCache, setIsLoadingCache] = useState(true)

  // Online query
  const query = trpc.clients.list.useQuery(undefined, {
    enabled: isOnline,
  })

  // Cache data when fetched online
  useEffect(() => {
    if (query.data && user?.id) {
      cacheClients(user.id, query.data)
    }
  }, [query.data, user?.id])

  // Load from cache when offline or on mount
  useEffect(() => {
    async function loadCache() {
      if (user?.id) {
        setIsLoadingCache(true)
        const cached = await getCachedClients(user.id)
        setCachedData(cached as Client[])
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

// Hook for creating client with offline support
export function useCreateClient() {
  const { isOnline } = useSyncStore()
  const { updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const utils = trpc.useUtils()

  const mutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
    },
  })

  const create = useCallback(
    async (input: CreateClientInput): Promise<{ success: boolean; tempId?: string; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: 'Nie jesteś zalogowany' }
      }

      if (isOnline) {
        // Online: send directly to API
        try {
          const result = await mutation.mutateAsync(input)
          // Cache the new client
          await cacheClient(user.id, result)
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      } else {
        // Offline: save to cache and queue
        const tempId = generateTempId()
        const tempClient: Client = {
          id: tempId,
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone ?? null,
          siteAddress: input.siteAddress ?? null,
          notes: input.notes ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Save to local cache
        await cacheClient(user.id, tempClient)

        // Add to sync queue
        await addToSyncQueue('client', 'create', { tempId, ...input })
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

// Hook for updating client with offline support
export function useUpdateClient() {
  const { isOnline } = useSyncStore()
  const { updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const utils = trpc.useUtils()

  const mutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
    },
  })

  const update = useCallback(
    async (
      id: string,
      input: UpdateClientInput
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: 'Nie jesteś zalogowany' }
      }

      if (isOnline) {
        try {
          const result = await mutation.mutateAsync({ id, data: input })
          await cacheClient(user.id, result)
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      } else {
        // Offline: update cache and queue
        const cached = await getCachedClients(user.id)
        const existing = (cached as Client[]).find((c) => c.id === id)

        if (existing) {
          const updated = { ...existing, ...input, updatedAt: new Date() }
          await cacheClient(user.id, updated)
        }

        await addToSyncQueue('client', 'update', { id, data: input })
        await updatePendingCount()

        return { success: true }
      }
    },
    [isOnline, mutation, user?.id, updatePendingCount]
  )

  return {
    update,
    isPending: mutation.isPending,
  }
}

// Hook for deleting client with offline support
export function useDeleteClient() {
  const { isOnline } = useSyncStore()
  const { updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const utils = trpc.useUtils()

  const mutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
    },
  })

  const deleteClient = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: 'Nie jesteś zalogowany' }
      }

      // Remove from local cache immediately
      await deleteFromClientsCache(id)

      if (isOnline) {
        try {
          await mutation.mutateAsync({ id })
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      } else {
        // Offline: queue for later
        await addToSyncQueue('client', 'delete', { id })
        await updatePendingCount()
        return { success: true }
      }
    },
    [isOnline, mutation, user?.id, updatePendingCount]
  )

  return {
    deleteClient,
    isPending: mutation.isPending,
  }
}

// Combined hook for convenience
export function useOfflineClients() {
  return {
    list: useClientsList(),
    create: useCreateClient(),
    update: useUpdateClient(),
    delete: useDeleteClient(),
  }
}
