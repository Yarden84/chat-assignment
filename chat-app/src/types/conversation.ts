export interface Message {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface ConversationAttributes {
  name: string
  author: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  type: 'conversations'
  id: string
  attributes: ConversationAttributes
}

export interface ConversationsResponse {
  data: Conversation[]
}

export interface ConversationResponse {
  data: Conversation
}

export interface MessageResponse {
  data: {
    type: 'messages'
    id: string
    attributes: {
      text: string
      author: string
      createdAt: string
    }
  }
}
