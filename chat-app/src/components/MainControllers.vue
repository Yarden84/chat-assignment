<template>
  <div class="fixed top-4 right-2 sm:top-4 sm:right-4 z-50 flex items-center space-x-1 sm:space-x-2">
    <LogoutButton v-if="authStore.isAuthenticated" />
    <ThemeToggle />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import LogoutButton from './LogoutButton.vue'
import ThemeToggle from './ThemeToggle.vue'

const authStore = useAuthStore()
</script>
