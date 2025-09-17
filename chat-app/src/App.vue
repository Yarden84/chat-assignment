<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import MainControllers from './components/MainControllers.vue'

const { initializeTheme } = useTheme()

onMounted(() => {
  initializeTheme()
})
</script>

<template>
  <div class="relative">
    <RouterView />
    <MainControllers />
  </div>
</template>

<style scoped></style>
