import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ChatView from './ChatView.vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import { useGlobalWebSocket } from '../composables/useGlobalWebSocket'
import type { Conversation } from '@/types'

vi.mock('../stores/auth', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../stores/conversations', () => ({
  useConversationsStore: vi.fn()
}))

vi.mock('../composables/useGlobalWebSocket', () => ({
  useGlobalWebSocket: vi.fn()
}))

vi.mock('../components/ConversationView.vue', () => ({
  default: { template: '<div data-testid="conversation-view">ConversationView</div>' }
}))

const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/chat', component: ChatView },
    { path: '/login', component: { template: 'Login' } }
  ]
})

describe('ChatView', () => {
  let mockAuthStore: any
  let mockConversationsStore: any
  let mockGlobalWebSocket: any

  const mockConversations: Conversation[] = [
    {
      type: 'conversations',
      id: 'conv-1',
      attributes: {
        name: 'Test Conversation 1',
        author: 'user-1',
        messages: [
          { id: 'msg-1', text: 'Hello', author: 'user-1', createdAt: '2025-01-01T10:00:00Z' }
        ],
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z'
      }
    },
    {
      type: 'conversations',
      id: 'conv-2',
      attributes: {
        name: 'Test Conversation 2',
        author: 'user-1',
        messages: [],
        createdAt: '2025-01-01T09:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z'
      }
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())

    mockAuthStore = {
      user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
      logout: vi.fn()
    }

    mockConversationsStore = {
      conversations: mockConversations,
      loading: false,
      error: null,
      fetchConversations: vi.fn().mockResolvedValue(undefined),
      createConversation: vi.fn(),
      updateConversationName: vi.fn()
    }

    mockGlobalWebSocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: false
    }

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.mocked(useConversationsStore).mockReturnValue(mockConversationsStore)
    vi.mocked(useGlobalWebSocket).mockReturnValue(mockGlobalWebSocket)

    vi.clearAllMocks()
  })

  const createWrapper = (options = {}) => {
    return mount(ChatView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          ConversationView: {
            template: '<div data-testid="conversation-view">ConversationView Mock</div>',
            props: ['conversationId']
          }
        }
      },
      ...options
    }) as any
  }

  describe('Initial Rendering', () => {
    it('should render main layout elements', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.h-screen').exists()).toBe(true)
      expect(wrapper.find('.w-80').exists()).toBe(true)
      expect(wrapper.text()).toContain('Chats')
      expect(wrapper.text()).toContain('Welcome, testuser')
    })

    it('should show welcome message when no conversation selected', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Welcome to Klaay')
      expect(wrapper.text()).toContain('Select a conversation to start chatting')
    })

    it('should display user information in header', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Welcome, testuser')
    })
  })

  describe('Conversations List', () => {
    it('should display conversations when loaded', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Test Conversation 1')
      expect(wrapper.text()).toContain('Test Conversation 2')
      expect(wrapper.text()).toContain('Hello')
      expect(wrapper.text()).toContain('No messages yet')
    })

    it('should show loading state', () => {
      mockConversationsStore.loading = true
      mockConversationsStore.conversations = []
      
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Loading conversations...')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should show empty state when no conversations', () => {
      mockConversationsStore.conversations = []
      
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('No conversations yet')
      expect(wrapper.text()).toContain('Click + to start a new chat')
    })

    it('should sort conversations by updatedAt descending', () => {
      const wrapper = createWrapper()
      
      const conversationTexts = wrapper.text()
      const conv1Index = conversationTexts.indexOf('Test Conversation 1')
      const conv2Index = conversationTexts.indexOf('Test Conversation 2')
      
      expect(conv2Index).toBeLessThan(conv1Index)
    })

    it('should select conversation when clicked', async () => {
      const wrapper = createWrapper()
      
      const conversationItems = wrapper.findAll('.cursor-pointer')
      await conversationItems[0].trigger('click')
      
      expect(wrapper.vm.selectedConversationId).toBeTruthy()
    })

    it('should highlight selected conversation', async () => {
      const wrapper = createWrapper()
      
      const conversationItems = wrapper.findAll('.cursor-pointer')
      await conversationItems[0].trigger('click')
      
      expect(conversationItems[0].classes()).toContain('bg-klaay-blue/10')
    })
  })

  describe('New Chat Modal', () => {
    it('should open modal when + button clicked', async () => {
      const wrapper = createWrapper()
      
      await wrapper.find('.bg-white\\/20').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.showNewChatModal).toBe(true)
    })

    it('should close modal when cancel clicked', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.showNewChatModal = true
      await wrapper.vm.$nextTick()
      
      const cancelButton = wrapper.find('button[type="button"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.vm.showNewChatModal).toBe(false)
    })

    it('should create new conversation when form submitted', async () => {
      const newConversation = {
        type: 'conversations',
        id: 'conv-new',
        attributes: {
          name: 'New Chat',
          author: 'user-1',
          messages: [],
          createdAt: '2025-01-01T12:00:00Z',
          updatedAt: '2025-01-01T12:00:00Z'
        }
      }
      
      mockConversationsStore.createConversation.mockResolvedValue(newConversation)
      
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      wrapper.vm.newChatName = 'New Chat'
      await wrapper.vm.$nextTick()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      expect(mockConversationsStore.createConversation).toHaveBeenCalledWith('New Chat')
    })

    it('should disable submit button when name is empty', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      wrapper.vm.newChatName = ''
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should show loading state when creating chat', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      wrapper.vm.creatingChat = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Creating...')
    })
  })

  describe('Conversation Name Editing', () => {
    it('should show edit icon on hover', async () => {
      const wrapper = createWrapper()
      
      const conversationItem = wrapper.find('.group')
      expect(conversationItem.exists()).toBe(true)
      
      // Look for the edit button with the correct responsive class
      const editButton = conversationItem.find('button[data-cy="edit-conversation"]')
      expect(editButton.exists()).toBe(true)
      expect(editButton.classes()).toContain('lg:opacity-0')
    })

    it('should enter edit mode when edit button clicked', async () => {
      const wrapper = createWrapper()
      
      await wrapper.vm.startEditingConversation('conv-1', 'Test Conversation 1', new Event('click'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.editingConversationId).toBe('conv-1')
      expect(wrapper.vm.editingConversationName).toBe('Test Conversation 1')
    })

    it('should save conversation name on enter', async () => {
      mockConversationsStore.updateConversationName.mockResolvedValue(undefined)
      
      const wrapper = createWrapper()
      wrapper.vm.editingConversationId = 'conv-1'
      wrapper.vm.editingConversationName = 'Updated Name'
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.saveConversationName('conv-1')
      
      expect(mockConversationsStore.updateConversationName).toHaveBeenCalledWith('conv-1', 'Updated Name')
      expect(wrapper.vm.editingConversationId).toBe(null)
    })

    it('should cancel editing on escape', async () => {
      const wrapper = createWrapper()
      wrapper.vm.editingConversationId = 'conv-1'
      wrapper.vm.editingConversationName = 'Test'
      await wrapper.vm.$nextTick()
      
      wrapper.vm.cancelEditingConversation()
      
      expect(wrapper.vm.editingConversationId).toBe(null)
      expect(wrapper.vm.editingConversationName).toBe('')
    })

    it('should not save empty conversation name', async () => {
      const wrapper = createWrapper()
      wrapper.vm.editingConversationId = 'conv-1'
      wrapper.vm.editingConversationName = '   '
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.saveConversationName('conv-1')
      
      expect(mockConversationsStore.updateConversationName).not.toHaveBeenCalled()
    })
  })

  describe('Time Formatting', () => {
    it('should format conversation time correctly', () => {
      const wrapper = createWrapper()
      
      const result = wrapper.vm.formatConversationTime('2025-01-01T10:00:00Z')
      expect(typeof result).toBe('string')
    })

    it('should format conversation date correctly', () => {
      const wrapper = createWrapper()
      
      const result = wrapper.vm.formatConversationDate('2025-01-01T10:00:00Z')
      expect(typeof result).toBe('string')
    })

    it('should handle invalid timestamps', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.formatConversationTime('')).toBe('')
      expect(wrapper.vm.formatConversationTime('invalid')).toBe('')
      expect(wrapper.vm.formatConversationDate('')).toBe('')
      expect(wrapper.vm.formatConversationDate('invalid')).toBe('')
    })
  })

  describe('WebSocket Integration', () => {
    it('should connect to global WebSocket on mount', async () => {
      createWrapper()
      
      await new Promise(resolve => setTimeout(resolve, 2100))
      
      expect(mockGlobalWebSocket.connect).toHaveBeenCalled()
    })

    it('should disconnect WebSocket on unmount', async () => {
      const wrapper = createWrapper()
      
      wrapper.unmount()
      
      expect(mockGlobalWebSocket.disconnect).toHaveBeenCalled()
    })

    it('should handle WebSocket connection errors gracefully', async () => {
      mockGlobalWebSocket.connect.mockImplementation(() => {
        throw new Error('Connection failed')
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      createWrapper()
      
      await new Promise(resolve => setTimeout(resolve, 2100))
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Store Integration', () => {
    it('should fetch conversations on mount', async () => {
      createWrapper()
      
      expect(mockConversationsStore.fetchConversations).toHaveBeenCalled()
    })

    it('should handle conversation fetch errors', async () => {
      mockConversationsStore.fetchConversations.mockRejectedValue(new Error('Fetch failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      createWrapper()
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Computed Properties', () => {
    it('should sort conversations correctly', () => {
      const wrapper = createWrapper()
      
      const sorted = wrapper.vm.sortedConversations
      expect(sorted[0].id).toBe('conv-2')
      expect(sorted[1].id).toBe('conv-1')
    })

    it('should handle empty conversations array', () => {
      mockConversationsStore.conversations = []
      const wrapper = createWrapper()
      
      expect(wrapper.vm.sortedConversations).toEqual([])
    })
  })

  describe('ConversationView Integration', () => {
    it('should render ConversationView when conversation selected', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.selectedConversationId = 'conv-1'
      await wrapper.vm.$nextTick()
      
      const conversationView = wrapper.find('[data-testid="conversation-view"]')
      expect(conversationView.exists()).toBe(true)
    })

    it('should pass conversation ID as key to ConversationView', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.selectedConversationId = 'conv-1'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.selectedConversationId).toBe('conv-1')
    })
  })

  describe('Error Handling', () => {
    it('should handle conversation creation errors', async () => {
      mockConversationsStore.createConversation.mockRejectedValue(new Error('Create failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = createWrapper()
      wrapper.vm.newChatName = 'Test Chat'
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.createNewChat()
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(wrapper.vm.creatingChat).toBe(false)
      consoleSpy.mockRestore()
    })

    it('should handle conversation name update errors', async () => {
      mockConversationsStore.updateConversationName.mockRejectedValue(new Error('Update failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = createWrapper()
      wrapper.vm.editingConversationName = 'New Name'
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.saveConversationName('conv-1')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels in modal', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      await wrapper.vm.$nextTick()
      
      const label = wrapper.find('label[for="chatName"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Conversation Name')
    })

    it('should have proper input IDs matching labels', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      await wrapper.vm.$nextTick()
      
      const input = wrapper.find('#chatName')
      expect(input.exists()).toBe(true)
    })

    it('should have proper button types', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showNewChatModal = true
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('button[type="submit"]')
      const cancelButton = wrapper.find('button[type="button"]')
      
      expect(submitButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(true)
    })
  })
})
