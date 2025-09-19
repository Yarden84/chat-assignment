import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NewChatModal from './NewChatModal.vue'

describe('NewChatModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal when isOpen is true', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toBe('Start New Conversation')
  })

  it('should not render modal when isOpen is false', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: false
      }
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('should emit close event when close button is clicked', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const closeButton = wrapper.find('button[type="button"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should emit close event when X button is clicked', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const xButton = wrapper.find('button[class*="p-1 text-gray-400"]')
    await xButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should clear chatName when close is triggered', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('Test Chat')
    expect(input.element.value).toBe('Test Chat')

    const closeButton = wrapper.find('button[type="button"]')
    await closeButton.trigger('click')

    expect(input.element.value).toBe('')
  })

  it('should emit create event with chat name when form is submitted', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('My New Chat')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.emitted('create')).toBeTruthy()
    expect(wrapper.emitted('create')).toHaveLength(1)
    expect(wrapper.emitted('create')?.[0]).toEqual(['My New Chat'])
  })

  it('should not emit create event when chat name is empty', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('   ')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.emitted('create')).toBeFalsy()
  })

  it('should disable submit button when chat name is empty', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should enable submit button when chat name has content', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('Test Chat')

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('should disable submit button when isCreating is true', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true,
        isCreating: true
      }
    })

    const input = wrapper.find('input')
    input.setValue('Test Chat')

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should show creating text when isCreating is true', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true,
        isCreating: true
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Creating...')
  })

  it('should show create text when isCreating is false', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true,
        isCreating: false
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Create')
  })

  it('should apply mobile text class when isMobile is true', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true,
        isMobile: true
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('text-base')
  })

  it('should not apply mobile text class when isMobile is false', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true,
        isMobile: false
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).not.toContain('text-base')
  })

  it('should focus input when modal opens', async () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: false
      }
    })

    await wrapper.setProps({ isOpen: true })
    await nextTick()

    expect(focusSpy).toHaveBeenCalled()
  })

  it('should have correct input attributes', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('chatName')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('Enter conversation name')
  })

  it('should have correct label for input', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const label = wrapper.find('label')
    expect(label.attributes('for')).toBe('chatName')
    expect(label.text()).toBe('Conversation Name')
  })

  it('should have proper button order classes', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const cancelButton = wrapper.find('button[type="button"]')
    const submitButton = wrapper.find('button[type="submit"]')

    expect(cancelButton.classes()).toContain('order-2')
    expect(cancelButton.classes()).toContain('sm:order-1')
    expect(submitButton.classes()).toContain('order-1')
    expect(submitButton.classes()).toContain('sm:order-2')
  })

  it('should have responsive button classes', () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const cancelButton = wrapper.find('button[type="button"]')
    const submitButton = wrapper.find('button[type="submit"]')

    expect(cancelButton.classes()).toContain('w-full')
    expect(cancelButton.classes()).toContain('sm:w-auto')
    expect(submitButton.classes()).toContain('w-full')
    expect(submitButton.classes()).toContain('sm:w-auto')
  })

  it('should trim whitespace from chat name before emitting', async () => {
    const wrapper = mount(NewChatModal, {
      props: {
        isOpen: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('  Test Chat  ')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.emitted('create')?.[0]).toEqual(['Test Chat'])
  })
})
