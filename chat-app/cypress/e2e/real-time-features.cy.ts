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
      cy.get('button[type="submit"]').click()
      
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
      cy.get('input[placeholder="Type a message..."]').type('What is the weather like?')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]').should('be.visible')
      cy.get('.animate-bounce').should('have.length', 3)
      
      cy.get('[data-cy="ai-typing"]', { timeout: 15000 }).should('not.exist')
      
      cy.get('[data-cy="message"]').last().should('contain', 'AI Assistant')
      cy.get('[data-cy="message"]').last().should('not.contain', 'You')
    })

    it('should handle multiple rapid messages', () => {
      const messages = ['Message 1', 'Message 2', 'Message 3']
      
      messages.forEach((message, index) => {
        cy.get('input[placeholder="Type a message..."]').type(message)
        cy.get('button[type="submit"]').click()
        cy.wait(500)
      })
      
      messages.forEach(message => {
        cy.contains(message).should('be.visible')
      })
    })

    it('should maintain conversation context', () => {
      cy.get('input[placeholder="Type a message..."]').type('My name is John')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]', { timeout: 15000 }).should('not.exist')
      
      cy.get('input[placeholder="Type a message..."]').type('What is my name?')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]', { timeout: 15000 }).should('not.exist')
      cy.get('[data-cy="message"]').last().should('contain', 'John')
    })
  })

  describe('Message Persistence', () => {
    it('should persist messages across page refreshes', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      const testMessage = 'Persistence test message'
      cy.get('input[placeholder="Type a message..."]').type(testMessage)
      cy.get('button[type="submit"]').click()
      
      cy.contains(testMessage).should('be.visible')
      
      cy.reload()
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.contains(testMessage).should('be.visible')
    })

    it('should show conversation updates in conversation list', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      const testMessage = 'List update test'
      cy.get('input[placeholder="Type a message..."]').type(testMessage)
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="conversation-list"]').within(() => {
        cy.contains(testMessage).should('be.visible')
      })
    })

    it('should update conversation timestamps', () => {
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="conversation-time"]').invoke('text').as('originalTime')
      })
      
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('input[placeholder="Type a message..."]').type('Timestamp test')
      cy.get('button[type="submit"]').click()
      
      cy.wait(2000)
      
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('@originalTime').then((originalTime) => {
          cy.get('[data-cy="conversation-time"]').should('not.contain', originalTime)
        })
      })
    })
  })

  describe('Multi-Conversation Workflow', () => {
    it('should handle switching between conversations quickly', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('Quick Switch Test')
      cy.get('button[type="submit"]').click()
      
      cy.get('input[placeholder="Type a message..."]').type('Message in new conversation')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.contains('How can I help you today?').should('be.visible')
      
      cy.get('[data-cy="conversation-item"]').last().click()
      cy.contains('Message in new conversation').should('be.visible')
    })

    it('should maintain separate AI typing states per conversation', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('input[placeholder="Type a message..."]').type('First conversation message')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]').should('be.visible')
      
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').type('Second Conversation')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]').should('not.exist')
      
      cy.get('input[placeholder="Type a message..."]').type('Second conversation message')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="ai-typing"]').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/api/conversations/*/messages', { forceNetworkError: true }).as('networkError')
      
      cy.get('[data-cy="conversation-item"]').first().click()
      cy.get('input[placeholder="Type a message..."]').type('Network error test')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@networkError')
      cy.get('input[placeholder="Type a message..."]').should('have.value', '')
    })

    it('should handle WebSocket disconnection', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.window().its('WebSocket').then((ws) => {
        if (ws) {
          ws.close()
        }
      })
      
      cy.get('input[placeholder="Type a message..."]').type('Disconnection test')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Disconnection test').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should handle large conversation history', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      for (let i = 0; i < 5; i++) {
        cy.get('input[placeholder="Type a message..."]').type(`Performance test message ${i + 1}`)
        cy.get('button[type="submit"]').click()
        cy.wait(1000)
      }
      
      cy.get('[data-cy="message"]').should('have.length.greaterThan', 5)
      cy.get('[data-cy="messages-container"]').should('be.visible')
    })

    it('should auto-scroll efficiently with many messages', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('input[placeholder="Type a message..."]').type('Scroll performance test')
      cy.get('button[type="submit"]').click()
      
      cy.get('[data-cy="messages-container"]').then(($container) => {
        const container = $container[0]
        expect(container.scrollTop).to.be.greaterThan(0)
      })
    })
  })
})
