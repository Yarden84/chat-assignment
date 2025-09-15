import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'
import { apiClient } from '@/services/api'

vi.mock('@/services/api', () => ({
  apiClient: {
    authenticate: vi.fn(),
    setToken: vi.fn()
  }
}))

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with null token and user when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const authStore = useAuthStore()
      
      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loading).toBe(false)
    })

    it('should initialize with data from localStorage when available', () => {
      const mockToken = 'user-123'
      const mockUser = { id: 'user-123', username: 'testuser', email: 'test@example.com' }
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockToken) 
        .mockReturnValueOnce(mockToken) 
        .mockReturnValueOnce(JSON.stringify(mockUser))
      
      const authStore = useAuthStore()
      
      expect(authStore.token).toBe(mockToken)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockToken = 'user-123'
      const username = 'testuser'
      const password = 'password123'
      
      vi.mocked(apiClient.authenticate).mockResolvedValue(mockToken)
      
      const authStore = useAuthStore()
      
      const loginPromise = authStore.login(username, password)
      expect(authStore.loading).toBe(true)
      
      await loginPromise
      
      expect(authStore.loading).toBe(false)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.user).toEqual({
        id: mockToken,
        username,
        email: `${username}@example.com`
      })
      expect(authStore.isAuthenticated).toBe(true)
      
      expect(apiClient.authenticate).toHaveBeenCalledWith(username, password)
      expect(apiClient.setToken).toHaveBeenCalledWith(mockToken)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_info', JSON.stringify({
        id: mockToken,
        username,
        email: `${username}@example.com`
      }))
    })

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials')
      vi.mocked(apiClient.authenticate).mockRejectedValue(error)
      
      const authStore = useAuthStore()
      
      await expect(authStore.login('invalid', 'invalid')).rejects.toThrow('Invalid credentials')
      
      expect(authStore.loading).toBe(false)
      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      
      expect(apiClient.setToken).toHaveBeenCalledWith(null)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_info')
    })

    it('should set loading state correctly during login process', async () => {
      let resolveAuth: (value: string) => void
      const authPromise = new Promise<string>((resolve) => {
        resolveAuth = resolve
      })
      
      vi.mocked(apiClient.authenticate).mockReturnValue(authPromise)
      
      const authStore = useAuthStore()
      
      const loginPromise = authStore.login('user', 'pass')
      expect(authStore.loading).toBe(true)
      
      resolveAuth!('token-123')
      await loginPromise
      
      expect(authStore.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear all authentication data', () => {
      const authStore = useAuthStore()
      
      authStore.token = 'some-token'
      authStore.user = { id: '123', username: 'test', email: 'test@test.com' }
      
      authStore.logout()
      
      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      
      expect(apiClient.setToken).toHaveBeenCalledWith(null)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_info')
    })
  })

  describe('initializeAuth', () => {
    it('should initialize auth from localStorage', () => {
      const mockToken = 'stored-token'
      const mockUser = { id: '123', username: 'stored', email: 'stored@test.com' }
      
      mockLocalStorage.getItem.mockReturnValue(null)
      const authStore = useAuthStore()
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockToken)
        .mockReturnValueOnce(JSON.stringify(mockUser))
      
      authStore.initializeAuth()
      
      expect(authStore.token).toBe(mockToken)
      expect(authStore.user).toEqual(mockUser)
      expect(apiClient.setToken).toHaveBeenCalledWith(mockToken)
    })

    it('should handle missing localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const authStore = useAuthStore()
      authStore.initializeAuth()
      
      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should handle corrupted user data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const authStore = useAuthStore()
      
      mockLocalStorage.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('invalid-json{')
      
      expect(() => authStore.initializeAuth()).toThrow()
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return true when token exists', () => {
      const authStore = useAuthStore()
      authStore.token = 'some-token'
      
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should return false when token is null', () => {
      const authStore = useAuthStore()
      authStore.token = null
      
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false when token is empty string', () => {
      const authStore = useAuthStore()
      authStore.token = ''
      
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
