<template>
  <div class="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200 dark:border-gray-700">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg class="w-16 h-16" viewBox="0 0 261.16 261.16" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path style="fill: #7f1ce8; stroke-width: 0px;" d="M50.75,232.96v-39.67l-16.63-9.86c-10.73-6.36-24.59-2.82-30.96,7.91h0c-6.36,10.73-2.82,24.59,7.91,30.96l50.21,29.76c-6.33-4-10.53-11.06-10.53-19.1Z"/>
              <path style="fill: #7f1ce8; stroke-width: 0px;" d="M110.6,183.54v-39.67l-14.66-8.69v52.53l25.19,14.93c-6.33-4-10.53-11.06-10.53-19.1Z"/>
              <path style="fill: #7f1ce8; stroke-width: 0px;" d="M171.12,135.51v-39.67l-15.34-9.09v52.53l25.87,15.34c-6.33-4-10.53-11.06-10.53-19.1Z"/>
              <path style="fill: #f66c6b; stroke-width: 0px;" d="M95.94,120.04c0-12.48-10.12-22.59-22.59-22.59s-22.59,10.12-22.59,22.59v112.92c0,8.04,4.21,15.1,10.53,19.1,3.49,2.21,7.62,3.49,12.06,3.49,10.29,0,18.97-6.89,21.7-16.3,0,0,0,0,0,0,.1-.33.18-.67.27-1,.01-.06.03-.12.04-.19.06-.28.12-.56.18-.84.02-.12.04-.24.06-.36.04-.23.08-.45.11-.68.03-.18.05-.35.07-.53.02-.18.04-.35.06-.53.02-.23.04-.46.05-.69,0-.13.02-.27.02-.4.01-.27.02-.53.02-.8,0-.08,0-.17,0-.25v-112.92Z"/>
              <path style="fill: #08a2ed; stroke-width: 0px;" d="M155.78,70.62c0-12.48-10.12-22.59-22.59-22.59h0c-12.48,0-22.59,10.12-22.59,22.59v112.92c0,8.04,4.21,15.1,10.53,19.1,3.49,2.21,7.62,3.49,12.06,3.49h0c10.29,0,18.97-6.89,21.7-16.3,0,0,0,0,0-.01.1-.33.18-.66.26-1,.02-.06.03-.13.04-.19.06-.28.12-.55.18-.83.02-.12.04-.25.07-.37.04-.22.08-.45.11-.67.03-.18.05-.36.07-.54.02-.18.04-.35.06-.53.02-.23.04-.46.05-.69,0-.13.02-.27.02-.4.01-.27.02-.54.02-.81,0-.08,0-.16,0-.24v-112.92Z"/>
              <path style="fill: #0acf83; stroke-width: 0px;" d="M215.68,140.79c.01-.06.03-.12.04-.19.06-.28.12-.56.18-.84.02-.12.04-.24.06-.36.04-.23.08-.45.11-.68.03-.18.05-.35.07-.53.02-.18.04-.36.06-.53.02-.23.04-.46.05-.69,0-.14.02-.27.03-.41.01-.27.02-.53.02-.8,0-.08,0-.17,0-.25V22.59c0-12.48-10.12-22.59-22.59-22.59h0c-12.48,0-22.59,10.12-22.59,22.59v112.92c0,8.04,4.21,15.1,10.53,19.1,3.49,2.21,7.62,3.49,12.06,3.49h0c10.29,0,18.97-6.89,21.7-16.3,0,0,0,0,0,0,.1-.33.18-.67.27-1Z"/>
            </g>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to Klaay</h1>
        <p class="text-gray-600 dark:text-gray-300">Sign in to start chatting</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-klaay-blue focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            placeholder="Enter your username"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-klaay-blue focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>

        <div class="h-4 flex items-center">
          <div v-if="error" class="py-1 w-full">
            <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-klaay-blue hover:bg-klaay-blue-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Demo accounts:</p>
        <p class="mt-1">user1 / password1 or user2 / password2</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = '*Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/chat')
  } catch (err: any) {
    error.value = '*' + err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
