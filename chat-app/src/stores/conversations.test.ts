import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConversationsStore } from './conversations'
import { apiClient } from '@/services/api'
import type { Conversation, Message } from '@/types'

vi.mock('@/services/api', () => ({
  apiClient: {
    getConversations: vi.fn(),
    getConversation: vi.fn(),
    createConversation: vi.fn(),
    sendMessage: vi.fn(),
    updateConversationName: vi.fn()
  }
}))

describe('Conversations Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const store = useConversationsStore()
      
      expect(store.conversations).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchConversations', () => {
    it('should successfully fetch conversations', async () => {
      const mockConversations: Conversation[] = [
        {
          type: 'conversations',
          id: 'conv-1',
          attributes: {
            name: 'Test Conversation',
            author: 'user-1',
            messages: [],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        }
      ]

      vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)

      const store = useConversationsStore()
      
      const fetchPromise = store.fetchConversations()
      expect(store.loading).toBe(true)
      
      await fetchPromise
      
      expect(store.loading).toBe(false)
      expect(store.conversations).toEqual(mockConversations)
      expect(store.error).toBeNull()
      expect(apiClient.getConversations).toHaveBeenCalledOnce()
    })

    it('should handle fetch error', async () => {
      const error = new Error('Network error')
      vi.mocked(apiClient.getConversations).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.fetchConversations()).rejects.toThrow('Network error')
      
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Network error')
      expect(store.conversations).toEqual([])
    })

    it('should handle API error with custom message', async () => {
      const error = { message: 'Unauthorized access' }
      vi.mocked(apiClient.getConversations).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.fetchConversations()).rejects.toEqual(error)
      
      expect(store.error).toBe('Unauthorized access')
    })

    it('should clear previous error on successful fetch', async () => {
      const store = useConversationsStore()
      store.error = 'Previous error'
      
      vi.mocked(apiClient.getConversations).mockResolvedValue([])
      
      await store.fetchConversations()
      
      expect(store.error).toBeNull()
    })
  })

  describe('fetchConversation', () => {
    it('should fetch and update existing conversation', async () => {
      const conversationId = 'conv-1'
      const existingConversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'Old Name',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const updatedConversation: Conversation = {
        ...existingConversation,
        attributes: {
          ...existingConversation.attributes,
          name: 'Updated Name',
          messages: [
            {
              id: 'msg-1',
              text: 'Hello',
              author: 'user-1',
              createdAt: '2025-01-01T01:00:00Z'
            }
          ]
        }
      }

      const store = useConversationsStore()
      store.conversations = [existingConversation]
      
      vi.mocked(apiClient.getConversation).mockResolvedValue(updatedConversation)
      
      const result = await store.fetchConversation(conversationId)
      
      expect(result).toEqual(updatedConversation)
      expect(store.conversations[0]).toEqual(updatedConversation)
      expect(apiClient.getConversation).toHaveBeenCalledWith(conversationId)
    })

    it('should add new conversation if not found locally', async () => {
      const conversationId = 'conv-new'
      const newConversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'New Conversation',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const store = useConversationsStore()
      
      vi.mocked(apiClient.getConversation).mockResolvedValue(newConversation)
      
      await store.fetchConversation(conversationId)
      
      expect(store.conversations).toHaveLength(1)
      expect(store.conversations[0]).toEqual(newConversation)
    })

    it('should handle fetch conversation error', async () => {
      const error = new Error('Conversation not found')
      vi.mocked(apiClient.getConversation).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.fetchConversation('invalid-id')).rejects.toThrow('Conversation not found')
      
      expect(store.error).toBe('Conversation not found')
    })
  })

  describe('createConversation', () => {
    it('should create and add new conversation', async () => {
      const conversationName = 'New Chat'
      const newConversation: Conversation = {
        type: 'conversations',
        id: 'conv-new',
        attributes: {
          name: conversationName,
          author: 'user-1',
          messages: [
            {
              id: 'msg-1',
              text: 'How can I help you today?',
              author: 'AI',
              createdAt: '2025-01-01T00:00:00Z'
            }
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      vi.mocked(apiClient.createConversation).mockResolvedValue(newConversation)

      const store = useConversationsStore()
      const result = await store.createConversation(conversationName)
      
      expect(result).toEqual(newConversation)
      expect(store.conversations).toHaveLength(1)
      expect(store.conversations[0]).toEqual(newConversation)
      expect(apiClient.createConversation).toHaveBeenCalledWith(conversationName)
    })

    it('should add conversation to beginning of list', async () => {
      const existingConversation: Conversation = {
        type: 'conversations',
        id: 'conv-old',
        attributes: {
          name: 'Old Conversation',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const newConversation: Conversation = {
        type: 'conversations',
        id: 'conv-new',
        attributes: {
          name: 'New Conversation',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T01:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z'
        }
      }

      const store = useConversationsStore()
      store.conversations = [existingConversation]
      
      vi.mocked(apiClient.createConversation).mockResolvedValue(newConversation)
      
      await store.createConversation('New Conversation')
      
      expect(store.conversations).toHaveLength(2)
      expect(store.conversations[0]).toEqual(newConversation) 
      expect(store.conversations[1]).toEqual(existingConversation)
    })

    it('should handle create conversation error', async () => {
      const error = new Error('Failed to create')
      vi.mocked(apiClient.createConversation).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.createConversation('Test')).rejects.toThrow('Failed to create')
      
      expect(store.error).toBe('Failed to create')
      expect(store.conversations).toHaveLength(0)
    })
  })

  describe('sendMessage', () => {
    it('should send message and add to conversation', async () => {
      const conversationId = 'conv-1'
      const messageText = 'Hello there!'
      const conversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'Test Chat',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const newMessage: Message = {
        id: 'msg-1',
        text: messageText,
        author: 'user-1',
        createdAt: '2025-01-01T01:00:00Z'
      }

      const store = useConversationsStore()
      store.conversations = [conversation]
      
      vi.mocked(apiClient.sendMessage).mockResolvedValue(newMessage)
      
      const result = await store.sendMessage(conversationId, messageText)
      
      expect(result).toEqual(newMessage)
      expect(store.conversations[0].attributes.messages).toHaveLength(1)
      expect(store.conversations[0].attributes.messages[0]).toEqual(newMessage)
      expect(apiClient.sendMessage).toHaveBeenCalledWith(conversationId, messageText)
    })

    it('should handle message sending to non-existent conversation', async () => {
      const store = useConversationsStore()
      
      vi.mocked(apiClient.sendMessage).mockResolvedValue({
        id: 'msg-1',
        text: 'Hello',
        author: 'user-1',
        createdAt: '2025-01-01T00:00:00Z'
      })
      
      await store.sendMessage('non-existent', 'Hello')
      
      expect(store.conversations).toHaveLength(0)
    })

    it('should handle send message error', async () => {
      const error = new Error('Failed to send')
      vi.mocked(apiClient.sendMessage).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.sendMessage('conv-1', 'Hello')).rejects.toThrow('Failed to send')
      
      expect(store.error).toBe('Failed to send')
    })
  })

  describe('updateConversationName', () => {
    it('should update conversation name', async () => {
      const conversationId = 'conv-1'
      const newName = 'Updated Name'
      const conversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'Old Name',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const updatedConversation: Conversation = {
        ...conversation,
        attributes: {
          ...conversation.attributes,
          name: newName,
          updatedAt: '2025-01-01T02:00:00Z'
        }
      }

      const store = useConversationsStore()
      store.conversations = [conversation]
      
      vi.mocked(apiClient.updateConversationName).mockResolvedValue(updatedConversation)
      
      const result = await store.updateConversationName(conversationId, newName)
      
      expect(result).toEqual(updatedConversation)
      expect(store.conversations[0].attributes.name).toBe(newName)
      expect(apiClient.updateConversationName).toHaveBeenCalledWith(conversationId, newName)
    })

    it('should handle update name error', async () => {
      const error = new Error('Update failed')
      vi.mocked(apiClient.updateConversationName).mockRejectedValue(error)

      const store = useConversationsStore()
      
      await expect(store.updateConversationName('conv-1', 'New Name')).rejects.toThrow('Update failed')
      
      expect(store.error).toBe('Update failed')
    })
  })

  describe('addMessage', () => {
    it('should add message to existing conversation', () => {
      const conversationId = 'conv-1'
      const conversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'Test Chat',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const message: Message = {
        id: 'msg-1',
        text: 'New message',
        author: 'AI',
        createdAt: '2025-01-01T01:00:00Z'
      }

      const store = useConversationsStore()
      store.conversations = [conversation]
      
      store.addMessage(conversationId, message)
      
      expect(store.conversations[0].attributes.messages).toHaveLength(1)
      expect(store.conversations[0].attributes.messages[0]).toEqual(message)
    })

    it('should prevent duplicate messages', () => {
      const conversationId = 'conv-1'
      const message: Message = {
        id: 'msg-1',
        text: 'Duplicate message',
        author: 'AI',
        createdAt: '2025-01-01T01:00:00Z'
      }

      const conversation: Conversation = {
        type: 'conversations',
        id: conversationId,
        attributes: {
          name: 'Test Chat',
          author: 'user-1',
          messages: [message], 
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }

      const store = useConversationsStore()
      store.conversations = [conversation]
      
      store.addMessage(conversationId, message) 
      
      expect(store.conversations[0].attributes.messages).toHaveLength(1)
    })

    it('should handle adding message to non-existent conversation', () => {
      const store = useConversationsStore()
      
      const message: Message = {
        id: 'msg-1',
        text: 'Message',
        author: 'AI',
        createdAt: '2025-01-01T01:00:00Z'
      }
      
      expect(() => store.addMessage('non-existent', message)).not.toThrow()
    })
  })

  describe('clearConversations', () => {
    it('should clear all conversations and error', () => {
      const store = useConversationsStore()
      store.conversations = [
        {
          type: 'conversations',
          id: 'conv-1',
          attributes: {
            name: 'Test',
            author: 'user-1',
            messages: [],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        }
      ]
      store.error = 'Some error'
      
      store.clearConversations()
      
      expect(store.conversations).toEqual([])
      expect(store.error).toBeNull()
    })
  })
})
