# README Documentation - AI Generation Prompt

## Project Overview
**Category:** Documentation  
**Project Name:** {{projectName}}  
**Target Audience:** {{targetAudience}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Documentation Requirements
- Comprehensive project overview and purpose
- Clear installation and setup instructions
- Usage examples and API documentation
- Contributing guidelines and development workflow
- Professional formatting with badges and visuals

### Features to Document
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. README Structure
Generate a comprehensive README.md with the following sections:

```markdown
# {{projectName}}

[Brief project description and value proposition]

## 🚀 Features

[List of key features and capabilities]

## 📋 Prerequisites

[System requirements and dependencies]

## 🛠️ Installation

[Step-by-step installation guide]

## 🎯 Usage

[Basic usage examples and code snippets]

## 📖 API Documentation

[API endpoints and usage examples]

## 🏗️ Project Structure

[Directory structure and file organization]

## 🧪 Testing

[How to run tests and testing strategy]

## 📦 Deployment

[Deployment instructions and configuration]

## 🤝 Contributing

[Guidelines for contributors]

## 📝 License

[License information]

## 👥 Authors

[Project maintainers and contributors]

## 🙏 Acknowledgments

[Credits and acknowledgments]
```

### 2. Badges and Status Indicators
Include relevant badges for:
- Build status and CI/CD pipeline
- Test coverage percentage
- Version and release information
- License type and compliance
- Dependencies and security status
- Code quality metrics

### 3. Feature Documentation
Create detailed feature sections:
{{#hasAuthentication}}
#### Authentication System
- User registration and login
- JWT token management
- Role-based access control
- Password reset functionality
{{/hasAuthentication}}

{{#hasAPI}}
#### API Endpoints
- RESTful API design
- Request/response examples
- Authentication requirements
- Error handling and status codes
{{/hasAPI}}

{{#hasDatabase}}
#### Database Integration
- Database schema overview
- Migration instructions
- Data seeding and fixtures
- Backup and recovery procedures
{{/hasDatabase}}

### 4. Installation Instructions
Provide platform-specific installation:

#### Prerequisites
```bash
# System requirements
{{#hasNode}}Node.js >= 16.0.0{{/hasNode}}
{{#hasPython}}Python >= 3.8{{/hasPython}}
{{#hasDocker}}Docker and Docker Compose{{/hasDocker}}
{{#hasDatabase}}{{#hasPostgreSQL}}PostgreSQL >= 12{{/hasPostgreSQL}}{{#hasMongoDB}}MongoDB >= 4.4{{/hasMongoDB}}{{/hasDatabase}}
```

#### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/{{githubUsername}}/{{projectName}}.git
cd {{projectName}}

# Install dependencies
{{#hasNode}}npm install{{/hasNode}}
{{#hasPython}}pip install -r requirements.txt{{/hasPython}}

# Environment configuration
cp .env.example .env
# Edit .env with your configuration

# Database setup
{{#hasDatabase}}
{{#hasPostgreSQL}}createdb {{projectName}}_dev{{/hasPostgreSQL}}
{{#hasMongoDB}}# MongoDB connection string in .env{{/hasMongoDB}}
npm run migrate
{{/hasDatabase}}

# Start development server
{{#hasNode}}npm run dev{{/hasNode}}
{{#hasPython}}python manage.py runserver{{/hasPython}}
```

### 5. Usage Examples
Provide practical usage examples:

#### Basic Usage
```javascript
// Example of core functionality
{{#hasAPI}}
const response = await fetch('/api/{{resourceName}}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
{{/hasAPI}}
```

#### Advanced Configuration
```yaml
# Configuration example
{{projectName}}:
  environment: production
  {{#hasDatabase}}database:
    host: localhost
    port: 5432
    name: {{projectName}}_prod{{/hasDatabase}}
  {{#hasCache}}cache:
    redis_url: redis://localhost:6379{{/hasCache}}
  {{#hasAPI}}api:
    rate_limit: 1000
    timeout: 30s{{/hasAPI}}
```

### 6. API Documentation
{{#hasAPI}}
Include comprehensive API documentation:

#### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

#### Core Resources
```http
# Get all resources
GET /api/{{resourceName}}
Authorization: Bearer <token>

# Create new resource
POST /api/{{resourceName}}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Resource Name",
  "description": "Resource Description"
}

# Update resource
PUT /api/{{resourceName}}/:id
Authorization: Bearer <token>
Content-Type: application/json

# Delete resource
DELETE /api/{{resourceName}}/:id
Authorization: Bearer <token>
```
{{/hasAPI}}

### 7. Testing Documentation
Include comprehensive testing information:

#### Running Tests
```bash
# Run all tests
{{#hasNode}}npm test{{/hasNode}}
{{#hasPython}}python -m pytest{{/hasPython}}

# Run with coverage
{{#hasNode}}npm run test:coverage{{/hasNode}}
{{#hasPython}}pytest --cov={{projectName}}{{/hasPython}}

# Run specific test suite
{{#hasNode}}npm test -- --testPathPattern=integration{{/hasNode}}
{{#hasPython}}pytest tests/integration/{{/hasPython}}
```

#### Test Structure
- Unit tests: Component and function testing
- Integration tests: API endpoint testing
- E2E tests: Complete user workflow testing
- Performance tests: Load and stress testing

### 8. Deployment Instructions
Provide deployment guidance for {{deploymentTarget}}:

{{#hasDocker}}
#### Docker Deployment
```bash
# Build production image
docker build -t {{projectName}}:latest .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f {{projectName}}
```
{{/hasDocker}}

{{#hasVercel}}
#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```
{{/hasVercel}}

### 9. Contributing Guidelines
Create comprehensive contribution guidelines:

#### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

#### Code Standards
- Follow existing code style and conventions
- Write tests for new functionality
- Update documentation for API changes
- Use descriptive commit messages
- Ensure all tests pass before submitting

### 10. Troubleshooting Section
Include common issues and solutions:

#### Common Issues
**Installation Problems**
- Node.js version compatibility
- Port conflicts and binding issues
- Database connection failures
- Environment variable configuration

**Runtime Errors**
- API authentication failures
- Database query timeouts
- Memory usage and performance
- CORS and security headers

## Success Criteria
The generated README should:
1. ✅ Provide clear project overview and value proposition
2. ✅ Include comprehensive installation instructions
3. ✅ Have practical usage examples and code snippets
4. ✅ Document all API endpoints and authentication
5. ✅ Include testing and deployment instructions
6. ✅ Have professional formatting with badges and visuals
7. ✅ Provide contributing guidelines and development workflow
8. ✅ Include troubleshooting and support information

## Additional Notes
- Use consistent markdown formatting throughout
- Include relevant badges for build status and metrics
- Add screenshots or GIFs for visual features
- Provide links to detailed documentation
- Include acknowledgments and license information
- Keep the tone professional but approachable
- Update version numbers and dates appropriately

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*