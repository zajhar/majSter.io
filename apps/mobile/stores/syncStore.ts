import { create } from 'zustand'
import NetInfo from '@react-native-community/netinfo'
import { getSyncQueue, removeFromSyncQueue, incrementRetry } from '../db'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncAt: Date | null

  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  updatePendingCount: () => Promise<void>
  processQueue: (apiClient: any) => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,

  setOnline: (isOnline) => set({ isOnline }),

  setSyncing: (isSyncing) => set({ isSyncing }),

  updatePendingCount: async () => {
    const queue = await getSyncQueue()
    set({ pendingCount: queue.length })
  },

  processQueue: async (apiClient) => {
    const { isOnline, isSyncing } = get()
    if (!isOnline || isSyncing) return

    set({ isSyncing: true })

    try {
      const queue = await getSyncQueue()

      for (const item of queue) {
        if (item.retries >= 3) {
          // Skip items that failed too many times
          continue
        }

        try {
          // Process based on type and action
          if (item.type === 'quote') {
            if (item.action === 'create') {
              await apiClient.quotes.create.mutate(item.payload)
            } else if (item.action === 'delete') {
              await apiClient.quotes.delete.mutate(item.payload)
            }
          } else if (item.type === 'client') {
            if (item.action === 'create') {
              await apiClient.clients.create.mutate(item.payload)
            } else if (item.action === 'update') {
              await apiClient.clients.update.mutate(item.payload)
            } else if (item.action === 'delete') {
              await apiClient.clients.delete.mutate(item.payload)
            }
          }

          await removeFromSyncQueue(item.id)
        } catch (error) {
          await incrementRetry(item.id)
        }
      }

      set({ lastSyncAt: new Date() })
    } finally {
      set({ isSyncing: false })
      await get().updatePendingCount()
    }
  },
}))

// Initialize network listener
export function initNetworkListener() {
  return NetInfo.addEventListener((state) => {
    useSyncStore.getState().setOnline(state.isConnected ?? false)
  })
}
