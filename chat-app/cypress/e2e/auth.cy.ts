describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should redirect to login when not authenticated', () => {
    cy.url().should('include', '/login')
    cy.contains('Welcome to Klaay').should('be.visible')
    cy.contains('Sign in to start chatting').should('be.visible')
  })

  it('should display login form elements', () => {
    cy.get('input[type="text"]').should('be.visible').and('have.attr', 'placeholder', 'Enter your username')
    cy.get('input[type="password"]').should('be.visible').and('have.attr', 'placeholder', 'Enter your password')
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Sign In')
  })

  it('should show demo account information', () => {
    cy.contains('Demo accounts:').should('be.visible')
    cy.contains('user1 / password1 or user2 / password2').should('be.visible')
  })

  it('should show validation error for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.contains('*Please fill in all fields').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="text"]').type('wronguser')
    cy.get('input[type="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()
    
    cy.contains('*Invalid username or password').should('be.visible')
  })

  it('should successfully login with valid credentials', () => {
    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/chat')
    cy.contains('Welcome, user1').should('be.visible')
  })

  it('should show loading state during login', () => {
    cy.intercept('POST', '**/authenticate', (req) => {
      req.reply({
        statusCode: 200,
        body: { token: 'mock-token' },
        delay: 500
      })
    }).as('loginRequest')

    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('input[type="text"]').should('be.disabled')
    cy.get('input[type="password"]').should('be.disabled')

    cy.wait('@loginRequest')
  })

  it('should maintain authentication across page refreshes', () => {
    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/chat')
    cy.reload()
    cy.url().should('include', '/chat')
    cy.contains('Welcome, user1').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.get('input[type="text"]').type('user1')
    cy.get('input[type="password"]').type('password1')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/chat')
    // Click the logout button (now in the top-right corner)
    cy.get('button[title="Logout"]').click()
    
    cy.url().should('include', '/login')
    cy.contains('Welcome to Klaay').should('be.visible')
  })
})
