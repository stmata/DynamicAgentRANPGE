
## 🔐 Authentication System

The application features a robust authentication system with:

- **JWT Token Management** - Automatic refresh and storage
- **Session Persistence** - Survives browser restarts
- **Sleep Detection** - Handles device sleep/wake cycles
- **Proactive Refresh** - Prevents 403 errors
- **Secure Storage** - Encrypted user data

### Key Components
- `useAuth` hook - Main authentication logic
- `fetchWrapper` - Auto-attaching auth headers
- `storage` service - Secure token management
- `ProtectedRoute` - Route-level protection

## 🎓 Course System

### Features
- **Hierarchical Structure** - Programs → Courses → Modules → Topics
- **Progress Tracking** - Monitor learning progress
- **Interactive Content** - Rich media support
- **Adaptive Learning** - Personalized recommendations

### API Integration
- Course metadata fetching
- Module content loading
- Progress synchronization
- Real-time updates

## 🤖 AI Chat Integration

### Capabilities
- **Contextual Assistance** - Course-aware responses
- **Multi-language Support** - French/English conversations
- **Session Management** - Persistent chat history
- **Markdown Rendering** - Rich text formatting
- **LaTeX Support** - Mathematical expressions

## 📊 Evaluation System

### Assessment Types
- **Multiple Choice Questions (MCQ)** - Interactive quizzes
- **Case-based Evaluations** - Real-world scenarios
- **Mixed Assessments** - Combined question types
- **PDF Export** - Generate evaluation reports

### Features
- Real-time scoring
- Progress analytics
- Performance tracking
- Detailed feedback

## 🛠️ Development

### Code Style
- **ESLint** - Code linting and formatting
- **React Hooks** - Modern React patterns
- **Material-UI** - Consistent design system
- **Responsive Design** - Mobile-first approach

### Debugging Tools
- **AuthDebugger** - Real-time auth status (dev only)
- **Console Logging** - Structured debug output
- **Error Boundaries** - Graceful error handling

### Security Features
- **XSS Protection** - Input sanitization
- **CSRF Prevention** - Secure cookies
- **Token Validation** - Automatic refresh
- **Route Protection** - Authentication guards

## 🌍 Internationalization

The app supports multiple languages:
- **French** (default)
- **English**

Translation files are managed through `react-i18next` with:
- Dynamic language switching
- Namespace organization
- Lazy loading of translations

## 📱 Responsive Design

Built with mobile-first principles:
- **Breakpoint System** - Material-UI responsive grid
- **Touch-friendly** - Optimized for mobile interactions
- **Adaptive Layouts** - Dynamic component sizing
- **Performance** - Optimized for all devices

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
```env
VITE_API_BASE_URL=https://your-api.com
VITE_APP_ENV=production
```

### Production Considerations
- Enable secure cookies
- Configure CSP headers
- Set up error monitoring
- Implement analytics

## 🔧 Configuration

### Vite Configuration
- React plugin with Fast Refresh
- Optimized build settings
- Development proxy for API calls

### Material-UI Theme
- Custom color palette
- Typography settings
- Component overrides
- Dark/light mode support

## 📚 Documentation

Additional documentation:
- Component JSDoc - Inline documentation
- API documentation - Service layer details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

## 📄 License

This project is part of the ForCopil educational platform.

---

**Tech Stack:** React 19 + Vite 6 + Material-UI v7 + React Router v7  
**Last Updated:** Jun 2024  
**Node Version:** 18+