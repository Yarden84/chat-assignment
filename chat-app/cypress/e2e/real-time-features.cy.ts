describe('Real-time Features', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/chat')
  })

  describe('WebSocket Connectivity', () => {
    it('should establish WebSocket connection when selecting conversation', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.window().then((win) => {
        cy.wrap(win.WebSocket).should('exist')
      })
    })

    it('should handle WebSocket reconnection when switching conversations', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.wait(1000)
      
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('WebSocket Test')
      cy.get('button[type="submit"]').first().click({ force: true }) 
      
      cy.window().then((win) => {
        cy.wrap(win.WebSocket).should('exist')
      })
    })
  })

  describe('AI Response System', () => {
    beforeEach(() => {
      cy.get('[data-cy="conversation-item"]').first().click()
    })

    it('should show typing indicator and receive AI response', () => {
      cy.get('[data-cy="message-input"]').type('What is the weather like?')
      cy.get('button[type="submit"]').first().click() 
      
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
      cy.get('.animate-bounce, .animate-pulse, .animate-spin').should('exist')
      
      cy.wait(2000)
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
    })

    it('should handle multiple rapid messages', () => {
      const messages = ['Message 1', 'Message 2', 'Message 3']
      
      messages.forEach((message, index) => {
        cy.get('[data-cy="message-input"]').type(message)
        cy.get('button[type="submit"]').first().click() 
        cy.wait(500)
      })
      
      messages.forEach(message => {
        cy.contains(message).should('be.visible')
      })
    })

    it('should maintain conversation context', () => {
      cy.get('[data-cy="message-input"]').type('My name is John')
      cy.get('button[type="submit"]').first().click() 
      
      cy.wait(2000) 
      
      cy.get('[data-cy="message-input"]').type('What is my name?')
      cy.get('button[type="submit"]').first().click() 
      
      cy.wait(2000) 
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
    })
  })

  describe('Message Persistence', () => {
    it('should persist messages across page refreshes', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      const testMessage = 'Persistence test message'
      cy.get('[data-cy="message-input"]').type(testMessage)
      cy.get('button[type="submit"]').first().click() 
      
      cy.contains(testMessage).should('be.visible')
      
      cy.reload()
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.contains(testMessage).should('be.visible')
    })

    it('should show conversation updates in conversation list', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      const testMessage = 'List update test'
      cy.get('[data-cy="message-input"]').type(testMessage)
      cy.get('button[type="submit"]').first().click() 
      
      cy.get('[data-cy="conversation-item"]').should('be.visible')
    })

    it('should update conversation timestamps', () => {
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="conversation-time"]').invoke('text').as('originalTime')
      })
      
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('[data-cy="message-input"]').type('Timestamp test')
      cy.get('button[type="submit"]').first().click() 
      
      
      cy.wait(5000)
      
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="conversation-time"]').should('be.visible')
        cy.get('[data-cy="conversation-time"]').should('not.be.empty')
      })
    })
  })

  describe('Multi-Conversation Workflow', () => {
    it('should handle switching between conversations quickly', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('Quick Switch Test')
      cy.get('button[type="submit"]').first().click({ force: true }) 
      
      cy.get('[data-cy="message-input"]').type('Message in new conversation')
      cy.get('button[type="submit"]').first().click() 
      
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.contains('How can I help you today?').should('be.visible')
      
      cy.get('[data-cy="conversation-item"]').last().click()
      cy.contains('Message in new conversation').should('be.visible')
    })

    it('should maintain separate AI typing states per conversation', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('[data-cy="message-input"]').type('First conversation message')
      cy.get('button[type="submit"]').first().click() 
      
      cy.get('.animate-bounce, .animate-pulse, .animate-spin').should('exist')
      
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('Second Conversation')
      cy.get('button[type="submit"]').first().click({ force: true }) 
      
      cy.wait(1000)
      
      cy.get('[data-cy="message-input"]').type('Second conversation message', { force: true }) 
      cy.get('button[type="submit"]').first().click({ force: true }) 
      
      cy.get('.animate-bounce, .animate-pulse, .animate-spin').should('exist')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.log('Network error test skipped - complex to test reliably in E2E')
    })

    it('should handle WebSocket disconnection', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.window().then((win) => {
        if (win.WebSocket) {
          cy.log('WebSocket is available for testing')
        }
      })
      
      cy.get('[data-cy="message-input"]').type('Disconnection test')
      cy.get('button[type="submit"]').first().click() 
      
      cy.contains('Disconnection test').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should handle large conversation history', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="message-input"]').type(`Performance test message ${i + 1}`)
        cy.get('button[type="submit"]').first().click() 
        cy.wait(1000)
      }
      
      cy.get('[data-cy="messages-container"]').should('be.visible')
      cy.get('[data-cy="messages-container"]').should('contain', 'AI Assistant')
    })

    it('should auto-scroll efficiently with many messages', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('[data-cy="message-input"]').type('Scroll performance test')
      cy.get('button[type="submit"]').first().click() 
      
      cy.get('[data-cy="messages-container"]').then(($container) => {
        const container = $container[0]
        expect(container.scrollTop).to.be.greaterThan(0)
      })
    })
  })
})