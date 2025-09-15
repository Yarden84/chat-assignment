<template>
  <div class="fixed top-4 right-2 sm:top-4 sm:right-4 z-50 flex items-center space-x-1 sm:space-x-2">
    <!-- Logout Button (only show when authenticated) -->
    <button
      v-if="authStore.isAuthenticated"
      @click="handleLogout"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
      title="Logout"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
    </button>

    <!-- Theme Toggle Button -->
    <button
      @click="toggleTheme"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
      title="Toggle theme"
    >
      <svg v-if="isDark" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const { isDark, toggleTheme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  authStore.logout()
  router.push('/login')
}
</script>
