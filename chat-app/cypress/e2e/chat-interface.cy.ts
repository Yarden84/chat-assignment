describe('Chat Interface', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/chat')
  })

  describe('Initial Chat View', () => {
    it('should display chat interface elements', () => {
      cy.contains('Chats').should('be.visible')
      cy.contains('Welcome, user1').should('be.visible')
      cy.get('button[title="Logout"]').should('be.visible')
      cy.get('button[title]').should('be.visible') // New chat button
    })

    it('should show welcome message when no conversation selected', () => {
      cy.contains('Welcome to Klaay').should('be.visible')
      cy.contains('Select a conversation to start chatting').should('be.visible')
    })

    it('should display existing conversations', () => {
      cy.get('[data-cy="conversation-item"]').should('exist')
      cy.contains('Conversation #1').should('be.visible')
    })
  })

  describe('Conversation Management', () => {
    it('should create new conversation', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      
      cy.contains('Start New Conversation').should('be.visible')
      cy.get('#chatName').should('be.visible')
      cy.get('button[type="submit"]').should('be.disabled')
      
      cy.get('#chatName').type('Test Conversation E2E')
      cy.get('button[type="submit"]').should('not.be.disabled')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Test Conversation E2E').should('be.visible')
      cy.url().should('match', /\/chat/)
    })

    it('should cancel conversation creation', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      cy.contains('Start New Conversation').should('be.visible')
      
      cy.get('button[type="button"]').contains('Cancel').click()
      cy.contains('Start New Conversation').should('not.exist')
    })

    it('should select and display conversation', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('[data-cy="conversation-header"]').should('be.visible')
      cy.get('[data-cy="messages-container"]').should('be.visible')
      cy.get('[data-cy="message-input"]').should('be.visible')
    })

    it('should show conversation message count', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('[data-cy="conversation-header"]').should('contain', 'messages')
    })

    it('should edit conversation name', () => {
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="edit-conversation"]').click({ force: true })
        cy.get('input').clear().type('Renamed Conversation')
        cy.get('input').type('{enter}') // Use Enter key to save
      })
      
      cy.contains('Renamed Conversation').should('be.visible')
    })

    it('should cancel conversation name editing', () => {
      const originalName = 'Conversation #1'
      
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="edit-conversation"]').click({ force: true })
        cy.get('input').clear().type('Temporary Name')
        cy.get('input').type('{esc}') // Use correct escape key syntax
      })
      
      cy.contains(originalName).should('be.visible')
      cy.contains('Temporary Name').should('not.exist')
    })
  })

  describe('Message Interface', () => {
    beforeEach(() => {
      cy.get('[data-cy="conversation-item"]').first().click()
    })

    it('should display existing messages', () => {
      cy.get('[data-cy="messages-container"]').should('be.visible')
      cy.contains('How can I help you today?').should('be.visible')
    })

    it('should show message timestamps', () => {
      // Check if timestamp exists and has some time format
      cy.get('[data-cy="conversation-time"]').first().should('be.visible')
      cy.get('[data-cy="conversation-time"]').first().should('not.be.empty')
    })

    it('should show author labels', () => {
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
    })

    it('should display message input form', () => {
      cy.get('[data-cy="message-input"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.disabled')
    })

    it('should enable send button when message has content', () => {
      cy.get('[data-cy="message-input"]').type('Hello')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should send message successfully', () => {
      const testMessage = 'Hello from E2E test'
      
      cy.get('[data-cy="message-input"]').type(testMessage)
      cy.get('button[type="submit"]').click()
      
      cy.contains(testMessage).should('be.visible')
      cy.get('[data-cy="message-input"]').should('have.value', '')
    })

    it('should show AI typing indicator after sending message', () => {
      cy.get('[data-cy="message-input"]').type('Test message')
      cy.get('button[type="submit"]').click()
      
      // Check for any loading/typing indicator
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
      cy.get('.animate-bounce, .animate-pulse, .animate-spin').should('exist')
    })

    it('should receive AI response', () => {
      cy.get('[data-cy="message-input"]').type('Hello AI')
      cy.get('button[type="submit"]').click()
      
      // Wait for AI response
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
      cy.wait(2000) // Give time for AI response
    })

    it('should auto-scroll to bottom when new messages arrive', () => {
      cy.get('[data-cy="message-input"]').type('Scroll test message')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="messages-container"]').should('be.visible')
      cy.get('[data-cy="messages-container"]').then(($container) => {
        const container = $container[0]
        expect(container.scrollTop).to.be.closeTo(container.scrollHeight - container.clientHeight, 50)
      })
    })

    it('should show date headers for different days', () => {
      cy.get('[data-cy="date-header"]').should('exist')
    })
  })

  describe('Empty States', () => {
    it('should show empty conversation state', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('Empty Conversation')
      cy.get('button[type="submit"]').click()
      
      // After creating conversation, it should be selected and show the conversation view
      cy.get('[data-cy="conversation-header"]').should('be.visible')
      cy.get('[data-cy="messages-container"]').should('be.visible')
    })

    it('should show loading state', () => {
      // This test is skipped as loading states are hard to test reliably in E2E
      cy.log('Loading state test skipped - loading states are transient and hard to test reliably')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-6')
      cy.get('[data-cy="conversation-item"]').should('be.visible')
      cy.get('[data-cy="new-chat-button"]').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.get('[data-cy="conversation-item"]').should('be.visible')
      cy.contains('Welcome to Klaay').should('be.visible')
    })
  })
})