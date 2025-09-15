import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatConversationTime,
  formatConversationDate,
  formatMessageTime,
  formatDateHeader,
  shouldShowDateHeader
} from './timeFormatters'

describe('Time Formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-15T15:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatConversationTime', () => {
    it('should return "now" for timestamps less than 1 minute ago', () => {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()
      expect(formatConversationTime(thirtySecondsAgo)).toBe('now')
    })

    it('should return minutes for timestamps less than 1 hour ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      expect(formatConversationTime(fiveMinutesAgo)).toBe('5m')
      expect(formatConversationTime(thirtyMinutesAgo)).toBe('30m')
    })

    it('should return hours for timestamps less than 24 hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      
      expect(formatConversationTime(twoHoursAgo)).toBe('2h')
      expect(formatConversationTime(twentyHoursAgo)).toBe('20h')
    })

    it('should return days for timestamps less than 7 days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      
      expect(formatConversationTime(twoDaysAgo)).toBe('2d')
      expect(formatConversationTime(sixDaysAgo)).toBe('6d')
    })

    it('should return formatted date for timestamps older than 7 days', () => {
      const tenDaysAgo = new Date('2025-12-05T15:00:00Z').toISOString()
      expect(formatConversationTime(tenDaysAgo)).toBe('Dec 5')
    })

    it('should handle empty or invalid timestamps', () => {
      expect(formatConversationTime('')).toBe('')
      expect(formatConversationTime('invalid-date')).toBe('')
    })
  })

  describe('formatConversationDate', () => {
    it('should return time for today', () => {
      const todayMorning = new Date('2025-12-15T09:30:00').toISOString()
      const result = formatConversationDate(todayMorning)
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date('2025-12-14T15:00:00Z').toISOString()
      expect(formatConversationDate(yesterday)).toBe('Yesterday')
    })

    it('should return formatted date for older dates', () => {
      const lastWeek = new Date('2025-12-08T15:00:00Z').toISOString()
      expect(formatConversationDate(lastWeek)).toBe('Dec 8')
    })

    it('should handle empty or invalid timestamps', () => {
      expect(formatConversationDate('')).toBe('')
      expect(formatConversationDate('invalid-date')).toBe('')
    })
  })

  describe('formatMessageTime', () => {
    it('should format time correctly', () => {
      const morning = new Date('2025-12-15T09:30:00').toISOString()
      const afternoon = new Date('2025-12-15T15:45:00').toISOString()
      
      expect(formatMessageTime(morning)).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
      expect(formatMessageTime(afternoon)).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('should handle empty or invalid timestamps', () => {
      expect(formatMessageTime('')).toBe('')
      expect(formatMessageTime('invalid-date')).toBe('')
    })
  })

  describe('formatDateHeader', () => {
    it('should return "Today" for today', () => {
      const today = new Date('2025-12-15T09:30:00Z').toISOString()
      expect(formatDateHeader(today)).toBe('Today')
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date('2025-12-14T15:00:00Z').toISOString()
      expect(formatDateHeader(yesterday)).toBe('Yesterday')
    })

    it('should return full date for older dates', () => {
      const lastWeek = new Date('2025-12-08T15:00:00Z').toISOString()
      expect(formatDateHeader(lastWeek)).toBe('Monday, December 8, 2025')
    })

    it('should handle invalid timestamps', () => {
      expect(formatDateHeader('')).toBe('Unknown Date')
      expect(formatDateHeader('invalid-date')).toBe('Unknown Date')
    })
  })

  describe('shouldShowDateHeader', () => {
    it('should always show header for first message', () => {
      const messages = [
        { createdAt: '2025-12-15T09:00:00Z' }
      ]
      expect(shouldShowDateHeader(messages[0], 0, messages)).toBe(true)
    })

    it('should show header when date changes', () => {
      const messages = [
        { createdAt: '2025-12-14T12:00:00Z' }, 
        { createdAt: '2025-12-15T12:00:00Z' } 
      ]
      expect(shouldShowDateHeader(messages[1], 1, messages)).toBe(true)
    })

    it('should not show header when date is same', () => {
      const messages = [
        { createdAt: '2025-12-15T09:00:00Z' },
        { createdAt: '2025-12-15T15:00:00Z' }  
      ]
      expect(shouldShowDateHeader(messages[1], 1, messages)).toBe(false)
    })

    it('should handle missing timestamps', () => {
      const messages = [
        { createdAt: '' },
        { createdAt: '2025-12-15T15:00:00Z' }
      ]
      expect(shouldShowDateHeader(messages[1], 1, messages)).toBe(false)
    })
  })
})
