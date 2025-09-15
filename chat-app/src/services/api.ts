import type {
  ApiErrorResponse,
  AuthResponse,
  Message,
  Conversation,
  ConversationsResponse,
  ConversationResponse,
  MessageResponse
} from '@/types'


const API_BASE_URL = 'http://localhost:9293'

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }

    if (this.token) {
      headers.Authorization = this.token
      console.log('🔑 Using auth token:', this.token.substring(0, 8) + '...')
    } else {
      console.log('⚠️ No auth token available')
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log(`📡 API Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json()
        const error = errorData.errors[0]
        throw new Error(error.detail || error.title || 'API request failed')
      }

      const data = await response.json()
      console.log('📦 API Response data:', data)
      return data
    } catch (error) {
      console.error('💥 API Request failed:', error)
      throw error
    }
  }

  async authenticate(username: string, password: string): Promise<string> {
    const response = await this.request<AuthResponse>('/authenticate', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'authentication',
          attributes: {
            username,
            password
          }
        }
      })
    })

    return response.meta.token
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await this.request<ConversationsResponse>('/conversations')
    return response.data
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await this.request<ConversationResponse>(`/conversations/${id}`)
    return response.data
  }

  async createConversation(name: string): Promise<Conversation> {
    const response = await this.request<ConversationResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'conversations',
          attributes: {
            name
          }
        }
      })
    })

    return response.data
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const response = await this.request<MessageResponse>(`/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'messages',
          attributes: {
            text
          }
        }
      })
    })

    return {
      id: response.data.id,
      text: response.data.attributes.text,
      author: response.data.attributes.author,
      createdAt: response.data.attributes.createdAt
    }
  }

  async updateConversationName(conversationId: string, name: string): Promise<Conversation> {
    const response = await this.request<ConversationResponse>(`/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          type: 'conversations',
          attributes: {
            name
          }
        }
      })
    })

    return response.data
  }
}

export const apiClient = new ApiClient()
