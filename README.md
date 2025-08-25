# Universal Prompt Generator for Qoder IDE

An intelligent prompt factory system that generates specialized, production-ready prompt suites for creating any digital product, application, or artifact.

## Overview

The Universal Prompt Generator transforms high-level product specifications into complete, executable development workflows. Each generated prompt suite is self-contained and optimized for specific creation workflows.

## Features

- **Category-Specific**: 10+ product categories with specialized templates
- **Production-Ready**: Complete source code, tests, documentation, and deployment configs
- **Self-Contained**: Everything needed for production included
- **Workflow-Integrated**: Seamless Qoder IDE integration

## Product Categories

### 1. Applications & Software
- `web-app` - React, Vue, Angular applications
- `mobile-app` - iOS, Android, React Native, Flutter
- `desktop-app` - Electron, Tauri applications
- `cli-tool` - Command line utilities
- `browser-extension` - Chrome, Firefox extensions
- `pwa` - Progressive Web Apps

### 2. Websites & Digital Presence
- `landing-page` - Marketing sites, campaigns
- `portfolio-site` - Personal/agency portfolios
- `blog-platform` - Content management systems
- `e-commerce` - Online stores
- `documentation-site` - API docs, guides
- `corporate-website` - Business sites

### 3. APIs & Backend Services
- `rest-api` - RESTful services
- `graphql-api` - GraphQL schemas
- `websocket-service` - Real-time communication
- `webhook-handler` - Event processing
- `auth-service` - Authentication systems
- `data-pipeline` - ETL processes

### 4. Games & Interactive Media
- `web-game` - HTML5 canvas games
- `mobile-game` - 2D/3D mobile games
- `interactive-story` - Visual novels
- `simulation` - Physics simulations
- `ar-vr-experience` - AR/VR applications

### 5. AI & Machine Learning
- `chatbot` - Conversational AI
- `ml-model` - Training pipelines
- `computer-vision` - Image processing
- `nlp-service` - Text analysis
- `recommendation-engine` - Personalization
- `data-analysis-tool` - Analytics dashboards

## Quick Start

### Installation

```bash
npm install -g qoder-prompt-generator
```

### Basic Usage

```bash
# Interactive mode
qoder-prompt

# Direct generation
qoder-prompt generate --category=web-app --name=MyApp --tech-stack="React,Node.js"

# List available categories
qoder-prompt list-categories

# Validate generated output
qoder-prompt validate --path=./output
```

### Core Inputs

```bash
CATEGORY=web-app                    # Product type
PROJECT_NAME=MyAwesomeApp          # Project name
TECH_STACK=React,Node.js,PostgreSQL # Technologies
TARGET_AUDIENCE=Business users      # End users
DEPLOYMENT_TARGET=Vercel           # Platform
CONSTRAINTS=Mobile-first           # Requirements
```

## Project Structure

```
/
├── src/                    # Core application code
│   ├── core/              # System architecture
│   ├── categories/        # Category-specific generators
│   ├── templates/         # Template library
│   ├── validation/        # Quality assurance
│   └── cli/              # Command line interface
├── templates/             # Template files
├── config/               # Configuration files
├── tests/                # Test suites
├── docs/                 # Documentation
└── scripts/              # Build and utility scripts
```

## Development

### Setup

```bash
git clone <repository>
cd qoder-prompt-generator
npm install
```

### Development Commands

```bash
npm run dev          # Start development server
npm test             # Run tests
npm run test:watch   # Watch mode testing
npm run lint         # Code linting
npm run validate     # Validate templates
```

### Testing

```bash
npm test                 # Unit tests
npm run test:coverage    # Coverage report
npm run test:integration # Integration tests
```

## Architecture

### Core Components

- **Input Parser**: Parameter extraction and validation
- **Category Detector**: Product type identification
- **Template Selector**: Template matching
- **Prompt Generator**: Dynamic content generation
- **Output Validator**: Quality assurance
- **File Generator**: Multi-file coordination

### Template Structure

```
Universal Template
├── Category Templates
│   ├── Product-Specific Templates
│   │   ├── Component Templates
│   │   └── File Templates
│   └── Customization Hooks
└── Validation Rules
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs/](./docs/)
- Issues: GitHub Issues
- Community: Qoder IDE Discord