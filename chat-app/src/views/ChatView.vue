<template>
  <div class="h-screen bg-gray-50 dark:bg-gray-900 flex relative">
    <div 
      v-if="sidebarOpen && isMobile" 
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <div 
      class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out z-50"
      :class="{
        'fixed inset-y-0 left-0 lg:relative lg:translate-x-0': true,
        '-translate-x-full': !sidebarOpen && isMobile,
        'translate-x-0': sidebarOpen || !isMobile
      }"
    >
      <div v-if="isMobile" class="h-16 bg-klaay-blue lg:hidden flex items-center justify-end px-4">
        <button
          @click="sidebarOpen = false"
          class="p-1 mr-auto hover:bg-white/20 rounded text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="bg-klaay-blue p-4 text-white">
        <div class="flex items-center justify-between pb-2">
          <h2 class="text-xl font-semibold">Chats</h2>
          <button 
            @click="showNewChatModal = true"
            data-cy="new-chat-button"
            class="bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition-colors flex items-center space-x-1"
            title="New conversation"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            <span class="text-sm font-medium">New Chat</span>
          </button>
        </div>
        <div class="mt-2">
          <span class="text-sm opacity-90">Welcome, {{ authStore.user?.username }}</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="conversationsStore.loading" class="p-4 text-center">
           <div class="animate-spin w-6 h-6 border-2 border-klaay-blue border-t-transparent rounded-full mx-auto"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading conversations...</p>
        </div>
        
        <div v-else-if="conversationsStore.conversations.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>No conversations yet</p>
          <p class="text-sm mt-1">Click + to start a new chat</p>
        </div>

        <div v-else>
          <div 
            v-for="conversation in sortedConversations" 
            :key="conversation.id"
            @click="selectConversation(conversation.id)"
            data-cy="conversation-item"
            class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            :class="{ 'bg-klaay-blue/10 dark:bg-klaay-blue/20 border-klaay-blue/20 dark:border-klaay-blue/30': selectedConversationId === conversation.id }"
          >
            <div class="flex justify-between items-start mb-1">
              <div v-if="editingConversationId !== conversation.id" class="flex items-center flex-1 mr-2 group">
                <h3 class="font-medium text-gray-900 dark:text-gray-100 flex-1 text-base">{{ conversation.attributes.name }}</h3>
                <button
                  @click="startEditingConversation(conversation.id, conversation.attributes.name, $event)"
                  data-cy="edit-conversation"
                  class="ml-2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                  title="Edit conversation name"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
              </div>
              
              <div v-else class="flex items-center flex-1 mr-2">
                <input
                  v-model="editingConversationName"
                  @keyup.enter="saveConversationName(conversation.id, $event)"
                  @keyup.escape="cancelEditingConversation"
                  @blur="saveConversationName(conversation.id, $event)"
                  @click.stop
                  class="flex-1 px-2 py-1 text-base font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-b-1 border-klaay-blue rounded focus:outline-none focus:ring-1 focus:ring-klaay-blue"
                  :ref="el => { if (el && editingConversationId === conversation.id) (el as HTMLInputElement).focus() }"
                />
                <button
                  @click="saveConversationName(conversation.id, $event)"
                  class="ml-1 p-1 text-green-600 hover:text-green-700"
                  title="Save"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                <button
                  @click="cancelEditingConversation($event)"
                  class="ml-1 p-1 text-red-600 hover:text-red-700"
                  title="Cancel"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0" data-cy="conversation-time">
                {{ formatConversationTime(conversation.attributes.updatedAt) }}
              </span>
            </div>
            <div class="flex justify-between items-end">
              <p class="text-sm text-gray-500 dark:text-gray-400 flex-1 mr-2 truncate">
                {{ conversation.attributes.messages[conversation.attributes.messages.length - 1]?.text || 'No messages yet' }}
              </p>
              <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                {{ formatConversationDate(conversation.attributes.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col">
      <div class="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <button
          @click="sidebarOpen = true"
          data-cy="mobile-menu-button"
          class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h8"></path>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ selectedConversationId ? getConversationName(selectedConversationId) : 'Klaay Chat' }}
        </h1>
        <div class="w-10"></div> 
      </div>

      <div v-if="!selectedConversationId" class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div class="text-center">
          <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <svg class="w-24 h-24" viewBox="0 0 261.16 261.16" xmlns="http://www.w3.org/2000/svg">
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
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome to Klaay</h2>
          <p class="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>

      <ConversationView 
        v-else 
        :conversation-id="selectedConversationId" 
        :key="selectedConversationId"
      />
    </div>

    <NewChatModal
      :is-open="showNewChatModal"
      :is-creating="creatingChat"
      :is-mobile="isMobile"
      @close="showNewChatModal = false"
      @create="createNewChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import ConversationView from '../components/ConversationView.vue'
import NewChatModal from '../components/NewChatModal.vue'
import { useGlobalWebSocket } from '../composables/useGlobalWebSocket'
import { formatConversationTime, formatConversationDate } from '../utils/timeFormatters'

const authStore = useAuthStore()
const conversationsStore = useConversationsStore()
const globalWebSocket = useGlobalWebSocket()

const selectedConversationId = ref<string | null>(null)
const showNewChatModal = ref(false)
const creatingChat = ref(false)
const editingConversationId = ref<string | null>(null)
const editingConversationName = ref('')
const sidebarOpen = ref(false)
const isMobile = ref(false)

const selectConversation = (id: string) => {
  selectedConversationId.value = id
  
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const getConversationName = (id: string) => {
  const conversation = conversationsStore.conversations.find(c => c.id === id)
  return conversation?.attributes.name || 'Conversation'
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024 
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

const startEditingConversation = (conversationId: string, currentName: string, event: Event) => {
  event.stopPropagation()
  editingConversationId.value = conversationId
  editingConversationName.value = currentName
}

const cancelEditingConversation = (event?: Event) => {
  if (event) event.stopPropagation()
  editingConversationId.value = null
  editingConversationName.value = ''
}

const saveConversationName = async (conversationId: string, event?: Event) => {
  if (event) event.stopPropagation()
  if (!editingConversationName.value.trim()) return
  
  try {
    await conversationsStore.updateConversationName(conversationId, editingConversationName.value.trim())
    editingConversationId.value = null
    editingConversationName.value = ''
  } catch (error) {
    console.error('Failed to update conversation name:', error)
  }
}

const sortedConversations = computed(() => {
  return [...conversationsStore.conversations].sort((a, b) => {
    const dateA = new Date(a.attributes.updatedAt || 0)
    const dateB = new Date(b.attributes.updatedAt || 0)
    return dateB.getTime() - dateA.getTime() 
  })
})



const createNewChat = async (name: string) => {
  if (!name.trim()) return

  creatingChat.value = true
  try {
    const conversation = await conversationsStore.createConversation(name)
    selectedConversationId.value = conversation.id
    showNewChatModal.value = false
    
    if (isMobile.value) {
      sidebarOpen.value = false
    }
  } catch (error) {
    console.error('Failed to create conversation:', error)
  } finally {
    creatingChat.value = false
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  try {
    await conversationsStore.fetchConversations()

    setTimeout(() => {
      try {
        globalWebSocket.connect()
      } catch (error) {
        console.warn('Global WebSocket connection failed, but app will continue to work:', error)
      }
    }, 2000)
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    
    setTimeout(() => {
      try {
        globalWebSocket.connect()
      } catch (wsError) {
        console.warn('Global WebSocket connection failed:', wsError)
      }
    }, 3000)
  }
})


onUnmounted(() => {
  globalWebSocket.disconnect()
  window.removeEventListener('resize', checkMobile)
})
</script>
