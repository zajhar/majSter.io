import { useEffect, useState, useCallback } from 'react'
import { getSyncErrorForId, clearSyncError, removeFromSyncQueue } from '../db'
import { useSyncStore } from '../stores/syncStore'
import { useAuthStore } from '../stores/authStore'
import { trpcClient } from '../lib/api'

interface SyncErrorState {
  hasError: boolean
  message: string | null
  failedAt: Date | null
  isRetrying: boolean
  retry: () => Promise<void>
  dismiss: () => Promise<void>
}

export function useSyncError(entityId: string | undefined): SyncErrorState {
  const [errorInfo, setErrorInfo] = useState<{
    error: string | null
    failedAt: number | null
    queueId: string | null
  } | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const { processQueue, updatePendingCount } = useSyncStore()
  const user = useAuthStore((s) => s.user)

  // Load error state
  useEffect(() => {
    async function loadError() {
      if (!entityId) {
        setErrorInfo(null)
        return
      }

      const result = await getSyncErrorForId(entityId)
      setErrorInfo(result)
    }
    loadError()
  }, [entityId])

  // Retry sync for this item
  const retry = useCallback(async () => {
    if (!errorInfo?.queueId || !user?.id) return

    setIsRetrying(true)
    try {
      // Clear the error so processQueue will try again
      await clearSyncError(errorInfo.queueId)

      // Trigger sync
      await processQueue(trpcClient, user.id)

      // Reload error state
      const result = await getSyncErrorForId(entityId!)
      setErrorInfo(result)
    } finally {
      setIsRetrying(false)
      await updatePendingCount()
    }
  }, [errorInfo?.queueId, entityId, processQueue, user?.id, updatePendingCount])

  // Dismiss (remove from queue without retrying)
  const dismiss = useCallback(async () => {
    if (!errorInfo?.queueId) return

    await removeFromSyncQueue(errorInfo.queueId)
    setErrorInfo(null)
    await updatePendingCount()
  }, [errorInfo?.queueId, updatePendingCount])

  return {
    hasError: !!errorInfo?.error,
    message: errorInfo?.error ?? null,
    failedAt: errorInfo?.failedAt ? new Date(errorInfo.failedAt) : null,
    isRetrying,
    retry,
    dismiss,
  }
}
