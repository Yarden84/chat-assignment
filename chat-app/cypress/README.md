# E2E Testing Guide

## Overview

This directory contains comprehensive end-to-end tests for the Klaay chat application using Cypress.

## Test Structure

### Test Files

- **`auth.cy.ts`** - Authentication flow testing (login, logout, validation)
- **`chat-interface.cy.ts`** - Main chat interface functionality 
- **`real-time-features.cy.ts`** - WebSocket, AI responses, real-time messaging
- **`accessibility.cy.ts`** - Accessibility compliance and ARIA testing
- **`user-workflows.cy.ts`** - Complete user journey scenarios

### Custom Commands

Located in `support/commands.ts`:

- `cy.login(username?, password?)` - Login with demo credentials
- `cy.createConversation(name)` - Create new conversation
- `cy.selectConversation(index?)` - Select conversation by index
- `cy.sendMessage(message)` - Send message and verify it appears
- `cy.waitForAIResponse(timeout?)` - Wait for AI typing indicator to complete
- `cy.checkAccessibility()` - Basic accessibility checks
- `cy.checkResponsive(viewport)` - Test responsive design

## Running Tests

### Prerequisites

1. Start the backend server:
   ```bash
   cd ../API && npm start
   ```

2. Backend should be running on `http://localhost:9293`

### Commands

```bash
# Open Cypress Test Runner (interactive)
npm run test:e2e:dev

# Run all E2E tests headlessly
npm run test:e2e:headless

# Run E2E tests with video recording
npm run test:e2e
```

## Test Categories

### 🔐 Authentication Tests
- Login form validation
- Demo account authentication
- Session persistence
- Logout functionality
- Error handling

### 💬 Chat Interface Tests
- Conversation creation and management
- Message sending and receiving
- Real-time updates
- UI state management
- Responsive design

### ⚡ Real-time Features Tests
- WebSocket connectivity
- AI response system
- Multi-conversation handling
- Message persistence
- Performance under load

### ♿ Accessibility Tests
- ARIA attributes and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Mobile accessibility

### 🔄 User Workflow Tests
- Complete user journeys
- Cross-browser compatibility
- Error recovery
- Session management

## Test Data

Tests use the demo accounts configured in the backend:
- `user1` / `password1`
- `user2` / `password2`

## Configuration

### Cypress Config (`cypress.config.ts`)
- Base URL: `http://localhost:5173`
- Viewport: 1280x720
- Timeouts: 10 seconds
- Screenshots on failure: enabled
- Video recording: disabled (for faster runs)

### Environment Variables
- `apiUrl`: Backend API URL (http://localhost:9293)

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Include setup/teardown in `beforeEach`/`afterEach`

### Selectors
- Use `data-cy` attributes for test-specific selectors
- Avoid CSS class selectors that might change
- Use semantic selectors when appropriate

### Assertions
- Be specific with assertions
- Test user-visible behavior, not implementation
- Include both positive and negative test cases

### Async Operations
- Use `cy.wait()` for API calls
- Use custom commands for complex async flows
- Set appropriate timeouts for AI responses

## Debugging

### Failed Tests
1. Check screenshots in `cypress/screenshots/`
2. Review console logs in Cypress runner
3. Use `cy.debug()` to pause execution
4. Add `cy.pause()` for manual debugging

### Common Issues
- **WebSocket timeouts**: Increase timeout in `waitForAIResponse`
- **Element not found**: Check if element exists with `should('exist')`
- **Flaky tests**: Add proper waits and assertions
- **CORS errors**: Ensure backend is running with correct CORS settings

## Continuous Integration

For CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Run headless tests
npm run test:e2e:headless

# Generate test reports
npx cypress run --reporter json --reporter-options outputFile=results.json
```

## Coverage

Current E2E test coverage includes:

✅ **Authentication flows** (8 tests)  
✅ **Chat interface** (15+ tests)  
✅ **Real-time features** (12+ tests)  
✅ **Accessibility** (10+ tests)  
✅ **User workflows** (8+ tests)  

**Total: 50+ comprehensive E2E tests**

## Maintenance

### Adding New Tests
1. Create test file in appropriate category
2. Use existing custom commands when possible
3. Follow naming conventions
4. Add data-cy attributes to new components

### Updating Tests
- Keep tests in sync with UI changes
- Update selectors when components change
- Maintain test data consistency
- Review and update timeouts as needed
