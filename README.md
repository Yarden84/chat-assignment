# Klaay Chat Application

A modern, real-time chat application built with Vue.js 3 and WebSocket technology. Klaay provides an intuitive WhatsApp-like interface for seamless conversations with AI assistance.

## 🌟 Features

- **Real-time Messaging**: Instant message delivery using WebSockets
- **AI Assistant Integration**: Built-in AI chatbot for interactive conversations
- **Multiple Conversations**: Create and manage multiple chat conversations
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Message Timestamps**: WhatsApp-style time and date formatting
- **Conversation Management**: Rename conversations with inline editing
- **Auto-scrolling**: Automatic scroll to latest messages
- **Typing Indicators**: Visual feedback when AI is responding
- **User Authentication**: Secure login system with demo accounts

## 🚀 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management library
- **Vue Router** - Client-side routing

### Backend
- **Express.js** - Node.js web framework
- **WebSocket** - Real-time bidirectional communication
- **In-memory storage** - Simple data persistence for demo

### Testing
- **Vitest** - Fast unit testing framework
- **Vue Test Utils** - Vue component testing utilities
- **Cypress** - End-to-end testing framework

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📋 Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chat-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
```bash
# Navigate to API directory
cd ../API
npm run server
```
The backend server will run on `http://localhost:9293`

### 4. Start the Frontend Development Server
```bash
# In a new terminal, go back to chat-app directory
cd chat-app
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🎮 How to Use the Application

### 1. **Login**
- Open `http://localhost:5173` in your browser
- Use demo accounts:
  - Username: `user1` / Password: `password1`
  - Username: `user2` / Password: `password2`

### 2. **Creating Conversations**
- Click the "New Chat" button (pencil icon) in the sidebar
- Enter a conversation name
- Start chatting!

### 3. **Chatting with AI**
- Type your message in the input field at the bottom
- Press **Enter** to send (or **Shift+Enter** for new lines)
- The AI will respond automatically with typing indicators

### 4. **Managing Conversations**
- **Rename**: Click the edit icon next to any conversation name
- **Switch**: Click on any conversation in the sidebar to open it
- **Mobile**: Use the hamburger menu to access conversations on mobile

### 5. **Theme & Settings**
- **Theme Toggle**: Click the sun/moon icon in the top-right corner
- **Logout**: Click the logout icon in the top-right corner

### 6. **Mobile Experience**
- Responsive design works on all screen sizes
- Swipe-friendly navigation
- Touch-optimized buttons and interactions

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### End-to-End Tests
```bash
# Interactive mode
npm run test:e2e:dev

# Headless mode
npm run test:e2e:headless
```

### Linting
```bash
npm run lint
```

## 🏗️ Project Structure

```
chat-app/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── ConversationView.vue
│   │   └── ThemeToggle.vue
│   ├── composables/         # Vue composables
│   │   ├── useTheme.ts
│   │   └── useGlobalWebSocket.ts
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   └── conversations.ts
│   ├── services/            # API services
│   │   └── api.ts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── views/               # Page components
│   │   ├── LoginView.vue
│   │   └── ChatView.vue
│   └── router/              # Vue Router configuration
├── cypress/                 # E2E tests
├── tests/                   # Unit tests
└── public/                  # Static assets
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e:dev` - Run E2E tests (interactive)
- `npm run test:e2e:headless` - Run E2E tests (headless)
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🌐 API Endpoints

The backend provides the following endpoints:

- `POST /authenticate` - User authentication
- `GET /conversations` - Fetch user conversations
- `GET /conversations/:id` - Fetch specific conversation
- `POST /conversations` - Create new conversation
- `PUT /conversations/:id` - Update conversation name
- `POST /conversations/:id/messages` - Send message
- `WebSocket /cable` - Real-time message updates

## 🎨 Design Features

- **Modern UI**: Clean, professional interface inspired by popular chat apps
- **Dark Mode**: Complete dark theme support with system preference detection
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Screen reader friendly with proper ARIA labels
- **Touch-Friendly**: Optimized for mobile touch interactions

## 🔒 Authentication

The application uses a simple token-based authentication system with demo accounts. In a production environment, this would be replaced with a proper authentication service.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built application will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome
- **Features**: WebSocket support required for real-time messaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy chatting with Klaay! 🎉**
