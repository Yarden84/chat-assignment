<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto transform transition-all duration-300 ease-out scale-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Start New Conversation</h3>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label for="chatName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conversation Name
          </label>
          <input
            id="chatName"
            ref="chatNameInput"
            v-model="chatName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-klaay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
            placeholder="Enter conversation name"
            :class="{ 'text-base': isMobile }"
          />
        </div>
        <div class="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            @click="handleClose"
            class="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!chatName.trim() || isCreating"
            class="w-full sm:w-auto bg-klaay-blue hover:bg-klaay-blue-dark text-white px-4 py-3 sm:py-2 rounded-lg disabled:opacity-50 transition-colors order-1 sm:order-2"
          >
            {{ isCreating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  isOpen: boolean
  isCreating?: boolean
  isMobile?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'create', name: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isCreating: false,
  isMobile: false
})

const emit = defineEmits<Emits>()

const chatName = ref('')
const chatNameInput = ref<HTMLInputElement | null>(null)

const handleClose = () => {
  chatName.value = ''
  emit('close')
}

const handleSubmit = () => {
  if (!chatName.value.trim()) return
  emit('create', chatName.value.trim())
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      chatNameInput.value?.focus()
    })
  }
})
</script>
