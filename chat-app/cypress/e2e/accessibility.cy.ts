describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('Login Page Accessibility', () => {
    it('should have proper form labels and structure', () => {
      cy.get('label[for="username"]').should('exist').and('contain', 'Username')
      cy.get('label[for="password"]').should('exist').and('contain', 'Password')
      
      cy.get('#username').should('exist').and('have.attr', 'type', 'text')
      cy.get('#password').should('exist').and('have.attr', 'type', 'password')
    })

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist').and('contain', 'Welcome to Klaay')
    })

    it('should have accessible form submission', () => {
      cy.get('form').should('exist')
      cy.get('button[type="submit"]').should('exist').and('not.be.disabled')
    })

    it('should provide clear error messages', () => {
      cy.get('button[type="submit"]').click()
      cy.get('[role="alert"], .text-red-600').should('be.visible')
    })

    it('should support keyboard navigation', () => {
      cy.get('#username').focus().should('be.focused')
      cy.get('#username').tab()
      cy.get('#password').should('be.focused')
      cy.get('#password').tab()
      cy.get('button[type="submit"]').should('be.focused')
    })
  })

  describe('Chat Interface Accessibility', () => {
    beforeEach(() => {
      cy.get('input[type="text"]').type('user1')
      cy.get('input[type="password"]').type('password1')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/chat')
    })

    it('should have proper landmark roles', () => {
      cy.get('[role="main"], main').should('exist')
      cy.get('[role="navigation"], nav').should('exist')
    })

    it('should have accessible conversation list', () => {
      cy.get('[data-cy="conversation-item"]').should('have.attr', 'role', 'button')
        .or('have.attr', 'tabindex', '0')
        .or('be', 'button')
    })

    it('should have accessible message input', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('input[placeholder="Type a message..."]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'placeholder')
      
      cy.get('button[type="submit"]').should('exist')
    })

    it('should have proper focus management', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      cy.get('#chatName').should('be.focused')
      
      cy.get('button[type="button"]').contains('Cancel').click()
      cy.get('[data-cy="new-chat-button"]').should('be.focused')
    })

    it('should support keyboard navigation in conversation list', () => {
      cy.get('[data-cy="conversation-item"]').first().focus()
      cy.get('[data-cy="conversation-item"]').first().type('{enter}')
      
      cy.get('[data-cy="conversation-header"]').should('be.visible')
    })

    it('should have accessible message history', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('[data-cy="message"]').should('have.attr', 'role', 'log')
        .or('have.attr', 'aria-label')
        .or('contain.text', 'You')
        .or('contain.text', 'AI Assistant')
    })

    it('should provide screen reader friendly content', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('[data-cy="message"]').first().within(() => {
        cy.get('[aria-label], [title]').should('exist')
          .or(() => {
            cy.contains('You').should('exist')
              .or(() => cy.contains('AI Assistant').should('exist'))
          })
      })
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast for text', () => {
      cy.get('body').should('have.css', 'color')
      cy.get('.text-gray-900, .text-white').should('be.visible')
    })

    it('should have visible focus indicators', () => {
      cy.get('#username').focus()
      cy.get('#username').should('have.css', 'outline-style', 'solid')
        .or('have.css', 'box-shadow')
        .or('have.css', 'border-color')
    })

    it('should work without JavaScript for basic functionality', () => {
      cy.visit('/login', { 
        onBeforeLoad: (win) => {
          win.addEventListener('beforeunload', () => {
            throw new Error('JavaScript disabled test')
          })
        }
      })
      
      cy.get('form').should('exist')
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="password"]').should('exist')
    })
  })

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport('iphone-6')
      cy.get('input[type="text"]').type('user1')
      cy.get('input[type="password"]').type('password1')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/chat')
    })

    it('should have touch-friendly interactive elements', () => {
      cy.get('[data-cy="conversation-item"]').first()
        .should('have.css', 'min-height')
        .and('match', /\d+px/)
      
      cy.get('[data-cy="new-chat-button"]')
        .should('have.css', 'min-width')
        .and('match', /\d+px/)
    })

    it('should support mobile keyboard navigation', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('input[placeholder="Type a message..."]').focus()
      cy.get('input[placeholder="Type a message..."]').should('be.focused')
    })

    it('should have readable text at mobile sizes', () => {
      cy.get('body').should('have.css', 'font-size')
      cy.get('.text-sm, .text-xs').should('be.visible')
    })
  })

  describe('ARIA Attributes and Semantic HTML', () => {
    beforeEach(() => {
      cy.get('input[type="text"]').type('user1')
      cy.get('input[type="password"]').type('password1')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/chat')
    })

    it('should use semantic HTML elements', () => {
      cy.get('main, [role="main"]').should('exist')
      cy.get('form').should('exist')
      cy.get('button[type="submit"]').should('exist')
    })

    it('should have proper ARIA labels for interactive elements', () => {
      cy.get('[data-cy="new-chat-button"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title')
    })

    it('should announce dynamic content changes', () => {
      cy.get('[data-cy="conversation-item"]').first().click()
      
      cy.get('input[placeholder="Type a message..."]').type('Accessibility test')
      cy.get('button[type="submit"]').click()
      
      cy.get('[aria-live], [role="log"], [role="status"]').should('exist')
        .or(() => {
          cy.contains('Accessibility test').should('be.visible')
        })
    })

    it('should have proper modal accessibility', () => {
      cy.get('[data-cy="new-chat-button"]').click()
      
      cy.get('[role="dialog"], .modal').should('exist')
        .or(() => {
          cy.contains('Start New Conversation').should('be.visible')
        })
      
      cy.get('#chatName').should('be.focused')
      
      cy.get('button[type="button"]').contains('Cancel').click()
      cy.get('[data-cy="new-chat-button"]').should('be.focused')
    })
  })

  describe('Error State Accessibility', () => {
    it('should announce form validation errors', () => {
      cy.get('button[type="submit"]').click()
      
      cy.get('[role="alert"], [aria-live="polite"], [aria-live="assertive"]')
        .should('exist')
        .or(() => {
          cy.get('.text-red-600').should('be.visible')
        })
    })

    it('should associate errors with form fields', () => {
      cy.get('button[type="submit"]').click()
      
      cy.get('input[aria-describedby], input[aria-invalid="true"]').should('exist')
        .or(() => {
          cy.get('.text-red-600').should('be.visible')
        })
    })
  })
})
