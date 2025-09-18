import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const authToken = await apiClient.authenticate(username, password)
      
      token.value = authToken
      apiClient.setToken(authToken)
      
      user.value = {
        id: authToken,
        username,
        email: `${username}@example.com`
      }
      
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user_info', JSON.stringify(user.value))
    } catch (error) {
      token.value = null
      user.value = null
      apiClient.setToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    apiClient.setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_info')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      apiClient.setToken(savedToken)
    }
  }

  initializeAuth()

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    initializeAuth
  }
})