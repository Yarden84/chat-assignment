import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/services/api'
import type { Conversation, Message } from '@/types'

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchConversations = async () => {
    console.log('🔄 Starting to fetch conversations...')
    loading.value = true
    error.value = null
    try {
      const data = await apiClient.getConversations()
      console.log('✅ Fetched conversations successfully:', data.length, 'conversations')
      conversations.value = data
    } catch (err: any) {
      console.error('❌ Failed to fetch conversations:', err)
      error.value = err.message || 'Failed to fetch conversations'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchConversation = async (id: string) => {
    try {
      const conversation = await apiClient.getConversation(id)
      
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index] = conversation
      } else {
        conversations.value.push(conversation)
      }
      
      return conversation
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch conversation'
      throw err
    }
  }

  const createConversation = async (name: string) => {
    try {
      const conversation = await apiClient.createConversation(name)
      conversations.value.unshift(conversation) 
      return conversation
    } catch (err: any) {
      error.value = err.message || 'Failed to create conversation'
      throw err
    }
  }

  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const message = await apiClient.sendMessage(conversationId, text)
      
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        conversation.attributes.messages.push(message)
      }
      
      return message
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      throw err
    }
  }

  const addMessage = (conversationId: string, message: Message) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      const exists = conversation.attributes.messages.some(m => m.id === message.id)
      if (!exists) {
        conversation.attributes.messages.push(message)
      }
    }
  }

  const updateConversationName = async (conversationId: string, newName: string) => {
    try {
      const updatedConversation = await apiClient.updateConversationName(conversationId, newName)
      
      const index = conversations.value.findIndex(c => c.id === conversationId)
      if (index !== -1) {
        conversations.value[index] = updatedConversation
      }
      
      return updatedConversation
    } catch (err: any) {
      error.value = err.message || 'Failed to update conversation name'
      throw err
    }
  }

  const clearConversations = () => {
    conversations.value = []
    error.value = null
  }

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    fetchConversation,
    createConversation,
    sendMessage,
    addMessage,
    updateConversationName,
    clearConversations
  }
})
