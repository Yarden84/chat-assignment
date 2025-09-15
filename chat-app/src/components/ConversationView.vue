<template>
  <div class="flex flex-col h-full">
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4" data-cy="conversation-header">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-klaay-blue rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ conversation?.attributes.name || 'Loading...' }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ conversation?.attributes.messages.length || 0 }} messages</p>
        </div>
      </div>
    </div>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" data-cy="messages-container">
      <div v-if="loading" class="text-center py-8">
         <div class="animate-spin w-6 h-6 border-2 border-klaay-blue border-t-transparent rounded-full mx-auto"></div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading conversation...</p>
      </div>

      <div v-else-if="conversation?.attributes.messages.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No messages yet</p>
        <p class="text-sm mt-1">Start the conversation!</p>
      </div>

      <div v-else>
        <template v-for="(message, index) in conversation?.attributes.messages" :key="message.id">
          <div 
            v-if="shouldShowDateHeader(message, index, conversation?.attributes.messages || [])"
            class="flex justify-center my-4"
            data-cy="date-header"
          >
            <div class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
              {{ formatDateHeader(message.createdAt) }}
            </div>
          </div>
          
          <div 
            class="flex mb-2 items-start"
            :class="message.author === authStore.user?.id ? 'justify-end' : 'justify-start'"
          >
            <template v-if="message.author === authStore.user?.id">
              <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-klaay-blue text-white mr-2 min-h-fit">
                <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
                <p class="text-xs mt-1 opacity-70 flex justify-between items-center">
                  <span>You</span>
                  <span class="ml-2">{{ formatMessageTime(message.createdAt) }}</span>
                </p>
              </div>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-klaay-blue">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </template>

            <template v-else>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-2"
                   :class="message.author === 'AI' ? 'bg-gray-600' : 'bg-gray-400'">
                
                <svg v-if="message.author === 'AI'" class="w-5 h-5 text-white" fill="currentColor" stroke="currentColor" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg"><path d="M31.51,28h-28a3.17,3.17,0,0,1-2.36-1.09A3.63,3.63,0,0,1,.28,24.1C1.48,14.76,8.88,7.72,17.5,7.72s16,7,17.22,16.38a3.63,3.63,0,0,1-.85,2.84A3.17,3.17,0,0,1,31.51,28Zm-14-17.81c-7.37,0-13.7,6.11-14.74,14.2a1.12,1.12,0,0,0,.25.87.64.64,0,0,0,.48.24h28a.64.64,0,0,0,.48-.24,1.12,1.12,0,0,0,.25-.87C31.2,16.33,24.87,10.22,17.5,10.22Z"/><path d="M27.38,12.74a1.17,1.17,0,0,1-.6-.16,1.24,1.24,0,0,1-.5-1.69l1.77-3.27a1.25,1.25,0,1,1,2.2,1.2l-1.77,3.26A1.26,1.26,0,0,1,27.38,12.74Z"/><path d="M7.68,12.74a1.26,1.26,0,0,1-1.1-.66L4.81,8.82A1.25,1.25,0,1,1,7,7.62l1.77,3.27a1.25,1.25,0,0,1-.5,1.69A1.2,1.2,0,0,1,7.68,12.74Z"/><path d="M10.79,20.7a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z"/><path d="M24.05,20.78a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z"/></svg>
                
                <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              
              <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 min-h-fit">
                <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
                <p class="text-xs mt-1 opacity-70 flex justify-between items-center">
                  <span>{{ message.author === 'AI' ? 'AI Assistant' : message.author }}</span>
                  <span class="ml-2">{{ formatMessageTime(message.createdAt) }}</span>
                </p>
              </div>
            </template>
          </div>
        </template>
        
        <div v-if="aiTyping" class="flex justify-start mb-2 items-start">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-gray-600 mr-2">
            <svg class="w-5 h-5 text-white" fill="currentColor" stroke="currentColor" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg"><path d="M31.51,28h-28a3.17,3.17,0,0,1-2.36-1.09A3.63,3.63,0,0,1,.28,24.1C1.48,14.76,8.88,7.72,17.5,7.72s16,7,17.22,16.38a3.63,3.63,0,0,1-.85,2.84A3.17,3.17,0,0,1,31.51,28Zm-14-17.81c-7.37,0-13.7,6.11-14.74,14.2a1.12,1.12,0,0,0,.25.87.64.64,0,0,0,.48.24h28a.64.64,0,0,0,.48-.24,1.12,1.12,0,0,0,.25-.87C31.2,16.33,24.87,10.22,17.5,10.22Z"/><path d="M27.38,12.74a1.17,1.17,0,0,1-.6-.16,1.24,1.24,0,0,1-.5-1.69l1.77-3.27a1.25,1.25,0,1,1,2.2,1.2l-1.77,3.26A1.26,1.26,0,0,1,27.38,12.74Z"/><path d="M7.68,12.74a1.26,1.26,0,0,1-1.1-.66L4.81,8.82A1.25,1.25,0,1,1,7,7.62l1.77,3.27a1.25,1.25,0,0,1-.5,1.69A1.2,1.2,0,0,1,7.68,12.74Z"/><path d="M10.79,20.7a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z"/><path d="M24.05,20.78a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z"/></svg>
          </div>
          
          <div class="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-2xl max-w-xs lg:max-w-md">
            <div class="flex items-center space-x-1">
              <span class="text-xs text-gray-500 dark:text-gray-400 mr-2">AI Assistant</span>
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dark:bg-gray-800 p-4 pt-0">
      <div class="h-[50px] max-w-4xl mx-auto relative">
        <textarea
          ref="messageInput"
          v-model="newMessage"
          placeholder="Type a message..."
          data-cy="message-input"
          class="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-klaay-blue focus:border-transparent outline-none resize-none overflow-hidden min-h-[48px] max-h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          :disabled="sending"
          rows="1"
          @input="adjustTextareaHeight"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="addNewLine"
        ></textarea>
        <button
          type="submit"
          :disabled="!newMessage.trim() || sending"
          @click="sendMessage"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-klaay-blue hover:bg-klaay-blue-dark text-white p-2 rounded-full disabled:opacity-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4l8 8-8 8M4 12h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import { useGlobalWebSocket } from '../composables/useGlobalWebSocket'
import { formatMessageTime, formatDateHeader, shouldShowDateHeader } from '../utils/timeFormatters'

const props = defineProps<{
  conversationId: string
}>()

const authStore = useAuthStore()
const conversationsStore = useConversationsStore()
const globalWebSocket = useGlobalWebSocket()

const newMessage = ref('')
const sending = ref(false)
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLTextAreaElement | null>(null)
const aiTyping = ref(false)

const conversation = computed(() => 
  conversationsStore.conversations.find(c => c.id === props.conversationId)
)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}


let cleanupAiTyping: (() => void) | null = null
let cleanupMessageReceived: (() => void) | null = null

const setupWebSocketListeners = () => {
  cleanupAiTyping?.()
  cleanupMessageReceived?.()
  
  cleanupAiTyping = globalWebSocket.onAiTypingChanged((conversationId, isTyping) => {
    if (conversationId === props.conversationId) {
      aiTyping.value = isTyping
    }
  })
  
  cleanupMessageReceived = globalWebSocket.onMessageReceived((conversationId, message) => {
    if (conversationId === props.conversationId) {
      scrollToBottom()
    }
  })
  
  aiTyping.value = globalWebSocket.isAiTyping(props.conversationId)
}

const cleanupWebSocketListeners = () => {
  cleanupAiTyping?.()
  cleanupMessageReceived?.()
  cleanupAiTyping = null
  cleanupMessageReceived = null
}

const adjustTextareaHeight = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    const scrollHeight = messageInput.value.scrollHeight
    const maxHeight = 128 
    messageInput.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

const addNewLine = () => {
  newMessage.value += '\n'
  nextTick(() => {
    adjustTextareaHeight()
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  sending.value = true
  try {
    await conversationsStore.sendMessage(props.conversationId, newMessage.value.trim())
    newMessage.value = ''
    
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
    
    globalWebSocket.setAiTyping(props.conversationId, true)
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  if (!conversation.value) {
    loading.value = true
    try {
      await conversationsStore.fetchConversation(props.conversationId)
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
    } finally {
      loading.value = false
    }
  }
  
  setupWebSocketListeners()
  
  scrollToBottom()
})

onUnmounted(() => {
  cleanupWebSocketListeners()
})

watch(() => props.conversationId, async () => {
  try {
    await conversationsStore.fetchConversation(props.conversationId)
  } catch (error) {
    console.error('Failed to refetch conversation:', error)
  }
  
  setupWebSocketListeners()
  scrollToBottom()
})

watch(() => conversation.value?.attributes.messages.length, () => {
  scrollToBottom()
})

watch(aiTyping, () => {
  scrollToBottom()
})

watch(newMessage, () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})
</script>
