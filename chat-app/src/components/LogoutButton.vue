<template>
  <button
    @click="handleLogout"
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
    title="Logout"
  >
    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  authStore.logout()
  router.push('/login')
}
</script>
