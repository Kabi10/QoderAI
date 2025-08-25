# Web Game - AI Generation Prompt

## Project Overview
**Category:** Web Game  
**Project Name:** {{projectName}}  
**Target Audience:** {{targetAudience}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Architecture Requirements
- {{#hasPhaser}}Phaser.js game framework for 2D game development{{/hasPhaser}}
- {{#hasThreeJS}}Three.js for 3D graphics and WebGL rendering{{/hasThreeJS}}
- {{#hasPixiJS}}PixiJS for high-performance 2D graphics rendering{{/hasPixiJS}}
- {{#hasCanvasAPI}}HTML5 Canvas API for custom game engine development{{/hasCanvasAPI}}
- Responsive design for multiple screen sizes and devices
- Performance optimization for smooth gameplay

### Game Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete web game with the following structure:
```
{{projectName}}/
├── src/
│   ├── game/               # Core game logic
│   │   ├── scenes/         # Game scenes and levels
│   │   ├── entities/       # Game objects and characters
│   │   ├── systems/        # Game systems (physics, audio, input)
│   │   └── managers/       # Game state and resource managers
│   ├── assets/             # Game assets
│   │   ├── images/         # Sprites, textures, backgrounds
│   │   ├── audio/          # Sound effects and music
│   │   ├── fonts/          # Custom fonts
│   │   └── data/           # Game data and configurations
│   ├── ui/                 # User interface components
│   ├── utils/              # Utility functions and helpers
│   └── main.js             # Game initialization
├── public/
│   ├── index.html
│   └── manifest.json       # PWA configuration
├── build/                  # Build scripts and configuration
├── tests/                  # Game testing suites
└── README.md
```

### 2. Game Engine Setup

#### Core Game Architecture
Create the main game engine with:
- Game loop with fixed timestep
- Scene management system
- Entity-component-system (ECS) architecture
- Resource loading and management
- Input handling (keyboard, mouse, touch)
- Collision detection and physics

#### Scene Management
Implement game scenes:
- **Main Menu Scene**: Game title, start options, settings
- **Game Scene**: Core gameplay mechanics
- **Pause Scene**: Game pause overlay with options
- **Game Over Scene**: End game results and restart options
- **Loading Scene**: Asset loading with progress indication

### 3. Game Mechanics Implementation

#### Player System
Create player character with:
- Character movement and controls
- Animation state management
- Health and status systems
- Inventory and item management
- Experience and progression systems

#### Enemy AI System
Implement enemy behaviors:
- Pathfinding and navigation
- State machine for AI behaviors
- Collision and damage systems
- Spawn and wave management
- Difficulty scaling and balancing

#### Physics and Collision
Set up physics engine:
- Collision detection (AABB, circle, polygon)
- Physics simulation (gravity, friction, impulse)
- Trigger zones and interactive objects
- Particle systems for effects
- Spatial partitioning for optimization

### 4. User Interface Design

#### HUD (Heads-Up Display)
Create game interface elements:
- Health and status bars
- Score and timer displays
- Mini-map and navigation aids
- Inventory and item slots
- Action buttons and controls

#### Menu Systems
Implement game menus:
- Main menu with game options
- Settings menu (audio, graphics, controls)
- Pause menu with game controls
- Inventory and character screens
- Achievement and progress tracking

### 5. Audio System Implementation

#### Sound Management
Create comprehensive audio system:
- Background music with loop management
- Sound effects with spatial audio
- Dynamic audio mixing and volume control
- Audio compression and format optimization
- Mute and audio preference settings

#### Audio Optimization
- Audio sprite sheets for efficiency
- Lazy loading of audio assets
- Browser compatibility handling
- Mobile audio unlock patterns

### 6. Graphics and Visual Effects

#### 2D Graphics Implementation
{{#hasPhaser}}
Set up Phaser.js graphics:
- Sprite management and atlases
- Animation systems and tweening
- Particle effects and emitters
- Tilemap and level design tools
- Camera systems and viewports
{{/hasPhaser}}

{{#hasThreeJS}}
Implement 3D graphics with Three.js:
- 3D scene setup and rendering
- Lighting and shadow systems
- 3D model loading and animation
- Texture mapping and materials
- Camera controls and movement
{{/hasThreeJS}}

#### Visual Effects
- Particle systems for explosions and effects
- Screen transitions and scene changes
- UI animations and feedback
- Shader effects for advanced graphics
- Performance monitoring and FPS optimization

### 7. Game Content and Progression

#### Level Design
Create engaging game levels:
- Progressive difficulty scaling
- Multiple level layouts and themes
- Interactive environment elements
- Hidden secrets and bonus content
- Level completion and progression tracking

#### Scoring and Achievements
Implement progression systems:
- Score calculation and multipliers
- Achievement system with unlocks
- Leaderboards and high scores
- Progress saving and loading
- Social sharing integration

### 8. Performance Optimization

#### Rendering Optimization
- Object pooling for game entities
- Culling of off-screen objects
- Sprite batching and texture atlases
- Level-of-detail (LOD) systems
- Memory management and cleanup

#### Mobile Optimization
- Touch controls and gesture handling
- Performance scaling for different devices
- Battery usage optimization
- Network usage minimization
- Responsive design for various screen sizes

### 9. Multiplayer Features (Optional)
{{#hasMultiplayer}}
Implement multiplayer functionality:
- Real-time networking with WebSockets
- Player synchronization and lag compensation
- Lobby and matchmaking systems
- Chat and communication features
- Anti-cheat and validation systems
{{/hasMultiplayer}}

### 10. Testing and Quality Assurance

#### Game Testing
- Gameplay mechanics testing
- Balance and difficulty testing
- Performance testing on various devices
- Cross-browser compatibility testing
- User experience and accessibility testing

#### Automated Testing
- Unit tests for game logic
- Integration tests for systems
- Performance benchmarking
- Memory leak detection
- Regression testing for updates

### 11. Deployment and Distribution

#### Web Deployment
Configure for web distribution:
- Static file hosting optimization
- CDN setup for global distribution
- Caching strategies for game assets
- SEO optimization for game discovery
- Analytics integration for player tracking

#### Progressive Web App (PWA)
{{#hasPWA}}
Implement PWA features:
- Service worker for offline play
- App manifest for installation
- Push notifications for engagement
- Background sync for game data
- Responsive design for mobile devices
{{/hasPWA}}

### 12. Monetization and Analytics

#### Game Analytics
- Player behavior tracking
- Performance and crash reporting
- A/B testing for game features
- Retention and engagement metrics
- Revenue tracking and optimization

#### Monetization Options
{{#hasMonetization}}
- In-app purchases and microtransactions
- Advertisement integration
- Premium features and content
- Subscription models
- Merchandise and brand partnerships
{{/hasMonetization}}

## Game Design Considerations

### Target Audience
- Age-appropriate content and complexity
- Accessibility features for diverse players
- Cultural sensitivity and localization
- Device and platform considerations

### Gameplay Balance
- Fair and rewarding progression
- Meaningful player choices
- Replayability and long-term engagement
- Social features and community building

## Constraints and Considerations
{{#constraints}}
- {{.}}
{{/constraints}}

## Success Criteria
The generated web game should:
1. ✅ Run smoothly across modern web browsers
2. ✅ Have engaging and balanced gameplay mechanics
3. ✅ Include responsive design for multiple devices
4. ✅ Provide intuitive controls and user interface
5. ✅ Have optimized performance and fast loading times
6. ✅ Include comprehensive audio and visual effects
7. ✅ Be ready for deployment to {{deploymentTarget}}
8. ✅ Have proper game progression and scoring systems
9. ✅ Include accessibility features for diverse players
10. ✅ Pass performance testing on target devices

## Additional Notes
- Focus on creating addictive and engaging gameplay loops
- Implement proper game state management and save systems
- Include comprehensive error handling and recovery
- Add detailed game instructions and tutorials
- Optimize for search engines and discoverability
- Include social sharing and community features
- Plan for future updates and content expansion

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*