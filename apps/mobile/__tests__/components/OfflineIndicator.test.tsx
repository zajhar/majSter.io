import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { OfflineIndicator } from '../../components/ui/OfflineIndicator'
import { useSyncStore } from '../../stores/syncStore'

// Mock the syncStore
jest.mock('../../stores/syncStore', () => ({
  useSyncStore: jest.fn(),
}))

const mockUseSyncStore = useSyncStore as jest.MockedFunction<typeof useSyncStore>

describe('OfflineIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when online and no pending items', () => {
    mockUseSyncStore.mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
    } as any)

    const { toJSON } = render(<OfflineIndicator />)
    expect(toJSON()).toBeNull()
  })

  it('should show offline message when not connected', () => {
    mockUseSyncStore.mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingCount: 0,
    } as any)

    render(<OfflineIndicator />)
    expect(screen.getByText('Tryb offline')).toBeTruthy()
  })

  it('should show pending count when offline with pending items', () => {
    mockUseSyncStore.mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingCount: 3,
    } as any)

    render(<OfflineIndicator />)
    expect(screen.getByText('Tryb offline')).toBeTruthy()
    expect(screen.getByText('(3 do synchronizacji)')).toBeTruthy()
  })

  it('should show syncing message when syncing', () => {
    mockUseSyncStore.mockReturnValue({
      isOnline: true,
      isSyncing: true,
      pendingCount: 2,
    } as any)

    render(<OfflineIndicator />)
    expect(screen.getByText('Synchronizacja...')).toBeTruthy()
  })
})
