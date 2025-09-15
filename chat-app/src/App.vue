<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import ThemeToggle from './components/ThemeToggle.vue'

const { initializeTheme } = useTheme()

onMounted(() => {
  initializeTheme()
})
</script>

<template>
  <div class="relative">
    <RouterView />
    <ThemeToggle />
  </div>
</template>

<style scoped></style>
