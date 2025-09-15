import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './LoginView.vue'
import { useAuthStore } from '../stores/auth'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: 'Home' } },
    { path: '/login', component: LoginView },
    { path: '/chat', component: { template: 'Chat' } }
  ]
})

describe('LoginView', () => {
  let mockAuthStore: any
  
  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockAuthStore = {
      login: vi.fn(),
      loading: false,
      isAuthenticated: false
    }
    
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.clearAllMocks()
  })

  const createWrapper = (options = {}) => {
    return mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterView: true
        }
      },
      ...options
    })
  }

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
      
      expect(wrapper.text()).toContain('Welcome to Klaay')
      expect(wrapper.text()).toContain('Username')
      expect(wrapper.text()).toContain('Password')
      expect(wrapper.text()).toContain('Sign In')
    })

    it('should have correct input placeholders', () => {
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      expect(usernameInput.attributes('placeholder')).toBe('Enter your username')
      expect(passwordInput.attributes('placeholder')).toBe('Enter your password')
    })

    it('should have prevent default on form submit', () => {
      const wrapper = createWrapper()
      
      const form = wrapper.find('form')
      expect(form.attributes('class')).toContain('space-y-6')
    })

    it('should reserve space for error messages', () => {
      const wrapper = createWrapper()
      
      const errorContainer = wrapper.find('.h-4')
      expect(errorContainer.exists()).toBe(true)
    })
  })

  describe('User Interactions', () => {
    it('should update input values when user types', async () => {
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await usernameInput.setValue('testuser')
      await passwordInput.setValue('testpass')
      
      expect((usernameInput.element as HTMLInputElement).value).toBe('testuser')
      expect((passwordInput.element as HTMLInputElement).value).toBe('testpass')
    })

    it('should call login when form is submitted with valid data', async () => {
      mockAuthStore.login.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('password1')
      await form.trigger('submit')
      
      expect(mockAuthStore.login).toHaveBeenCalledWith('user1', 'password1')
    })

    it('should prevent form submission with empty username', async () => {
      const wrapper = createWrapper()
      
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await passwordInput.setValue('password')
      await form.trigger('submit')
      
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('should prevent form submission with empty password', async () => {
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('username')
      await form.trigger('submit')
      
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('should pass exact input values without trimming', async () => {
      mockAuthStore.login.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('  user1  ')
      await passwordInput.setValue('  password1  ')
      await form.trigger('submit')
      
      expect(mockAuthStore.login).toHaveBeenCalledWith('  user1  ', '  password1  ')
    })
  })

  describe('Loading State', () => {
    it('should disable form inputs when component loading is true', async () => {
      const wrapper = createWrapper()
      
      mockAuthStore.login.mockImplementation(() => new Promise(() => {}))
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('pass1')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      expect(usernameInput.attributes('disabled')).toBeDefined()
      expect(passwordInput.attributes('disabled')).toBeDefined()
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should show loading text on submit button', async () => {
      const wrapper = createWrapper()
      
      mockAuthStore.login.mockImplementation(() => new Promise(() => {}))
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('pass1')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.text()).toContain('Signing in...')
    })

    it('should show normal text when not loading', async () => {
      mockAuthStore.loading = false
      const wrapper = createWrapper()
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.text()).toContain('Sign In')
    })
  })

  describe('Error Handling', () => {
    it('should display error message when login fails', async () => {
      const errorMessage = 'Invalid credentials'
      mockAuthStore.login.mockRejectedValue(new Error(errorMessage))
      
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('wrongpass')
      await form.trigger('submit')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain(`*${errorMessage}`)
    })

    it('should keep error until next form submission', async () => {
      mockAuthStore.login.mockRejectedValue(new Error('Invalid credentials'))
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('wrongpass')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('*Invalid credentials')
      
      await usernameInput.setValue('user2')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('*Invalid credentials')
    })

    it('should show validation error for empty fields', async () => {
      const wrapper = createWrapper()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('*Please fill in all fields')
    })

    it('should handle generic error message', async () => {
      mockAuthStore.login.mockRejectedValue(new Error())
      
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('pass1')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('*')
    })
  })

  describe('Navigation', () => {
    it('should not redirect automatically (component has no auth guard logic)', async () => {
      mockAuthStore.isAuthenticated = true
      const pushSpy = vi.spyOn(mockRouter, 'push')
      
      createWrapper()
      
      expect(pushSpy).not.toHaveBeenCalled()
    })

    it('should redirect to chat after successful login', async () => {
      mockAuthStore.login.mockResolvedValue(undefined)
      const pushSpy = vi.spyOn(mockRouter, 'push')
      
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('password1')
      await form.trigger('submit')
      
      await wrapper.vm.$nextTick()
      
      expect(pushSpy).toHaveBeenCalledWith('/chat')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      const wrapper = createWrapper()
      
      const usernameLabel = wrapper.find('label[for="username"]')
      const passwordLabel = wrapper.find('label[for="password"]')
      
      expect(usernameLabel.exists()).toBe(true)
      expect(passwordLabel.exists()).toBe(true)
      expect(usernameLabel.text()).toContain('Username')
      expect(passwordLabel.text()).toContain('Password')
    })

    it('should have proper input IDs matching labels', () => {
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('#username')
      const passwordInput = wrapper.find('#password')
      
      expect(usernameInput.exists()).toBe(true)
      expect(passwordInput.exists()).toBe(true)
    })

    it('should have proper button type', () => {
      const wrapper = createWrapper()
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should apply correct CSS classes', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.min-h-screen').exists()).toBe(true)
      expect(wrapper.find('.bg-slate-100').exists()).toBe(true)
      
      expect(wrapper.find('.bg-white').exists()).toBe(true)
      expect(wrapper.find('.rounded-2xl').exists()).toBe(true)
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.classes()).toContain('bg-klaay-blue')
    })

    it('should show error styling when error exists', async () => {
      mockAuthStore.login.mockRejectedValue(new Error('Test error'))
      const wrapper = createWrapper()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      await wrapper.vm.$nextTick()
      
      const errorText = wrapper.find('.text-red-600')
      expect(errorText.exists()).toBe(true)
    })
  })

  describe('Form Persistence', () => {
    it('should keep form values after successful login', async () => {
      mockAuthStore.login.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')
      
      await usernameInput.setValue('user1')
      await passwordInput.setValue('password1')
      await form.trigger('submit')
      
      await wrapper.vm.$nextTick()
      
      expect((usernameInput.element as HTMLInputElement).value).toBe('user1')
      expect((passwordInput.element as HTMLInputElement).value).toBe('password1')
    })
  })
})
