# Universal Prompt Generator API Documentation

## Overview

The Universal Prompt Generator provides a comprehensive API for generating specialized prompt suites for any digital product category. This documentation covers all available methods, parameters, and usage patterns.

## Core Classes

### UniversalPromptGenerator

The main entry point for the prompt generation system.

#### Constructor

```javascript
const generator = new UniversalPromptGenerator();
```

#### Methods

##### `initialize()`

Initializes the generator and loads all necessary components.

```javascript
await generator.initialize();
```

**Returns:** `Promise<void>`

**Throws:** `Error` if initialization fails

##### `generatePromptSuite(inputs)`

Generates a complete prompt suite for the specified inputs.

```javascript
const promptSuite = await generator.generatePromptSuite({
  category: 'web-app',
  projectName: 'MyApp',
  techStack: ['React', 'Node.js'],
  targetAudience: 'Web developers',
  deploymentTarget: 'Vercel'
});
```

**Parameters:**

- `inputs` (Object): Generation configuration
  - `category` (string, required): Product category
  - `projectName` (string, required): Project name
  - `techStack` (Array<string>): Technology stack
  - `targetAudience` (string): Target user base
  - `deploymentTarget` (string): Deployment platform
  - `outputPath` (string): Output directory
  - `featureFlags` (Array<string>): Optional features
  - `constraints` (Array<string>): Project constraints
  - `stylePreferences` (Object): UI/UX preferences
  - `performanceTargets` (Object): Performance requirements
  - `complianceRequirements` (Array<string>): Compliance standards

**Returns:** `Promise<PromptSuite>`

**Throws:** `Error` if generation fails

##### `getAvailableCategories()`

Returns all available product categories.

```javascript
const categories = generator.getAvailableCategories();
```

**Returns:** `Array<Category>`

##### `getCategoryInfo(categoryId)`

Gets detailed information about a specific category.

```javascript
const info = generator.getCategoryInfo('web-app');
```

**Parameters:**

- `categoryId` (string): Category identifier

**Returns:** `Category | null`

##### `validateGeneratedSuite(outputPath)`

Validates a previously generated prompt suite.

```javascript
const validation = await generator.validateGeneratedSuite('./output');
```

**Parameters:**

- `outputPath` (string): Path to generated files

**Returns:** `Promise<ValidationResult>`

## Data Types

### PromptSuite

Complete prompt suite with generated files and metadata.

```javascript
{
  metadata: {
    category: 'web-app',
    projectName: 'MyApp',
    techStack: ['React', 'Node.js'],
    generatedAt: '2024-01-15T10:30:00Z',
    version: '1.0.0',
    generatedFiles: 15,
    totalSize: 125000
  },
  files: {
    src: {
      description: 'Application source code',
      files: [
        {
          templateId: 'react-app',
          path: 'App.jsx',
          content: '// React component code...',
          size: 2048,
          validation: { valid: true, errors: [], warnings: [] }
        }
      ]
    }
  },
  manifest: {
    version: '1.0.0',
    generator: 'Qoder Universal Prompt Generator',
    structure: { /* file organization */ }
  },
  statistics: {
    totalFiles: 15,
    totalSize: 125000,
    fileTypes: { '.js': 8, '.json': 2, '.md': 3 },
    averageSize: 8333
  },
  usageInstructions: {
    quickStart: ['Step 1', 'Step 2', '...'],
    setup: { dependencies: '...', environment: '...' },
    nextSteps: ['Customize', 'Deploy', '...']
  },
  fileCount: 15,
  totalSize: 125000
}
```

### Category

Product category definition.

```javascript
{
  id: 'web-app',
  name: 'Web Application',
  description: 'Modern web applications with rich user interfaces',
  subcategories: ['react-app', 'vue-app', 'angular-app'],
  outputStructure: {
    src: 'Application source code',
    public: 'Static assets',
    docs: 'Documentation'
  },
  enabled: true,
  loadedAt: '2024-01-15T10:00:00Z'
}
```

### ValidationResult

Validation results for generated content.

```javascript
{
  valid: true,
  errors: [],
  warnings: ['Minor warning message'],
  security: {
    passed: true,
    issues: []
  },
  performance: {
    passed: true,
    issues: []
  },
  quality: {
    score: 85,
    metrics: {
      codeQuality: 0.8,
      documentation: 0.9,
      testCoverage: 0.7
    }
  }
}
```

## Component APIs

### CategoryRegistry

Manages product categories and their configurations.

#### Methods

##### `loadCategories()`

Loads all category definitions.

```javascript
await categoryRegistry.loadCategories();
```

##### `getAllCategories()`

Returns all enabled categories.

```javascript
const categories = categoryRegistry.getAllCategories();
```

##### `getCategoryConfig(categoryId)`

Gets complete configuration for a category.

```javascript
const config = await categoryRegistry.getCategoryConfig('web-app');
```

##### `searchCategories(query)`

Searches categories by name or description.

```javascript
const results = categoryRegistry.searchCategories('web');
```

### TemplateEngine

Handles template loading, selection, and rendering.

#### Methods

##### `loadTemplates()`

Loads all template files.

```javascript
await templateEngine.loadTemplates();
```

##### `selectTemplates(categoryConfig, inputs)`

Selects appropriate templates for generation.

```javascript
const templates = await templateEngine.selectTemplates(config, inputs);
```

##### `renderTemplates(templates, context)`

Renders templates with the provided context.

```javascript
const files = await templateEngine.renderTemplates(templates, context);
```

##### `getTemplate(templateId)`

Gets a specific template by ID.

```javascript
const template = templateEngine.getTemplate('react-app');
```

### ValidationEngine

Handles input and output validation.

#### Methods

##### `validateInputs(inputs)`

Validates user inputs.

```javascript
const normalizedInputs = await validationEngine.validateInputs(inputs);
```

##### `validateOutput(promptSuite)`

Validates generated output.

```javascript
const validation = await validationEngine.validateOutput(promptSuite);
```

##### `validateGeneratedContent(files)`

Validates individual files.

```javascript
const validatedFiles = await validationEngine.validateGeneratedContent(files);
```

### FileGenerator

Manages file output and generation.

#### Methods

##### `generateFiles(promptSuite, outputPath)`

Generates all files to the specified path.

```javascript
const results = await fileGenerator.generateFiles(promptSuite, './output');
```

##### `setOutputOptions(options)`

Configures file generation options.

```javascript
fileGenerator.setOutputOptions({
  overwriteFiles: true,
  backupExisting: false
});
```

## Template System

### Template Metadata

Templates include metadata in comments:

```mustache
{{!-- @title: React Application Template --}}
{{!-- @description: Modern React app with TypeScript --}}
{{!-- @category: web-app --}}
{{!-- @subcategory: react --}}
{{!-- @techStack: React, TypeScript --}}
{{!-- @outputPath: src/App.tsx --}}
```

### Context Variables

Templates have access to rich context data:

```mustache
{
  category: 'web-app',
  projectName: 'MyApp',
  techStack: ['React', 'TypeScript'],
  targetAudience: 'Developers',
  deploymentTarget: 'Vercel',
  date: {
    iso: '2024-01-15T10:30:00Z',
    formatted: '20240115',
    year: 2024
  },
  git: {
    branch: 'web-app/MyApp-20240115',
    commitMessage: 'feat(web-app): initialize MyApp'
  },
  utils: {
    camelCase: function,
    pascalCase: function,
    kebabCase: function
  }
}
```

### Conditional Sections

Templates support conditional rendering:

```mustache
{{#utils.includes techStack 'TypeScript'}}
// TypeScript-specific code
interface Props {
  name: string;
}
{{/utils.includes}}

{{#featureFlags}}
  {{#utils.includes . 'routing'}}
import { BrowserRouter } from 'react-router-dom';
  {{/utils.includes}}
{{/featureFlags}}
```

### Partials

Reusable template components:

```mustache
{{>header}}
{{>navigation}}
{{>footer}}
```

## Error Handling

### Common Errors

#### `CategoryNotFoundError`

Thrown when an invalid category is specified.

```javascript
try {
  await generator.generatePromptSuite({ category: 'invalid' });
} catch (error) {
  if (error.message.includes('Category not found')) {
    // Handle invalid category
  }
}
```

#### `ValidationError`

Thrown when input validation fails.

```javascript
try {
  await generator.generatePromptSuite({ /* invalid inputs */ });
} catch (error) {
  if (error.message.includes('Input validation failed')) {
    // Handle validation errors
  }
}
```

#### `TemplateRenderError`

Thrown when template rendering fails.

```javascript
try {
  await templateEngine.renderTemplates(templates, context);
} catch (error) {
  if (error.message.includes('Template rendering failed')) {
    // Handle template errors
  }
}
```

### Error Response Format

```javascript
{
  name: 'ValidationError',
  message: 'Input validation failed: Project name is required',
  code: 'VALIDATION_FAILED',
  details: {
    field: 'projectName',
    value: '',
    constraint: 'required'
  },
  stack: '...' // In development mode
}
```

## Configuration

### Environment Variables

Key configuration options:

```bash
# System
NODE_ENV=development
LOG_LEVEL=info
MAX_FILE_SIZE=5242880

# Template Engine
TEMPLATE_DELIMITER={{|}}
STRICT_MODE=true

# Validation
ENABLE_SYNTAX_CHECK=true
ENABLE_SECURITY_SCAN=true
MAX_FILE_COUNT=100

# Performance
GENERATION_TIMEOUT=5000
TEMPLATE_RENDER_TIMEOUT=1000
```

### Runtime Configuration

```javascript
const generator = new UniversalPromptGenerator({
  maxFileSize: 5 * 1024 * 1024,
  enableValidation: true,
  templatePath: './custom-templates',
  outputOptions: {
    overwriteFiles: false,
    backupExisting: true
  }
});
```

## Usage Examples

### Basic Web Application

```javascript
const generator = new UniversalPromptGenerator();
await generator.initialize();

const promptSuite = await generator.generatePromptSuite({
  category: 'web-app',
  projectName: 'TaskManager',
  techStack: ['React', 'TypeScript', 'Tailwind CSS'],
  targetAudience: 'Business users',
  deploymentTarget: 'Vercel',
  featureFlags: ['auth', 'routing', 'testing']
});

console.log(`Generated ${promptSuite.fileCount} files`);
```

### REST API with Database

```javascript
const promptSuite = await generator.generatePromptSuite({
  category: 'rest-api',
  projectName: 'UserAPI',
  techStack: ['Node.js', 'Express', 'PostgreSQL'],
  targetAudience: 'Frontend developers',
  deploymentTarget: 'AWS',
  featureFlags: ['auth', 'rate-limiting', 'monitoring'],
  constraints: ['RESTful design', 'OpenAPI spec']
});
```

### Mobile Application

```javascript
const promptSuite = await generator.generatePromptSuite({
  category: 'mobile-app',
  projectName: 'FitnessTracker',
  techStack: ['React Native', 'TypeScript'],
  targetAudience: 'Fitness enthusiasts',
  deploymentTarget: 'App Stores',
  featureFlags: ['navigation', 'offline-support', 'analytics']
});
```

## Best Practices

### Input Validation

Always validate inputs before generation:

```javascript
if (!inputs.category || !inputs.projectName) {
  throw new Error('Category and project name are required');
}

// Normalize tech stack
inputs.techStack = inputs.techStack?.map(tech => 
  tech.trim().replace(/^(react|vue|angular)$/i, match => 
    match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  )
) || [];
```

### Error Handling

Implement comprehensive error handling:

```javascript
try {
  const promptSuite = await generator.generatePromptSuite(inputs);
  return promptSuite;
} catch (error) {
  logger.error('Generation failed', {
    category: inputs.category,
    projectName: inputs.projectName,
    error: error.message
  });
  
  if (error.name === 'ValidationError') {
    // Handle validation errors specifically
    return { error: 'Invalid input', details: error.details };
  }
  
  throw error; // Re-throw unexpected errors
}
```

### Performance Optimization

Use appropriate generation strategies:

```javascript
// For large projects, consider streaming generation
const generator = new UniversalPromptGenerator({
  streamGeneration: true,
  batchSize: 10
});

// Monitor performance
const startTime = Date.now();
const promptSuite = await generator.generatePromptSuite(inputs);
const duration = Date.now() - startTime;

if (duration > 10000) {
  logger.warn('Slow generation detected', { duration, fileCount: promptSuite.fileCount });
}
```

## Integration Patterns

### CLI Integration

```javascript
#!/usr/bin/env node
import { UniversalPromptGenerator } from 'qoder-prompt-generator';

const generator = new UniversalPromptGenerator();
await generator.initialize();

// Parse CLI arguments and generate
const inputs = parseCLIArgs();
const promptSuite = await generator.generatePromptSuite(inputs);

console.log(`✅ Generated ${promptSuite.fileCount} files`);
```

### Web Service Integration

```javascript
import express from 'express';
import { UniversalPromptGenerator } from 'qoder-prompt-generator';

const app = express();
const generator = new UniversalPromptGenerator();

app.post('/generate', async (req, res) => {
  try {
    const promptSuite = await generator.generatePromptSuite(req.body);
    res.json(promptSuite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### IDE Plugin Integration

```javascript
// VS Code extension example
import * as vscode from 'vscode';
import { UniversalPromptGenerator } from 'qoder-prompt-generator';

export function activate(context: vscode.ExtensionContext) {
  const generator = new UniversalPromptGenerator();
  
  const command = vscode.commands.registerCommand('qoder.generatePrompt', async () => {
    // Get user inputs via VS Code UI
    const inputs = await getUserInputs();
    
    // Generate prompt suite
    const promptSuite = await generator.generatePromptSuite(inputs);
    
    // Create files in workspace
    await createWorkspaceFiles(promptSuite);
  });
  
  context.subscriptions.push(command);
}
```

This API documentation provides comprehensive coverage of the Universal Prompt Generator system, including all methods, data types, configuration options, and integration patterns.