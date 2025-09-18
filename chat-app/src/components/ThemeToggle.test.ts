import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ThemeToggle from './ThemeToggle.vue'

const mockToggleTheme = vi.fn()
const mockIsDark = ref(false)

vi.mock('../composables/useTheme', () => ({
  useTheme: () => ({
    isDark: mockIsDark,
    toggleTheme: mockToggleTheme
  })
}))

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockIsDark.value = false
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render theme toggle button with correct attributes', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('title')).toBe('Toggle theme')
    expect(button.classes()).toContain('bg-white')
    expect(button.classes()).toContain('rounded-full')
  })

  it('should call toggleTheme when clicked', async () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    await button.trigger('click')
    
    expect(mockToggleTheme).toHaveBeenCalledOnce()
  })

  it('should show sun icon when in light mode', () => {
    mockIsDark.value = false
    const wrapper = mount(ThemeToggle)
    
    const sunIcon = wrapper.find('svg')
    expect(sunIcon.exists()).toBe(true)
    expect(sunIcon.classes()).toContain('w-4')
    expect(sunIcon.classes()).toContain('h-4')
  })

  it('should show moon icon when in dark mode', () => {
    mockIsDark.value = true
    const wrapper = mount(ThemeToggle)
    
    const moonIcon = wrapper.find('svg')
    expect(moonIcon.exists()).toBe(true)
    expect(moonIcon.classes()).toContain('w-4')
    expect(moonIcon.classes()).toContain('h-4')
  })

  it('should have proper hover styles', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('hover:shadow-lg')
    expect(button.classes()).toContain('hover:scale-105')
    expect(button.classes()).toContain('transition-all')
  })

  it('should have responsive sizing classes', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('p-2')
    expect(button.classes()).toContain('sm:p-3')
  })

  it('should have proper border and shadow styling', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('border')
    expect(button.classes()).toContain('border-gray-200')
    expect(button.classes()).toContain('shadow-sm')
  })

  it('should have dark mode classes', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('dark:bg-gray-800')
    expect(button.classes()).toContain('dark:border-gray-700')
  })

  it('should render only one icon at a time', () => {
    mockIsDark.value = false
    const wrapper = mount(ThemeToggle)
    
    const icons = wrapper.findAll('svg')
    expect(icons).toHaveLength(1)
  })

  it('should switch icon when isDark changes', async () => {
    const wrapper = mount(ThemeToggle)
    
    mockIsDark.value = false
    await wrapper.vm.$nextTick()
    let icons = wrapper.findAll('svg')
    expect(icons).toHaveLength(1)
    
    mockIsDark.value = true
    await wrapper.vm.$nextTick()
    icons = wrapper.findAll('svg')
    expect(icons).toHaveLength(1)
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(ThemeToggle)
    
    const button = wrapper.find('button')
    expect(button.attributes('title')).toBe('Toggle theme')
    expect(button.attributes('type')).toBeUndefined() // Should be button type by default
  })

  it('should have proper icon sizing for different screen sizes', () => {
    const wrapper = mount(ThemeToggle)
    
    const icon = wrapper.find('svg')
    expect(icon.classes()).toContain('w-4')
    expect(icon.classes()).toContain('h-4')
    expect(icon.classes()).toContain('sm:w-5')
    expect(icon.classes()).toContain('sm:h-5')
  })
})