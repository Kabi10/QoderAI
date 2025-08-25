# Express REST API - AI Generation Prompt

## Project Overview
**Category:** REST API  
**Project Name:** UserHub API  
**Target Audience:** Frontend developers and mobile app teams  
**Deployment Target:** AWS ECS

## Technical Requirements

### Core Technology Stack
- Node.js
- Express
- MongoDB
- Redis

### Architecture Requirements
- RESTful API design with proper HTTP methods and status codes
- MongoDB database with Mongoose ODM for data modeling
- 
- JWT-based authentication and authorization
- Comprehensive error handling and logging
- API documentation with OpenAPI/Swagger specification

### Features to Implement
- authentication
- rate-limiting
- monitoring
- documentation

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete Express API with the following structure:
```
UserHub API/
├── src/
│   ├── controllers/         # Route handlers and business logic
│   ├── middleware/          # Authentication, validation, error handling
│   ├── models/              # Database models and schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic and external API calls
│   ├── utils/               # Helper functions and utilities
│   ├── config/              # Database and environment configuration
│   ├── validators/          # Input validation schemas
│   └── app.js               # Express application setup
├── tests/
│   ├── unit/               # Unit tests for controllers and services
│   ├── integration/        # API endpoint integration tests
│   └── fixtures/           # Test data and mocks
├── docs/
│   ├── api/                # API documentation
│   └── deployment/         # Deployment guides
├── scripts/
│   ├── seed.js             # Database seeding
│   └── migrate.js          # Database migrations
├── .env.example
├── server.js               # Application entry point
├── package.json
└── README.md
```

### 2. Package.json Configuration
Include the following dependencies:
- Express ^4.18.2 for web framework
- mongoose ^6.9.1 for MongoDB integration
- 
- jsonwebtoken ^9.0.0 for JWT authentication
- bcryptjs ^2.4.3 for password hashing
- helmet ^6.0.1 for security headers
- cors ^2.8.5 for cross-origin requests
- morgan ^1.10.0 for request logging
- express-rate-limit ^6.7.0 for rate limiting
- joi ^17.7.1 for input validation
- Development tools: nodemon, jest, supertest, eslint

### 3. Core Application Setup

#### Express App Configuration
Create the main Express application with:
- Security middleware (helmet, cors, rate limiting)
- Request parsing (express.json, express.urlencoded)
- Logging with Morgan
- Error handling middleware
- Graceful shutdown handlers

#### Database Configuration
Set up MongoDB connection with:
- Connection string from environment variables
- Connection options for reliability and performance
- Connection event handlers for monitoring
- Automatic reconnection logic


### 4. Authentication System

#### JWT Implementation
Create authentication middleware with:
- User registration with password hashing
- Login with JWT token generation
- Token verification middleware
- Protected route implementation
- Refresh token mechanism
- Role-based access control (RBAC)

#### Security Best Practices
- Password strength validation
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- Secure password reset functionality
- Input sanitization and validation

### 5. API Route Structure

#### Core Endpoints
Generate the following route groups:
- **Authentication Routes** (`/api/auth`)
  - POST /register - User registration
  - POST /login - User authentication
  - POST /logout - User logout
  - POST /refresh - Token refresh
  - POST /forgot-password - Password reset request
  - POST /reset-password - Password reset confirmation

- **User Management** (`/api/users`)
  - GET / - List users (admin only)
  - GET /:id - Get user profile
  - PUT /:id - Update user profile
  - DELETE /:id - Delete user (admin only)

- **Resource Management** (`/api/resources`)
  - GET / - List all resources with pagination
  - GET /:id - Get specific resource
  - POST / - Create new resource
  - PUT /:id - Update resource
  - DELETE /:id - Delete resource

### 6. Data Models and Validation

#### Database Models
Create Mongoose schemas for:
- User model with authentication fields
- Resource models with relationships
- Audit logging models
- Index optimization for performance


#### Input Validation
Implement Joi validation schemas for:
- User registration and profile updates
- Resource creation and modification
- Query parameters and pagination
- File upload validation (if applicable)

### 7. Error Handling and Logging

#### Comprehensive Error Handling
- Global error handling middleware
- Custom error classes for different scenarios
- Proper HTTP status codes
- Error logging with stack traces
- User-friendly error messages

#### Logging Strategy
- Request/response logging
- Error logging with severity levels
- Performance monitoring
- Security event logging
- Log rotation and retention

### 8. API Documentation

#### OpenAPI/Swagger Specification
Generate complete API documentation including:
- Endpoint descriptions and parameters
- Request/response schemas
- Authentication requirements
- Error response formats
- Example requests and responses
- Interactive API testing interface

### 9. Testing Suite

#### Unit Tests
Write tests for:
- Controller functions with mocked dependencies
- Service layer business logic
- Utility functions and helpers
- Middleware functionality

#### Integration Tests
Create tests for:
- Complete API endpoint workflows
- Database operations and transactions
- Authentication and authorization flows
- Error handling scenarios

### 10. Performance and Security

#### Performance Optimization
- Database query optimization
- Response caching strategies
- Compression middleware
- Request/response size optimization
- Connection pooling and resource management

#### Security Implementation
- Input sanitization and XSS prevention
- SQL injection protection
- CSRF protection
- Security headers configuration
- API rate limiting and throttling

## Constraints and Considerations
- RESTful design
- OpenAPI specification
- JWT authentication

## Success Criteria
The generated API should:
1. ✅ Provide complete REST API functionality with proper HTTP methods
2. ✅ Include comprehensive authentication and authorization
3. ✅ Have robust error handling and logging
4. ✅ Pass all security vulnerability scans
5. ✅ Include complete API documentation
6. ✅ Have 90%+ test coverage
7. ✅ Be ready for deployment to AWS ECS
8. ✅ Handle concurrent requests efficiently
9. ✅ Include database migrations and seeding scripts

## Additional Notes
- Generate production-ready code with comprehensive error handling
- Include deployment scripts and Docker configuration
- Implement proper logging for debugging and monitoring
- Follow RESTful API design principles and conventions
- Add API versioning support for future compatibility
- Include monitoring and health check endpoints

---
*Generated by Qoder Universal Prompt Generator on 2025-08-25T23:03:56.619Z*