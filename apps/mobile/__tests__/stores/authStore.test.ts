import { useAuthStore } from '../../stores/authStore'

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  })

  describe('setUser', () => {
    it('should set user and update isAuthenticated to true', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      }

      useAuthStore.getState().setUser(mockUser as any)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should set isAuthenticated to false when user is null', () => {
      // First set a user
      useAuthStore.getState().setUser({ id: '1' } as any)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Then clear user
      useAuthStore.getState().setUser(null)

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      expect(useAuthStore.getState().isLoading).toBe(false)

      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user, token and set isAuthenticated to false', async () => {
      // Setup authenticated state
      useAuthStore.setState({
        user: { id: '1' } as any,
        token: 'test-token',
        isAuthenticated: true,
      })

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })
})
