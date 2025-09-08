# Wardrobe AI Mobile App

A React Native mobile application for the Wardrobe AI fashion platform, providing users with AI-powered styling recommendations, virtual try-on capabilities, and social fashion features.

## 🚀 Features

### Core Features
- **Virtual Wardrobe Management**: Organize and categorize your clothing items
- **3D Avatar Integration**: Personalized avatars for virtual try-on experiences
- **AI Style Recommendations**: Smart outfit suggestions based on preferences and weather
- **Social Fashion Feed**: Share outfits and discover trending styles
- **Camera Integration**: Add new items by taking photos

### Technical Features
- Cross-platform compatibility (iOS & Android)
- Offline-first architecture with data synchronization
- Real-time social features
- Push notifications for style recommendations
- Secure authentication and data encryption

## 📱 Technology Stack

- **Framework**: React Native 0.72
- **Navigation**: React Navigation 6.x
- **State Management**: Redux Toolkit
- **UI Library**: React Native Paper
- **Backend Integration**: Axios with custom API client
- **Authentication**: Firebase Auth
- **Push Notifications**: Firebase Cloud Messaging
- **Image Processing**: React Native Image Picker
- **Offline Storage**: AsyncStorage

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens/pages
│   ├── HomeScreen.tsx
│   ├── WardrobeScreen.tsx
│   ├── AvatarScreen.tsx
│   ├── SocialScreen.tsx
│   └── ProfileScreen.tsx
├── store/              # Redux store and slices
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── wardrobeSlice.ts
│       ├── avatarSlice.ts
│       └── socialSlice.ts
├── services/           # API services and utilities
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── theme/              # App theming and styling
│   └── theme.ts
└── App.tsx             # Main app component
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 16+
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the App**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Start Metro bundler
   npm start
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
API_BASE_URL=http://localhost:3001/api
AI_SERVICE_URL=http://localhost:8000
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
ENABLE_PUSH_NOTIFICATIONS=true
DEBUG_MODE=true
```

### API Integration
The app communicates with:
- **Backend API**: Node.js Express server on port 3001
- **AI Service**: Python FastAPI service on port 8000

## 📋 Development Scripts

```bash
npm run android          # Run on Android device/emulator
npm run ios             # Run on iOS device/simulator
npm start               # Start Metro bundler
npm run lint            # Run ESLint
npm test                # Run Jest tests
npm run build:android   # Build Android APK
npm run build:ios       # Build iOS app
npm run clean           # Clean build cache
```

## 🎨 UI/UX Design

### Design System
- **Primary Color**: Indigo (#6366F1)
- **Secondary Color**: Emerald (#10B981)
- **Typography**: System fonts with custom weights
- **Spacing**: 8px grid system
- **Icons**: Material Design icons via React Native Paper

### Screen Flow
1. **Home**: Quick actions and fashion stats
2. **Wardrobe**: Item management and categorization
3. **Avatar**: 3D avatar customization and measurements
4. **Social**: Fashion feed and community features
5. **Profile**: User settings and preferences

## 🔐 Authentication & Security

- Firebase Authentication integration
- JWT token management with automatic refresh
- Secure API communication with interceptors
- Local data encryption for sensitive information
- Privacy controls for social features

## 📡 Offline Support

- AsyncStorage for local data persistence
- Queue system for API calls when offline
- Automatic synchronization when connection restored
- Cached image storage for offline viewing

## 🔔 Push Notifications

- New style recommendations
- Social interactions (likes, comments)
- Wardrobe reminders
- Sale alerts from favorite brands

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📦 Build and Deployment

### Development Build
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

### Production Build
```bash
# Android (signed APK)
cd android
./gradlew assembleRelease

# iOS (Archive)
xcodebuild -workspace ios/WardrobeAI.xcworkspace -scheme WardrobeAI -configuration Release archive
```

## 🚀 Release Process

1. Update version in `package.json`
2. Update build numbers in platform-specific files
3. Run tests and ensure all pass
4. Create production builds
5. Upload to app stores (Google Play, App Store)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper tests
4. Submit a pull request

## 📖 Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
- [React Native Paper](https://reactnativepaper.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the FAQ section

---

**Note**: This mobile application is part of the larger Wardrobe AI ecosystem and requires the backend services to be running for full functionality.
