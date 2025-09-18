/// <reference types="cypress" />

Cypress.Commands.add('login', (username: string = 'user1', password: string = 'password1') => {
  cy.visit('/login')
  cy.get('input[type="text"]').type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/chat')
})

Cypress.Commands.add('createConversation', (name: string) => {
  cy.get('[data-cy="new-chat-button"]').click()
  cy.get('#chatName').type(name)
  cy.get('button[type="submit"]').first().click({ force: true }) 
  cy.contains(name, { timeout: 15000 }).should('be.visible')
  cy.wait(2000)
})

Cypress.Commands.add('selectConversation', (index: number = 0) => {
  cy.get('[data-cy="conversation-item"]').eq(index).click()
  cy.get('[data-cy="conversation-header"]').should('be.visible')
})

Cypress.Commands.add('sendMessage', (message: string) => {
  cy.get('[data-cy="message-input"]').type(message) 
  cy.get('button[type="submit"]').first().click() 
  cy.contains(message).should('be.visible')
})

Cypress.Commands.add('waitForAIResponse', (timeout: number = 15000) => {
  cy.get('.animate-bounce, .animate-pulse, .animate-spin').should('exist')
  cy.get('.animate-bounce, .animate-pulse, .animate-spin', { timeout }).should('not.exist')
  cy.wait(2000)
})

Cypress.Commands.add('checkAccessibility', () => {
  cy.get('body').should('be.visible')
  cy.get('input, button, a, [tabindex]').each(($el) => {
    cy.wrap($el).focus().should('be.focused')
  })
})

Cypress.Commands.add('checkResponsive', (viewport: string) => {
  cy.viewport(viewport as Cypress.ViewportPreset)
  cy.get('body').should('be.visible')
  cy.get('[data-cy="conversation-item"]').should('exist')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string): Chainable<void>
      createConversation(name: string): Chainable<void>
      selectConversation(index?: number): Chainable<void>
      sendMessage(message: string): Chainable<void>
      waitForAIResponse(timeout?: number): Chainable<void>
      checkAccessibility(): Chainable<void>
      checkResponsive(viewport: string): Chainable<void>
    }
  }
}

export {}