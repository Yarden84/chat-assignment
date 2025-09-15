import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'

const ws = ref<WebSocket | null>(null)
const isConnected = ref(false)
const aiTypingConversations = ref<Set<string>>(new Set())

const eventCallbacks = ref<{
  aiTypingChanged: ((conversationId: string, isTyping: boolean) => void)[]
  messageReceived: ((conversationId: string, message: any) => void)[]
}>({
  aiTypingChanged: [],
  messageReceived: []
})

export function useGlobalWebSocket() {
  const authStore = useAuthStore()
  const conversationsStore = useConversationsStore()

  const connect = () => {
    if (ws.value) {
      ws.value.close()
    }

    if (!authStore.token) {
      console.log('No auth token, skipping global WebSocket connection')
      return
    }

    try {
      const wsUrl = `ws://localhost:9293/cable?token=${authStore.token}&userWide=true`
      
      ws.value = new WebSocket(wsUrl)
    } catch (error) {
      console.error('Failed to create global WebSocket connection:', error)
      return
    }
    
    ws.value.onopen = () => {
      console.log('Global WebSocket connected')
      isConnected.value = true
    }
    
    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'message.created' && data.conversationId) {
          const message = {
            id: data.data.id,
            text: data.data.attributes.text,
            author: data.data.attributes.author,
            createdAt: data.data.attributes.createdAt
          }
          
          if (message.author !== authStore.user?.id) {
            console.log(`Received global message for conversation ${data.conversationId}:`, message)
            conversationsStore.addMessage(data.conversationId, message)
            
            const conversation = conversationsStore.conversations.find(c => c.id === data.conversationId)
            if (conversation) {
              conversation.attributes.updatedAt = message.createdAt
            }
            
            if (message.author === 'AI') {
              aiTypingConversations.value.delete(data.conversationId)
              eventCallbacks.value.aiTypingChanged.forEach(callback => 
                callback(data.conversationId, false)
              )
            }
            
            eventCallbacks.value.messageReceived.forEach(callback =>
              callback(data.conversationId, message)
            )
          }
        }
      } catch (error) {
        console.error('Error parsing global WebSocket message:', error)
      }
    }
    
    ws.value.onerror = (error) => {
      console.error('Global WebSocket error:', error)
      isConnected.value = false
    }
    
    ws.value.onclose = (event) => {
      console.log('Global WebSocket disconnected:', event.code, event.reason)
      isConnected.value = false
      
      if (event.code !== 1000 && authStore.token) {
        setTimeout(() => {
          if (authStore.token) {
            console.log('Attempting to reconnect global WebSocket...')
            connect()
          }
        }, 3000)
      }
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close(1000, 'Manual disconnect') 
      ws.value = null
      isConnected.value = false
    }
  }

  const setAiTyping = (conversationId: string, isTyping: boolean) => {
    if (isTyping) {
      aiTypingConversations.value.add(conversationId)
    } else {
      aiTypingConversations.value.delete(conversationId)
    }
    eventCallbacks.value.aiTypingChanged.forEach(callback => 
      callback(conversationId, isTyping)
    )
  }

  const isAiTyping = (conversationId: string) => {
    return aiTypingConversations.value.has(conversationId)
  }

  const onAiTypingChanged = (callback: (conversationId: string, isTyping: boolean) => void) => {
    eventCallbacks.value.aiTypingChanged.push(callback)
    return () => {
      const index = eventCallbacks.value.aiTypingChanged.indexOf(callback)
      if (index > -1) {
        eventCallbacks.value.aiTypingChanged.splice(index, 1)
      }
    }
  }

  const onMessageReceived = (callback: (conversationId: string, message: any) => void) => {
    eventCallbacks.value.messageReceived.push(callback)
    return () => {
      const index = eventCallbacks.value.messageReceived.indexOf(callback)
      if (index > -1) {
        eventCallbacks.value.messageReceived.splice(index, 1)
      }
    }
  }

  return {
    connect,
    disconnect,
    setAiTyping,
    isAiTyping,
    onAiTypingChanged,
    onMessageReceived,
    isConnected: isConnected.value
  }
}
