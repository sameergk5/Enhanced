# 🎨 Wardrobe AI Enhanced - Virtual Fashion Platform

<div align="center">

![Wardrobe AI](https://img.shields.io/badge/Wardrobe-AI-purple?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Transform your fashion experience with AI-powered styling, 3D avatars, and virtual try-ons**

[Features](#features) • [Installation](#installation) • [Development](#development) • [API](#api) • [Contributing](#contributing)

</div>

---

## ✨ Features

### 🧬 3D Avatars & Virtual Try-On

- **Hunyuan3D Integration**: Generate photorealistic 3D avatars from photos
- **Virtual Garment Fitting**: Try on clothes virtually with accurate physics simulation
- **Body Measurement Analysis**: AI-powered body measurement extraction
- **Multi-Platform Support**: Web, mobile, and VR/AR compatibility

### 🤖 AI-Powered Styling

- **Personal Style Analysis**: Computer vision analysis of your fashion preferences
- **Smart Outfit Recommendations**: Context-aware suggestions based on weather, occasion, and trends
- **Color Palette Generation**: AI-curated color combinations that complement your style
- **Trend Forecasting**: Stay ahead with AI-predicted fashion trends

### 👗 Smart Wardrobe Management

- **Digital Closet**: Organize and catalog your entire wardrobe
- **Wear Tracking**: Monitor garment usage and optimize your style choices
- **Purchase Analytics**: Smart insights on your fashion spending
- **Outfit Planner**: Plan outfits for upcoming events and occasions

### 🌐 Social Fashion Platform

- **Style Communities**: Connect with fashion enthusiasts worldwide
- **Outfit Sharing**: Share your daily looks and get feedback
- **Style Challenges**: Participate in community styling challenges
- **Fashion Marketplace**: Discover and shop trending pieces

---

## 🏗️ Architecture

### Frontend Stack

- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** for responsive design
- **Three.js** for 3D rendering
- **Framer Motion** for animations
- **Zustand** for state management

### Backend Stack

- **Node.js** with Express
- **PostgreSQL** with Prisma ORM
- **Redis** for caching
- **Socket.io** for real-time features
- **OpenAI GPT-4** for AI styling
- **Anthropic Claude** for fashion analysis

### Infrastructure

- **Docker** containerization
- **Kubernetes** orchestration
- **MinIO** object storage
- **Nginx** reverse proxy
- **GitHub Actions** CI/CD

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### One-Command Setup

**Windows:**

```bash
./start-dev.bat
```

**Linux/macOS:**

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/wardrobe-ai-enhanced.git
   cd wardrobe-ai-enhanced
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   npm install

   # Backend
   cd backend && npm install && cd ..
   ```

3. **Environment setup**

   ```bash
   # Frontend
   cp .env.frontend.example .env.local

   # Backend
   cp backend/.env.example backend/.env
   ```

4. **Start services**

   ```bash
   # Database & Cache
   docker-compose -f docker-compose.dev.yml up -d

   # Application
   npm run start:full
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database Admin: http://localhost:5432
   - MinIO Console: http://localhost:9001

---

## 🛠️ Development

### Project Structure

```
wardrobe-ai-enhanced/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   └── types/             # TypeScript definitions
├── backend/               # Backend source
│   ├── src/               # Node.js source
│   ├── prisma/            # Database schema
│   └── services/          # Microservices
├── k8s/                   # Kubernetes manifests
├── database/              # Database scripts
└── docs/                  # Documentation
```

### Available Scripts

**Frontend:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

**Backend:**

```bash
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

**Full Stack:**

```bash
npm run start:full   # Start both frontend and backend
npm run docker:dev   # Start with Docker Compose
npm run k8s:deploy   # Deploy to Kubernetes
```

### 🔧 Configuration

#### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_3D_AVATARS=true
VITE_ENABLE_AI_STYLING=true
VITE_FIREBASE_API_KEY=your-firebase-key
```

#### Backend Environment Variables

```env
DATABASE_URL=postgresql://wardrobe:password@localhost:5432/wardrobe_ai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
HUNYUAN3D_API_KEY=your-hunyuan3d-key
```

---

## 📡 API Documentation

### Authentication

```typescript
POST / api / auth / login;
POST / api / auth / register;
POST / api / auth / refresh;
```

### User Management

```typescript
GET / api / users / profile;
PUT / api / users / profile;
PUT / api / users / profile / measurements;
GET / api / users / wardrobe - stats;
```

### 3D Avatars

```typescript
GET    /api/avatars              # Get user's avatars
POST   /api/avatars              # Create new avatar
PUT    /api/avatars/:id          # Update avatar
DELETE /api/avatars/:id          # Delete avatar
POST   /api/avatars/generate-hunyuan  # Generate with Hunyuan3D
```

### Wardrobe Management

```typescript
GET  /api/wardrobe/garments      # Get garments
POST /api/wardrobe/garments      # Add garment
GET  /api/wardrobe/outfits       # Get outfits
POST /api/wardrobe/outfits       # Create outfit
POST /api/wardrobe/garments/:id/wear  # Track wear
```

### AI Styling

```typescript
POST /api/ai/analyze-style       # Analyze garment style
POST /api/ai/recommend-outfit    # Get outfit recommendations
POST /api/ai/color-palette       # Generate color palette
GET  /api/ai/trends             # Get fashion trends
```

### Social Features

```typescript
GET  /api/social/feed           # Get social feed
POST /api/social/posts          # Create post
POST /api/social/posts/:id/like # Like/unlike post
POST /api/social/users/:id/follow # Follow/unfollow user
```

---

## 🔌 Integrations

### AI Services

- **OpenAI GPT-4 Vision**: Image analysis and style recommendations
- **Anthropic Claude**: Fashion trend analysis and styling advice
- **Hunyuan3D**: 3D avatar generation and garment modeling

### External APIs

- **Firebase Auth**: User authentication
- **AWS S3**: File storage
- **Stripe**: Payment processing
- **SendGrid**: Email notifications

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build images
docker build -t wardrobe-ai-frontend .
docker build -t wardrobe-ai-backend ./backend

# Run with compose
docker-compose up -d
```

### Kubernetes Deployment

```bash
# Deploy to cluster
kubectl apply -f k8s/

# Check status
kubectl get pods -n wardrobe-ai
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure Redis cache
3. Set up object storage (S3/MinIO)
4. Configure AI service API keys
5. Set up monitoring (Sentry, etc.)

---

## 🧪 Testing

### Frontend Testing

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Backend Testing

```bash
cd backend
npm run test          # Run API tests
npm run test:integration # Integration tests
npm run test:db       # Database tests
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

---

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: < 500KB gzipped
- **First Paint**: < 1.5s
- **3D Rendering**: 60+ FPS on modern devices

---

## 🔒 Security

- JWT-based authentication
- HTTPS enforced in production
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling

---

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics & Mixpanel
- **Performance**: Web Vitals monitoring
- **Logs**: Structured logging with Winston

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hunyuan3D** for 3D avatar generation technology
- **OpenAI** for AI-powered fashion analysis
- **Three.js** community for 3D rendering support
- **React** team for the amazing framework

---

<div align="center">

**Made with ❤️ by the Wardrobe AI team**

[Website](https://wardrobeai.com) • [Documentation](https://docs.wardrobeai.com) • [Discord](https://discord.gg/wardrobeai) • [Twitter](https://twitter.com/wardrobeai)

</div>
