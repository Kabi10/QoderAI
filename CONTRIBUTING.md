# Contributing to Qoder AI Universal Prompt Generator

Thank you for your interest in contributing to the Universal Prompt Generator! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or request features
- Search existing issues before creating new ones
- Provide detailed reproduction steps for bugs
- Include system information and error messages

### Pull Requests
1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation as needed
7. Submit a pull request

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Getting Started
```bash
# Clone your fork
git clone https://github.com/your-username/qoder-ai.git
cd qoder-ai

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Run demo
node demo.js
```

## 📋 Code Standards

### Code Style
- Use ESLint configuration provided
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Commit Messages
Follow conventional commits format:
```
type(scope): description

feat(templates): add Vue.js application template
fix(validation): resolve input sanitization issue
docs(api): update generation examples
test(core): add integration tests for file generation
```

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases

## 🏗 Project Structure

```
src/
├── core/           # Core system components
├── validation/     # Input/output validation
├── output/         # File generation
├── utils/          # Utilities and helpers
├── index.js        # Main entry point
└── cli.js          # Command-line interface

templates/          # Template library
├── applications/   # App templates
├── apis/          # API templates
├── websites/      # Website templates
└── universal/     # Cross-category templates

tests/             # Test suites
docs/              # Documentation
config/            # Configuration files
```

## 🎨 Adding New Categories

To add a new product category:

1. **Define Category** in `src/core/CategoryRegistry.js`:
```javascript
{
  id: 'new-category',
  name: 'New Category',
  description: 'Description of the category',
  subcategories: ['subcategory-1', 'subcategory-2'],
  outputStructure: {
    src: 'Source code',
    docs: 'Documentation'
  }
}
```

2. **Create Templates** in `templates/new-category/`:
```mustache
{{!-- @title: New Category Template --}}
{{!-- @description: Template description --}}
{{!-- @category: new-category --}}
{{!-- @techStack: Technology1, Technology2 --}}
{{!-- @outputPath: path/to/output.ext --}}

Template content with {{variables}}
```

3. **Add Validation Rules** in `src/validation/ValidationEngine.js`

4. **Write Tests** in `tests/categories/`

5. **Update Documentation**

## 📝 Template Guidelines

### Template Metadata
Include comprehensive metadata:
```mustache
{{!-- @title: Clear, descriptive title --}}
{{!-- @description: What this template generates --}}
{{!-- @category: main-category --}}
{{!-- @subcategory: specific-subcategory --}}
{{!-- @techStack: Tech1, Tech2, Tech3 --}}
{{!-- @outputPath: relative/path/from/project/root --}}
```

### Context Variables
Use consistent variable naming:
- `projectName` - Project name
- `category` - Product category
- `techStack` - Array of technologies
- `targetAudience` - Target users
- `deploymentTarget` - Deployment platform
- `featureFlags` - Optional features
- `date` - Generation timestamp objects
- `utils` - Utility functions (camelCase, kebabCase, etc.)

### Conditional Sections
Use feature flags for optional content:
```mustache
{{#utils.includes techStack 'React'}}
// React-specific code
{{/utils.includes}}

{{#featureFlags}}
  {{#utils.includes . 'authentication'}}
  // Authentication code
  {{/utils.includes}}
{{/featureFlags}}
```

## 🧪 Testing Guidelines

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing  
- **E2E Tests**: Complete workflow testing
- **Template Tests**: Template rendering validation

### Test Structure
```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('method name', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = {};
      
      // Act
      const result = await method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

## 📚 Documentation

### API Documentation
- Document all public methods
- Include parameter types and descriptions
- Provide usage examples
- Keep examples up to date

### README Updates
- Update feature lists
- Add new category information
- Include usage examples
- Maintain getting started guide

## 🚀 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x`
4. Push changes and tags
5. Create GitHub release
6. Publish to npm (if applicable)

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Collaborate effectively

### Communication
- Use GitHub Issues for bug reports and feature requests
- Use GitHub Discussions for questions and ideas
- Join community Discord/Slack for real-time chat
- Follow project maintainers on social media

## 📞 Getting Help

- **Documentation**: Check docs/ directory
- **Issues**: Search GitHub Issues
- **Discussions**: GitHub Discussions tab
- **Community**: Discord/Slack channels
- **Email**: maintainers@qoder.com

## 🏷 Labels and Tags

We use these labels for issues and PRs:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🎉 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor events
- Given special Discord roles

Thank you for contributing to Qoder AI! 🚀