describe('Complete User Workflows', () => {
  describe('New User Journey', () => {
    it('should complete full onboarding flow', () => {
      cy.login('user2', 'password2')
      
      cy.createConversation('My First Chat')
      cy.sendMessage('Hello, this is my first message!')
      cy.waitForAIResponse()
      
      cy.get('[data-cy="message"]').should('contain', 'AI Assistant')
      cy.get('[data-cy="conversation-list"]').should('contain', 'Hello, this is my first message!')
    })
  })

  describe('Power User Workflow', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should manage multiple conversations efficiently', () => {
      cy.createConversation('Work Discussion')
      cy.sendMessage('What are the quarterly goals?')
      cy.waitForAIResponse()
      
      cy.createConversation('Personal Planning')
      cy.sendMessage('Help me plan my weekend')
      cy.waitForAIResponse()
      
      cy.selectConversation(0)
      cy.contains('What are the quarterly goals?').should('be.visible')
      
      cy.selectConversation(1)
      cy.contains('Help me plan my weekend').should('be.visible')
    })

    it('should handle conversation editing workflow', () => {
      cy.selectConversation(0)
      
      cy.get('[data-cy="conversation-item"]').first().within(() => {
        cy.get('[data-cy="edit-conversation"]').click({ force: true })
        cy.get('input').clear().type('Updated Conversation Name')
        cy.get('[data-cy="save-conversation"]').click()
      })
      
      cy.contains('Updated Conversation Name').should('be.visible')
      cy.sendMessage('Testing the renamed conversation')
      cy.waitForAIResponse()
    })
  })

  describe('Error Recovery Workflow', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should recover from network interruptions', () => {
      cy.selectConversation(0)
      
      cy.intercept('POST', '/api/conversations/*/messages', { statusCode: 500 }).as('serverError')
      
      cy.sendMessage('This message might fail')
      cy.wait('@serverError')
      
      cy.intercept('POST', '/api/conversations/*/messages').as('successfulSend')
      
      cy.sendMessage('This message should succeed')
      cy.wait('@successfulSend')
      cy.contains('This message should succeed').should('be.visible')
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should work consistently across different viewports', () => {
      cy.login()
      
      cy.checkResponsive('iphone-6')
      cy.selectConversation(0)
      cy.sendMessage('Mobile test message')
      
      cy.checkResponsive('ipad-2')
      cy.contains('Mobile test message').should('be.visible')
      
      cy.checkResponsive('macbook-15')
      cy.contains('Mobile test message').should('be.visible')
    })
  })

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      cy.login()
      cy.selectConversation(0)
      cy.sendMessage('Session persistence test')
      
      cy.reload()
      cy.url().should('include', '/chat')
      cy.contains('Welcome, user1').should('be.visible')
      cy.contains('Session persistence test').should('be.visible')
    })

    it('should handle logout and re-login', () => {
      cy.login()
      cy.get('button[title="Logout"]').click()
      cy.url().should('include', '/login')
      
      cy.login('user2', 'password2')
      cy.contains('Welcome, user2').should('be.visible')
    })
  })

  describe('Real-time Messaging Flow', () => {
    beforeEach(() => {
      cy.login()
      cy.selectConversation(0)
    })

    it('should handle rapid message exchanges', () => {
      const messages = [
        'First rapid message',
        'Second rapid message', 
        'Third rapid message'
      ]
      
      messages.forEach((message, index) => {
        cy.sendMessage(message)
        if (index < messages.length - 1) {
          cy.wait(500)
        }
      })
      
      cy.waitForAIResponse()
      
      messages.forEach(message => {
        cy.contains(message).should('be.visible')
      })
    })

    it('should maintain conversation context', () => {
      cy.sendMessage('My favorite color is blue')
      cy.waitForAIResponse()
      
      cy.sendMessage('What is my favorite color?')
      cy.waitForAIResponse()
      
      cy.get('[data-cy="message"]').last().should('contain', 'blue')
    })
  })
})
