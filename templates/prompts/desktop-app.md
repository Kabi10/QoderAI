# Desktop Application - AI Generation Prompt

## Project Overview
**Category:** Desktop Application  
**Project Name:** {{projectName}}  
**Target Audience:** {{targetAudience}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Architecture Requirements
- {{#hasElectron}}Electron framework for cross-platform desktop development{{/hasElectron}}
- {{#hasTauri}}Tauri framework with Rust backend for lightweight native applications{{/hasTauri}}
- {{#hasNative}}Native development with platform-specific languages (C++, Swift, Kotlin){{/hasNative}}
- Modern UI framework integration (React, Vue, Angular)
- System integration and native APIs access
- Efficient memory management and performance optimization

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete desktop application with the following structure:
```
{{projectName}}/
├── src/
│   ├── main/               # Main process code (Electron/Tauri)
│   ├── renderer/           # Renderer process UI code
│   ├── preload/            # Preload scripts for security
│   ├── components/         # Reusable UI components
│   ├── services/           # Business logic and API services
│   ├── store/              # State management
│   ├── utils/              # Utility functions
│   └── assets/             # Images, icons, and resources
├── build/                  # Build configuration and scripts
├── dist/                   # Distribution packages
├── resources/              # App icons and metadata
├── tests/                  # Testing suites
├── package.json
└── README.md
```

### 2. Main Process Implementation
{{#hasElectron}}
Create the main Electron process with:
- Window management and lifecycle
- Menu bar and system tray integration
- IPC (Inter-Process Communication) handlers
- File system access and native dialogs
- Auto-updater integration
- Security configuration and context isolation
{{/hasElectron}}

{{#hasTauri}}
Set up Tauri application with:
- Rust backend for system operations
- Secure command system for frontend-backend communication
- Window management and configuration
- System tray and native menus
- File system APIs and dialog handling
- Built-in updater and installer generation
{{/hasTauri}}

### 3. UI Framework Integration
Create modern user interface with:
- {{#hasReact}}React components with hooks and context{{/hasReact}}
- {{#hasVue}}Vue.js composition API and reactive state{{/hasVue}}
- {{#hasAngular}}Angular modules and services architecture{{/hasAngular}}
- Responsive design for different window sizes
- Custom window controls and title bar
- Dark/light theme support
- Accessibility features and keyboard navigation

### 4. System Integration Features

#### File System Operations
- File and directory manipulation
- Drag and drop functionality
- File associations and default app handling
- Recent files and bookmarks management
- Cross-platform path handling

#### Operating System Integration
- System notifications and badges
- Keyboard shortcuts and global hotkeys
- System clipboard access
- Power management and system events
- Registry/preferences storage (Windows/macOS/Linux)

#### Hardware Access
{{#hasCamera}}
- Camera and microphone access
- Image and video capture
- Media processing and manipulation
{{/hasCamera}}

{{#hasPrinting}}
- Printing system integration
- Print preview and settings
- Custom print layouts
{{/hasPrinting}}

### 5. Data Management

#### Local Storage
- SQLite database integration
- Configuration and settings persistence
- Application state management
- Data encryption for sensitive information
- Backup and restore functionality

#### Network Operations
- HTTP/HTTPS requests and API integration
- WebSocket connections for real-time features
- Offline mode and data synchronization
- Download management and progress tracking

### 6. Security Implementation

#### Application Security
- Code signing for distribution
- Secure storage of sensitive data
- Input validation and sanitization
- Protection against common vulnerabilities
- Secure communication channels

#### User Privacy
- Permission management for system access
- Data collection and usage transparency
- GDPR compliance for EU users
- Opt-in analytics and crash reporting

### 7. Performance Optimization

#### Resource Management
- Memory usage optimization
- CPU usage monitoring and throttling
- Battery usage consideration for laptops
- Lazy loading of heavy components
- Background task management

#### Startup Performance
- Fast application startup time
- Splash screen during initialization
- Progressive loading of features
- Cache management and cleanup

### 8. Testing Strategy

#### Unit Testing
- Component testing with appropriate framework tools
- Service layer and utility function testing
- Main process functionality testing
- Mock system APIs for testing

#### Integration Testing
- End-to-end user workflow testing
- Cross-platform compatibility testing
- Performance testing on different hardware
- Memory leak detection and prevention

#### Manual Testing
- User experience testing on target platforms
- Accessibility testing with screen readers
- Keyboard navigation and shortcuts testing
- Window management and multi-monitor support

### 9. Distribution and Deployment

#### Build Configuration
- Platform-specific build scripts
- Code signing and notarization (macOS)
- Installer generation for each platform
- Auto-updater configuration

#### Distribution Channels
- {{#hasWindowsStore}}Microsoft Store packaging and submission{{/hasWindowsStore}}
- {{#hasMacAppStore}}Mac App Store distribution{{/hasMacAppStore}}
- {{#hasLinuxPackages}}Linux package managers (apt, rpm, snap){{/hasLinuxPackages}}
- Direct download and self-hosting options

### 10. Platform-Specific Considerations

#### Windows
- Windows API integration
- Registry access and system services
- Windows-specific UI guidelines
- Microsoft Store compliance

#### macOS
- Cocoa framework integration
- macOS Human Interface Guidelines
- Sandboxing and entitlements
- Apple notarization process

#### Linux
- GTK/Qt integration options
- Desktop environment compatibility
- Package manager distribution
- Flatpak/AppImage support

## Constraints and Considerations
{{#constraints}}
- {{.}}
{{/constraints}}

## Success Criteria
The generated desktop application should:
1. ✅ Run natively on target platforms (Windows/macOS/Linux)
2. ✅ Have intuitive and responsive user interface
3. ✅ Integrate seamlessly with operating system features
4. ✅ Include comprehensive error handling and logging
5. ✅ Pass security and performance testing
6. ✅ Be ready for distribution through appropriate channels
7. ✅ Include automatic update mechanism
8. ✅ Have proper installation and uninstallation procedures
9. ✅ Meet platform-specific design guidelines
10. ✅ Include comprehensive user documentation

## Additional Notes
- Generate production-ready code with proper error handling
- Include platform-specific optimizations and features
- Implement proper logging for debugging and support
- Add comprehensive build and deployment scripts
- Follow platform-specific security and distribution guidelines
- Include user onboarding and help documentation
- Implement graceful degradation for different system capabilities

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*