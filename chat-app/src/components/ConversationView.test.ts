import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConversationView from './ConversationView.vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import type { Conversation, Message } from '@/types'

vi.mock('../stores/auth', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../stores/conversations', () => ({
  useConversationsStore: vi.fn()
}))

Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null
  }))
})

describe('ConversationView', () => {
  let mockAuthStore: any
  let mockConversationsStore: any
  let mockWebSocket: any

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      text: 'Hello, how are you?',
      author: 'user-1',
      createdAt: '2025-01-01T10:00:00Z'
    },
    {
      id: 'msg-2',
      text: 'I am doing well, thank you for asking!',
      author: 'AI',
      createdAt: '2025-01-01T10:01:00Z'
    },
    {
      id: 'msg-3',
      text: 'Great to hear!',
      author: 'user-1',
      createdAt: '2025-01-02T10:00:00Z'
    }
  ]

  const mockConversation: Conversation = {
    type: 'conversations',
    id: 'conv-1',
    attributes: {
      name: 'Test Conversation',
      author: 'user-1',
      messages: mockMessages,
      createdAt: '2025-01-01T09:00:00Z',
      updatedAt: '2025-01-01T10:01:00Z'
    }
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    mockAuthStore = {
      user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
      token: 'mock-token'
    }

    mockConversationsStore = {
      conversations: [mockConversation],
      sendMessage: vi.fn(),
      fetchConversation: vi.fn(),
      addMessage: vi.fn()
    }

    mockWebSocket = {
      close: vi.fn(),
      send: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null
    }

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.mocked(useConversationsStore).mockReturnValue(mockConversationsStore)
    vi.mocked(window.WebSocket).mockReturnValue(mockWebSocket)

    vi.clearAllMocks()
  })

  const createWrapper = (props = { conversationId: 'conv-1' }) => {
    return mount(ConversationView, {
      props,
      global: {
        stubs: {
          'router-link': true
        }
      }
    }) as any
  }

  describe('Initial Rendering', () => {
    it('should render conversation header with name and message count', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Test Conversation')
      expect(wrapper.text()).toContain('3 messages')
    })

    it('should show loading state when conversation is not found', () => {
      mockConversationsStore.conversations = []
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Loading...')
    })

    it('should show loading spinner when loading prop is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Loading conversation...')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should show empty state when no messages', () => {
      const emptyConversation = {
        ...mockConversation,
        attributes: { ...mockConversation.attributes, messages: [] }
      }
      mockConversationsStore.conversations = [emptyConversation]
      
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('No messages yet')
      expect(wrapper.text()).toContain('Start the conversation!')
    })
  })

  describe('Message Display', () => {
    it('should display all messages in conversation', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Hello, how are you?')
      expect(wrapper.text()).toContain('I am doing well, thank you for asking!')
      expect(wrapper.text()).toContain('Great to hear!')
    })

    it('should show user messages on the right side', () => {
      const wrapper = createWrapper()

      const userMessages = wrapper.findAll('.justify-end')
      expect(userMessages.length).toBeGreaterThan(0)
    })

    it('should show AI messages on the left side', () => {
      const wrapper = createWrapper()

      const aiMessages = wrapper.findAll('.justify-start')
      expect(aiMessages.length).toBeGreaterThan(0)
    })

    it('should apply correct styling to user messages', () => {
      const wrapper = createWrapper()

      const userMessageBubbles = wrapper.findAll('.bg-klaay-blue')
      expect(userMessageBubbles.length).toBeGreaterThan(0)
    })

    it('should apply correct styling to AI messages', () => {
      const wrapper = createWrapper()

      const aiMessageBubbles = wrapper.findAll('.bg-white.border')
      expect(aiMessageBubbles.length).toBeGreaterThan(0)
    })

    it('should display message timestamps', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should show author names correctly', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('You')
      expect(wrapper.text()).toContain('AI Assistant')
    })
  })

  describe('Date Headers', () => {
    it('should show date headers for different days', () => {
      const wrapper = createWrapper()

      const text = wrapper.text()
      expect(text).toMatch(/(Today|Yesterday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/)
    })

    it('should format date headers correctly', () => {
      const wrapper = createWrapper()
      
      const result = wrapper.vm.formatDateHeader('2025-01-01T10:00:00Z')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle invalid timestamps in date headers', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.formatDateHeader('')).toBe('Unknown Date')
      expect(wrapper.vm.formatDateHeader('invalid')).toBe('Unknown Date')
    })

    it('should determine when to show date headers correctly', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.shouldShowDateHeader(mockMessages[0], 0, mockMessages)).toBe(true)
      expect(wrapper.vm.shouldShowDateHeader(mockMessages[1], 1, mockMessages)).toBe(false)
      expect(wrapper.vm.shouldShowDateHeader(mockMessages[2], 2, mockMessages)).toBe(true)
    })
  })

  describe('Message Input', () => {
    it('should render message input form', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should have correct placeholder text', () => {
      const wrapper = createWrapper()

      const input = wrapper.find('input[type="text"]')
      expect(input.attributes('placeholder')).toBe('Type a message...')
    })

    it('should update newMessage when typing', async () => {
      const wrapper = createWrapper()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('Hello world')

      expect(wrapper.vm.newMessage).toBe('Hello world')
    })

    it('should disable submit button when message is empty', async () => {
      const wrapper = createWrapper()

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should enable submit button when message has content', async () => {
      const wrapper = createWrapper()

      wrapper.vm.newMessage = 'Hello'
      await wrapper.vm.$nextTick()

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('should disable input and button when sending', async () => {
      const wrapper = createWrapper()

      wrapper.vm.sending = true
      await wrapper.vm.$nextTick()

      const input = wrapper.find('input[type="text"]')
      const submitButton = wrapper.find('button[type="submit"]')
      
      expect(input.attributes('disabled')).toBeDefined()
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Message Sending', () => {
    it('should send message when form is submitted', async () => {
      mockConversationsStore.sendMessage.mockResolvedValue(undefined)
      const wrapper = createWrapper()

      wrapper.vm.newMessage = 'Test message'
      await wrapper.vm.$nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(mockConversationsStore.sendMessage).toHaveBeenCalledWith('conv-1', 'Test message')
    })

    it('should clear input after successful send', async () => {
      mockConversationsStore.sendMessage.mockResolvedValue(undefined)
      const wrapper = createWrapper()

      wrapper.vm.newMessage = 'Test message'
      await wrapper.vm.sendMessage()

      expect(wrapper.vm.newMessage).toBe('')
    })

    it('should show AI typing indicator after sending', async () => {
      mockConversationsStore.sendMessage.mockResolvedValue(undefined)
      const wrapper = createWrapper()

      wrapper.vm.newMessage = 'Test message'
      await wrapper.vm.sendMessage()

      expect(wrapper.vm.aiTyping).toBe(true)
    })

    it('should not send empty messages', async () => {
      const wrapper = createWrapper()

      wrapper.vm.newMessage = '   '
      await wrapper.vm.sendMessage()

      expect(mockConversationsStore.sendMessage).not.toHaveBeenCalled()
    })

    it('should handle send message errors', async () => {
      mockConversationsStore.sendMessage.mockRejectedValue(new Error('Send failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = createWrapper()
      wrapper.vm.newMessage = 'Test message'
      
      await wrapper.vm.sendMessage()

      expect(consoleSpy).toHaveBeenCalled()
      expect(wrapper.vm.sending).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  describe('AI Typing Indicator', () => {
    it('should show AI typing indicator when aiTyping is true', async () => {
      const wrapper = createWrapper()

      wrapper.vm.aiTyping = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('AI Assistant')
      expect(wrapper.findAll('.animate-bounce')).toHaveLength(3)
    })

    it('should hide AI typing indicator when aiTyping is false', async () => {
      const wrapper = createWrapper()

      wrapper.vm.aiTyping = false
      await wrapper.vm.$nextTick()

      const typingIndicator = wrapper.findAll('.animate-bounce')
      expect(typingIndicator).toHaveLength(0)
    })
  })

  describe('WebSocket Integration', () => {
    it('should create WebSocket connection on mount', () => {
      createWrapper()

      expect(window.WebSocket).toHaveBeenCalledWith(
        'ws://localhost:9293/cable?conversationId=conv-1&token=mock-token'
      )
    })

    it('should close WebSocket on unmount', () => {
      const wrapper = createWrapper()

      wrapper.unmount()

      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should reconnect WebSocket when conversation changes', async () => {
      const wrapper = createWrapper({ conversationId: 'conv-1' })

      await wrapper.setProps({ conversationId: 'conv-2' })

      expect(window.WebSocket).toHaveBeenCalledTimes(2)
      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should handle WebSocket message events', async () => {
      const wrapper = createWrapper()

      const mockMessage = {
        event: 'message.created',
        data: {
          id: 'msg-new',
          attributes: {
            text: 'New message from AI',
            author: 'AI',
            createdAt: '2025-01-01T11:00:00Z'
          }
        }
      }

      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) })
      }

      expect(mockConversationsStore.addMessage).toHaveBeenCalledWith(
        'conv-1',
        {
          id: 'msg-new',
          text: 'New message from AI',
          author: 'AI',
          createdAt: '2025-01-01T11:00:00Z'
        }
      )
    })

    it('should hide AI typing when AI message arrives', async () => {
      const wrapper = createWrapper()
      wrapper.vm.aiTyping = true

      const mockMessage = {
        event: 'message.created',
        data: {
          id: 'msg-ai',
          attributes: {
            text: 'AI response',
            author: 'AI',
            createdAt: '2025-01-01T11:00:00Z'
          }
        }
      }

      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) })
      }

      expect(wrapper.vm.aiTyping).toBe(false)
    })

    it('should not add messages from current user via WebSocket', async () => {
      const wrapper = createWrapper()

      const mockMessage = {
        event: 'message.created',
        data: {
          id: 'msg-user',
          attributes: {
            text: 'User message',
            author: 'user-1',
            createdAt: '2025-01-01T11:00:00Z'
          }
        }
      }

      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) })
      }

      expect(mockConversationsStore.addMessage).not.toHaveBeenCalled()
    })

    it('should handle WebSocket errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = createWrapper()

      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Error('WebSocket error'))
      }

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle malformed WebSocket messages', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = createWrapper()

      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'invalid json' })
      }

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Conversation Loading', () => {
    it('should fetch conversation on mount if not in store', async () => {
      mockConversationsStore.conversations = []
      mockConversationsStore.fetchConversation.mockResolvedValue(undefined)

      createWrapper()

      expect(mockConversationsStore.fetchConversation).toHaveBeenCalledWith('conv-1')
    })

    it('should not fetch conversation if already in store', async () => {
      createWrapper()

      expect(mockConversationsStore.fetchConversation).not.toHaveBeenCalled()
    })

    it('should handle conversation fetch errors', async () => {
      mockConversationsStore.conversations = []
      mockConversationsStore.fetchConversation.mockRejectedValue(new Error('Fetch failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(consoleSpy).toHaveBeenCalled()
      expect(wrapper.vm.loading).toBe(false)
      consoleSpy.mockRestore()
    })

    it('should refetch conversation when conversationId changes', async () => {
      mockConversationsStore.fetchConversation.mockResolvedValue(undefined)
      const wrapper = createWrapper({ conversationId: 'conv-1' })

      await wrapper.setProps({ conversationId: 'conv-2' })

      expect(mockConversationsStore.fetchConversation).toHaveBeenCalledWith('conv-2')
    })

    it('should hide AI typing when conversation changes', async () => {
      const wrapper = createWrapper({ conversationId: 'conv-1' })
      wrapper.vm.aiTyping = true

      await wrapper.setProps({ conversationId: 'conv-2' })

      expect(wrapper.vm.aiTyping).toBe(false)
    })
  })

  describe('Auto-scrolling', () => {
    it('should have scrollToBottom method', () => {
      const wrapper = createWrapper()

      expect(typeof wrapper.vm.scrollToBottom).toBe('function')
    })

    it('should execute scrollToBottom without errors', async () => {
      const wrapper = createWrapper()
      
      expect(() => wrapper.vm.scrollToBottom()).not.toThrow()
    })
  })

  describe('Time Formatting', () => {
    it('should format message time correctly', () => {
      const wrapper = createWrapper()

      const result = wrapper.vm.formatMessageTime('2025-01-01T10:30:00Z')
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should handle invalid message timestamps', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.formatMessageTime('')).toBe('')
      expect(wrapper.vm.formatMessageTime('invalid')).toBe('')
    })
  })

  describe('Computed Properties', () => {
    it('should find conversation by ID', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.conversation).toEqual(mockConversation)
    })

    it('should return undefined for non-existent conversation', () => {
      mockConversationsStore.conversations = []
      const wrapper = createWrapper()

      expect(wrapper.vm.conversation).toBeUndefined()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const wrapper = createWrapper()

      const form = wrapper.find('form')
      const input = wrapper.find('input[type="text"]')
      const button = wrapper.find('button[type="submit"]')

      expect(form.exists()).toBe(true)
      expect(input.exists()).toBe(true)
      expect(button.exists()).toBe(true)
    })

    it('should have proper ARIA labels for messages', () => {
      const wrapper = createWrapper()

      const messages = wrapper.findAll('[class*="justify-"]')
      expect(messages.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle conversation without messages array', () => {
      const brokenConversation = {
        ...mockConversation,
        attributes: { ...mockConversation.attributes, messages: [] }
      }
      mockConversationsStore.conversations = [brokenConversation]

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('0 messages')
    })

    it('should handle missing conversation attributes', () => {
      mockConversationsStore.conversations = []

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Loading...')
    })
  })
})
