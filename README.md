# 🤖 Universal Prompt Generator for Qoder IDE

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](package.json)

An intelligent AI prompt factory system that generates specialized, production-ready prompt instructions for creating any digital product, application, or artifact. Transform high-level specifications into detailed AI-readable implementation guides.

## 🚀 Overview

The Universal Prompt Generator creates comprehensive AI prompt files that contain detailed instructions for generating production-ready applications. Instead of generating code directly, it produces structured markdown files that AI systems can use to create complete, functional projects.

### ✨ Key Features

- **🎯 AI-Focused**: Generates detailed prompts for AI systems to create applications
- **📋 Category-Specific**: 10+ specialized prompt templates for different project types
- **🏗️ Production-Ready**: Complete implementation instructions including architecture, testing, and deployment
- **🔧 Self-Contained**: Each prompt contains everything needed for full project generation
- **⚡ CLI & Programmatic**: Both command-line and API access
- **🔍 Quality Validated**: Built-in validation for prompt completeness and accuracy

## 📁 Project Categories

### 🖥️ Applications & Software
- **`web-app`** - React, Vue, Angular applications with full-stack architecture
- **`mobile-app`** - React Native, Flutter, native iOS/Android applications
- **`desktop-app`** - Electron, Tauri cross-platform desktop applications
- **`cli-tool`** - Command line utilities and developer tools
- **`browser-extension`** - Chrome, Firefox, Safari extensions
- **`pwa`** - Progressive Web Apps with offline capabilities

### 🌐 Websites & Digital Presence
- **`landing-page`** - Marketing websites with conversion optimization
- **`portfolio-site`** - Personal and agency portfolio websites
- **`blog-platform`** - Content management and blogging systems
- **`e-commerce`** - Online stores with payment integration
- **`documentation-site`** - API docs, user guides, knowledge bases
- **`corporate-website`** - Business and enterprise websites

### 🔌 APIs & Backend Services
- **`rest-api`** - RESTful services with authentication and documentation
- **`graphql-api`** - GraphQL schemas with resolvers and subscriptions
- **`websocket-service`** - Real-time communication services
- **`webhook-handler`** - Event processing and integration systems
- **`auth-service`** - Authentication and authorization systems
- **`data-pipeline`** - ETL processes and data transformation

### 🎮 Games & Interactive Media
- **`web-game`** - HTML5 canvas games with physics and audio
- **`mobile-game`** - 2D/3D mobile games with monetization
- **`interactive-story`** - Visual novels and narrative games
- **`simulation`** - Physics simulations and educational tools
- **`ar-vr-experience`** - Augmented and Virtual Reality applications

### 🤖 AI & Machine Learning
- **`chatbot`** - Conversational AI with NLP integration
- **`ml-model`** - Machine learning training pipelines
- **`computer-vision`** - Image processing and recognition systems
- **`nlp-service`** - Text analysis and language processing
- **`recommendation-engine`** - Personalization and content recommendation
- **`data-analysis-tool`** - Analytics dashboards and visualization

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git for version control

### Global Installation
```bash
npm install -g @qoder/universal-prompt-generator
```

### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/Kabi10/QoderAI.git
cd QoderAI

# Install dependencies
npm install

# Run the demo
node demo.js
```

## 📖 Usage Guide

### Command Line Interface

#### Interactive Mode (Recommended)
```bash
# Start interactive prompt generation
node src/cli.js generate --interactive
```

#### Direct Generation
```bash
# Generate React web application prompt
node src/cli.js generate \
  --category web-app \
  --name "TaskMaster Pro" \
  --tech-stack "React,TypeScript,Node.js" \
  --audience "Project managers" \
  --deployment "Vercel"
```

#### List Available Categories
```bash
node src/cli.js list-categories
```

#### Get Category Information
```bash
node src/cli.js info web-app
```

### Programmatic Usage

```javascript
import { UniversalPromptGenerator } from './src/index.js';

// Initialize the generator
const generator = new UniversalPromptGenerator();
await generator.initialize();

// Generate AI prompts
const promptSuite = await generator.generatePromptSuite({
  category: 'web-app',
  projectName: 'My App',
  techStack: ['React', 'TypeScript', 'Node.js'],
  targetAudience: 'End users',
  deploymentTarget: 'Vercel',
  featureFlags: ['authentication', 'responsive-design']
});

console.log(`Generated ${promptSuite.fileCount} prompt files`);
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | ✅ | Project category (web-app, mobile-app, etc.) |
| `projectName` | string | ✅ | Name of the project to generate |
| `techStack` | array | ❌ | Technologies to use (React, Node.js, etc.) |
| `targetAudience` | string | ❌ | Intended users of the application |
| `deploymentTarget` | string | ❌ | Where to deploy (Vercel, AWS, etc.) |
| `featureFlags` | array | ❌ | Optional features to include |
| `constraints` | array | ❌ | Project constraints and requirements |
| `outputPath` | string | ❌ | Where to save generated prompts |

## 📂 Generated Output Structure

The system generates AI prompt files organized as follows:

```
prompts/
├── {project-name}/
│   ├── {category}-prompt.md     # Main implementation prompt
│   ├── readme-documentation.md  # Documentation prompt
│   └── demo-summary.json       # Generation metadata
└── templates/
    ├── react-web-app.md        # React application prompt
    ├── express-api.md          # REST API prompt
    ├── mobile-app.md           # Mobile app prompt
    ├── landing-page.md         # Landing page prompt
    └── desktop-app.md          # Desktop app prompt
```

### Example Generated Prompt

Each generated prompt file contains:

```markdown
# React TypeScript Web Application - AI Generation Prompt

## Project Overview
**Project Name:** TaskMaster Pro
**Target Audience:** Project managers and team leads
**Deployment Target:** Vercel

## Technical Requirements
### Core Technology Stack
- React ^18.2.0
- TypeScript ^4.9.0
- Node.js ^18.0.0

## Detailed Implementation Instructions
### 1. Project Structure
[Detailed directory structure]

### 2. Component Architecture
[Component specifications]

### 3. State Management
[Redux/Context setup]

## Success Criteria
[Validation checkpoints]
```

## 🏗️ Project Architecture

```
src/
├── core/                    # Core system components
│   ├── PromptGenerator.js   # Main generation engine
│   ├── CategoryRegistry.js  # Category management
│   ├── TemplateEngine.js    # Template processing
│   └── ValidationEngine.js  # Quality assurance
├── output/                  # Output formatting
├── utils/                   # Utility functions
├── validation/              # Input validation
├── cli.js                   # Command line interface
└── index.js                 # Main entry point

templates/
└── prompts/                 # AI prompt templates
    ├── react-web-app.md
    ├── express-api.md
    ├── mobile-app.md
    └── [other templates]

config/
└── categories/              # Category configurations

tests/
└── integration/             # Test suites

docs/
└── api/                     # Documentation
```

## 🧪 Development & Testing

### Development Commands
```bash
# Run demo to test system
node demo.js

# Test CLI interface
node src/cli.js list-categories

# Run specific category generation
node src/cli.js generate --category web-app --name "Test App"

# Validate generated prompts
node src/cli.js validate ./prompts/test-app
```

### Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Linting & Quality
```bash
# Code linting
npm run lint

# Fix linting issues
npm run lint:fix

# Validate templates
npm run validate:templates
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.example
DEBUG=true                    # Enable debug logging
OUTPUT_PATH=./prompts         # Default output directory
TEMPLATE_PATH=./templates     # Template directory
LOG_LEVEL=info               # Logging level
```

### Custom Templates

Create custom prompt templates in `templates/prompts/`:

```markdown
# My Custom Template - AI Generation Prompt

## Project Overview
**Category:** {{category}}
**Project Name:** {{projectName}}

## Technical Requirements
{{#techStack}}
- {{.}}
{{/techStack}}

[Your custom implementation instructions]
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/QoderAI.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and add tests
6. Ensure tests pass: `npm test`
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Write tests for new functionality
- Update documentation for API changes
- Use descriptive commit messages
- Ensure all tests pass before submitting

### Adding New Templates
1. Create a new `.md` file in `templates/prompts/`
2. Follow the existing template structure
3. Add the template to appropriate category configuration
4. Test the template with the demo system
5. Submit a pull request with documentation

## 📊 System Statistics

- **5 Main Categories** with 30+ subcategories
- **5+ Specialized Prompt Templates** for different project types
- **Comprehensive Validation** with quality scoring
- **CLI and Programmatic Access** for flexibility
- **Production-Ready Output** with detailed implementation guides

## 🔍 Troubleshooting

### Common Issues

**Template Not Found**
```bash
# Check available templates
node src/cli.js list-categories

# Verify template exists
ls templates/prompts/
```

**Generation Fails**
```bash
# Enable debug mode
DEBUG=true node src/cli.js generate --category web-app --name "Test"

# Check input validation
node src/cli.js validate-input --category web-app
```

**Output Directory Issues**
```bash
# Specify custom output path
node src/cli.js generate --output ./custom-output --category web-app
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Primary Developer**: [Kabi10](https://github.com/Kabi10)
- **Contributors**: See [Contributors](https://github.com/Kabi10/QoderAI/contributors)

## 🙏 Acknowledgments

- Inspired by the need for standardized AI prompt generation
- Built for integration with [Qoder IDE](https://docs.qoder.com/)
- Community feedback and contributions
- Open source libraries and frameworks used

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/Kabi10/QoderAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Kabi10/QoderAI/discussions)
- **Email**: kabilan321@gmail.com

---

**Made with ❤️ for the AI development community**