import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LogoutButton from './LogoutButton.vue'

const mockLogout = vi.fn()
vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({
    logout: mockLogout
  })
}))

const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('should render logout button with correct attributes', () => {
    const wrapper = mount(LogoutButton)
    
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('title')).toBe('Logout')
    expect(button.classes()).toContain('bg-white')
  })

  it('should call logout and navigate to login when clicked', async () => {
    const wrapper = mount(LogoutButton)
    
    const button = wrapper.find('button')
    await button.trigger('click')
    
    expect(mockLogout).toHaveBeenCalledOnce()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should have logout icon', () => {
    const wrapper = mount(LogoutButton)
    
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('w-4')
  })

  it('should have proper hover styles', () => {
    const wrapper = mount(LogoutButton)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('hover:text-red-600')
    expect(button.classes()).toContain('hover:scale-105')
  })
})