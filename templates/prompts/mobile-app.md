# Mobile Application - AI Generation Prompt

## Project Overview
**Category:** Mobile Application  
**Project Name:** {{projectName}}  
**Target Audience:** {{targetAudience}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Architecture Requirements
- {{#hasReactNative}}React Native cross-platform development with native performance{{/hasReactNative}}
- {{#hasFlutter}}Flutter framework with Dart programming language{{/hasFlutter}}
- {{#hasNative}}Native development for iOS (Swift) and Android (Kotlin){{/hasNative}}
- Modern mobile UI/UX patterns and navigation
- Offline-first architecture with data synchronization
- Push notification integration

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete mobile application with the following structure:
```
{{projectName}}/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Basic UI elements (Button, Input, etc.)
│   │   ├── forms/          # Form components and validation
│   │   └── navigation/     # Navigation components
│   ├── screens/            # Screen/page components
│   │   ├── auth/           # Authentication screens
│   │   ├── main/           # Main application screens
│   │   └── settings/       # Settings and profile screens
│   ├── navigation/         # Navigation setup and configuration
│   ├── services/           # API calls and external services
│   ├── store/              # State management (Redux/Context)
│   ├── utils/              # Helper functions and utilities
│   ├── hooks/              # Custom React hooks
│   ├── constants/          # App constants and configuration
│   └── assets/             # Images, fonts, and static resources
├── android/                # Android-specific code and configuration
├── ios/                    # iOS-specific code and configuration
├── __tests__/              # Test files and test utilities
├── docs/                   # Documentation and guides
├── package.json
└── README.md
```

### 2. Core Application Setup

#### Application Entry Point
Create the main App component with:
- Navigation container setup
- State management provider (Redux/Context)
- Theme provider for consistent styling
- Error boundary implementation
- Deep linking configuration
- Splash screen handling

#### Navigation Architecture
{{#hasTabNavigation}}
Implement tab-based navigation with:
- Bottom tab navigator for main sections
- Stack navigators for each tab
- Custom tab bar with icons and badges
- Badge notifications for unread items
{{/hasTabNavigation}}

{{#hasDrawerNavigation}}
Implement drawer navigation with:
- Side drawer menu with user profile
- Nested navigation structure
- Custom drawer content and styling
- Gesture-based navigation
{{/hasDrawerNavigation}}

### 3. Authentication System

#### User Authentication Flow
Create comprehensive authentication with:
- Login/Register screens with form validation
- Social login integration (Google, Facebook, Apple)
- Biometric authentication (Touch ID, Face ID)
- JWT token management and refresh
- Secure token storage (Keychain/Keystore)
- Password reset and recovery flow

#### User Profile Management
- Profile creation and editing screens
- Avatar upload and image cropping
- Account settings and preferences
- Privacy and security settings
- Account deletion and data export

### 4. Screen Development

#### Authentication Screens
- **Welcome/Onboarding Screen**: App introduction and feature highlights
- **Login Screen**: Email/password with social login options
- **Register Screen**: User registration with validation
- **Forgot Password**: Password reset request and confirmation
- **Biometric Setup**: Enable biometric authentication

#### Main Application Screens
Based on your app category, create relevant screens:
- **Home/Dashboard**: Main content overview and navigation
- **Profile**: User profile and account management
- **Settings**: App preferences and configuration
- **Search**: Content discovery and filtering
- **Details**: Item detail views with rich content
- **Lists**: Data presentation with pagination

### 5. UI/UX Implementation

#### Design System
- Consistent color palette and typography
- Component library with reusable elements
- Responsive design for different screen sizes
- Dark mode and light mode support
- Platform-specific design patterns (iOS/Android)

#### Animations and Interactions
- Smooth page transitions and navigation
- Loading states and skeleton screens
- Pull-to-refresh functionality
- Swipe gestures and interactions
- Micro-animations for user feedback

#### Accessibility
- Screen reader support with proper labels
- Sufficient color contrast ratios
- Keyboard navigation support
- Dynamic font sizing support
- Voice control compatibility

### 6. Data Management

#### State Management
{{#hasRedux}}
Implement Redux with Redux Toolkit:
- Store configuration with middleware
- Feature-based slice architecture
- Async thunks for API calls
- RTK Query for data fetching
- Redux DevTools integration
{{/hasRedux}}

{{#hasContext}}
Implement React Context:
- Multiple contexts for different data domains
- Context optimization to prevent unnecessary re-renders
- Custom hooks for context consumption
- State persistence with AsyncStorage
{{/hasContext}}

#### Local Data Storage
- AsyncStorage for simple key-value data
- SQLite integration for complex data
- Offline data synchronization
- Data encryption for sensitive information
- Cache management and cleanup

### 7. API Integration

#### Network Layer
- RESTful API client with Axios or Fetch
- Request/response interceptors
- Authentication token handling
- Error handling and retry logic
- Network connectivity monitoring
- API response caching

#### Real-time Features
{{#hasRealTime}}
- WebSocket connection for real-time updates
- Push notification handling
- Background sync capabilities
- Live data updates without app refresh
{{/hasRealTime}}

### 8. Device Integration

#### Native Features
{{#hasCamera}}
- Camera integration for photo capture
- Image picker for gallery selection
- Image compression and optimization
- QR code scanning functionality
{{/hasCamera}}

{{#hasLocation}}
- Location services and GPS tracking
- Maps integration (Google Maps/Apple Maps)
- Geofencing capabilities
- Location-based features and notifications
{{/hasLocation}}

{{#hasNotifications}}
- Push notification setup and handling
- Local notification scheduling
- Notification permission handling
- Deep linking from notifications
{{/hasNotifications}}

### 9. Performance Optimization

#### App Performance
- Image optimization and lazy loading
- List virtualization for large datasets
- Memory leak prevention
- Bundle size optimization
- Code splitting and lazy loading

#### User Experience
- Fast app startup and splash screen
- Smooth scrolling and animations
- Efficient data fetching strategies
- Background app refresh handling
- Battery usage optimization

### 10. Testing Strategy

#### Unit Testing
- Component testing with React Native Testing Library
- Service layer and utility function tests
- State management testing
- API integration testing with mocks
- Custom hook testing

#### Integration Testing
- Screen navigation flow testing
- End-to-end user journey testing
- API integration testing
- Authentication flow testing
- Deep linking testing

#### Device Testing
- iOS simulator and physical device testing
- Android emulator and physical device testing
- Different screen sizes and orientations
- Performance testing on older devices
- Battery usage and memory testing

### 11. Deployment Configuration

#### iOS Deployment
- Xcode project configuration
- App Store Connect setup
- Code signing and provisioning profiles
- TestFlight beta testing setup
- App Store submission requirements

#### Android Deployment
- Gradle build configuration
- Play Console setup and app signing
- Google Play Internal Testing
- Release management and staged rollouts
- Play Store listing optimization

### 12. Security Implementation

#### Data Security
- Secure storage for sensitive data
- API communication encryption (HTTPS)
- Certificate pinning for API security
- Input validation and sanitization
- Biometric authentication integration

#### App Security
- Code obfuscation and minification
- Jailbreak/root detection
- SSL pinning implementation
- Secure deep linking
- Anti-tampering measures

## Platform-Specific Considerations

### iOS Specific
- Human Interface Guidelines compliance
- App Store Review Guidelines adherence
- iOS-specific navigation patterns
- SwiftUI integration (if needed)
- Core Data integration (if applicable)

### Android Specific
- Material Design Guidelines compliance
- Android API level compatibility
- Adaptive icons and shortcuts
- Android-specific permissions
- Room database integration (if applicable)

## Constraints and Considerations
{{#constraints}}
- {{.}}
{{/constraints}}

## Success Criteria
The generated mobile application should:
1. ✅ Compile and run successfully on both iOS and Android
2. ✅ Pass all platform-specific store requirements
3. ✅ Have responsive design for different screen sizes
4. ✅ Include comprehensive user authentication
5. ✅ Implement proper error handling and offline support
6. ✅ Pass security and performance testing
7. ✅ Be ready for app store deployment
8. ✅ Include comprehensive testing suite
9. ✅ Have proper navigation and user experience
10. ✅ Meet accessibility standards for both platforms

## Additional Notes
- Generate production-ready code with proper error handling
- Include platform-specific optimizations and features
- Implement proper state management and data persistence
- Add comprehensive logging for debugging and monitoring
- Include deployment scripts and CI/CD configuration
- Follow platform-specific design guidelines and patterns
- Implement proper app lifecycle management

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*