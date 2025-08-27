# Serverless Functions - AI Generation Prompt

## Project Overview
**Category:** Backend & Database  
**Project Name:** {{projectName}}  
**Cloud Provider:** {{cloudProvider}}  
**Runtime:** {{runtime}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Serverless Features
- {{#hasEventDriven}}Event-driven architecture with triggers{{/hasEventDriven}}
- {{#hasAPIGateway}}HTTP API endpoints with gateway integration{{/hasAPIGateway}}
- {{#hasDatabase}}Database integration with connection pooling{{/hasDatabase}}
- {{#hasAuthentication}}JWT-based authentication and authorization{{/hasAuthentication}}
- {{#hasMonitoring}}Comprehensive logging and monitoring{{/hasMonitoring}}
- {{#hasValidation}}Input validation and error handling{{/hasValidation}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete serverless functions project with the following structure:
```
{{projectName}}-serverless/
├── functions/                  # Individual function implementations
│   ├── auth/
│   │   ├── login/
│   │   │   ├── handler.{{fileExtension}}
│   │   │   ├── schema.json
│   │   │   └── README.md
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── refresh-token/
│   ├── users/
│   │   ├── get-user/
│   │   ├── update-user/
│   │   ├── list-users/
│   │   └── delete-user/
│   ├── api/
│   │   ├── webhook/
│   │   ├── upload/
│   │   └── analytics/
│   └── jobs/
│       ├── email-sender/
│       ├── data-processor/
│       └── cleanup/
├── shared/                     # Shared utilities and libraries
│   ├── middleware/
│   │   ├── auth.{{fileExtension}}
│   │   ├── validation.{{fileExtension}}
│   │   ├── cors.{{fileExtension}}
│   │   └── error-handler.{{fileExtension}}
│   ├── utils/
│   │   ├── database.{{fileExtension}}
│   │   ├── jwt.{{fileExtension}}
│   │   ├── response.{{fileExtension}}
│   │   └── logger.{{fileExtension}}
│   ├── models/
│   │   ├── User.{{fileExtension}}
│   │   ├── Session.{{fileExtension}}
│   │   └── ApiKey.{{fileExtension}}
│   └── types/
│       ├── api.{{fileExtension}}
│       ├── database.{{fileExtension}}
│       └── events.{{fileExtension}}
├── infrastructure/             # Infrastructure as code
│   ├── serverless.yml         # Serverless Framework config
│   ├── cloudformation/        # AWS CloudFormation templates
│   ├── terraform/             # Terraform configurations
│   └── docker/                # Container configurations
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── mocks/
├── docs/                      # Documentation
│   ├── api.md
│   ├── deployment.md
│   └── monitoring.md
├── scripts/                   # Build and deployment scripts
│   ├── deploy.sh
│   ├── test.sh
│   └── package.sh
├── .env.example
├── package.json
├── serverless.yml
├── tsconfig.json              # TypeScript config (if applicable)
└── README.md
```

### 2. Serverless Framework Configuration

#### Main Configuration (serverless.yml)
```yaml
service: {{projectName}}-serverless
frameworkVersion: '3'

provider:
  name: {{cloudProvider}}
  {{#isAWS}}
  runtime: {{runtime}}
  region: ${opt:region, 'us-east-1'}
  stage: ${opt:stage, 'dev'}
  memorySize: 512
  timeout: 30
  
  environment:
    STAGE: ${self:provider.stage}
    DB_HOST: ${env:DB_HOST}
    DB_NAME: ${env:DB_NAME}
    JWT_SECRET: ${env:JWT_SECRET}
    CORS_ORIGIN: ${env:CORS_ORIGIN}
  
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:service}-${self:provider.stage}-*"
        - Effect: Allow
          Action:
            - s3:GetObject
            - s3:PutObject
            - s3:DeleteObject
          Resource:
            - "arn:aws:s3:::${self:service}-${self:provider.stage}-uploads/*"
        - Effect: Allow
          Action:
            - ses:SendEmail
            - ses:SendRawEmail
          Resource: "*"
  {{/isAWS}}
  
  {{#isVercel}}
  name: vercel
  runtime: {{runtime}}
  {{/isVercel}}
  
  {{#isNetlify}}
  name: netlify
  runtime: {{runtime}}
  {{/isNetlify}}

plugins:
  - serverless-esbuild
  - serverless-offline
  - serverless-dotenv-plugin
  - serverless-plugin-warmup

custom:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    exclude: ['aws-sdk']
    target: 'node18'
    platform: 'node'
    concurrency: 10
  
  warmup:
    enabled: true
    prewarm: true
    concurrency: 5
    
  dotenv:
    exclude:
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY

functions:
  # Authentication functions
  auth-login:
    handler: functions/auth/login/handler.main
    events:
      - http:
          path: /auth/login
          method: post
          cors: true
    environment:
      FUNCTION_NAME: auth-login

  auth-register:
    handler: functions/auth/register/handler.main
    events:
      - http:
          path: /auth/register
          method: post
          cors: true

  # User management functions
  get-user:
    handler: functions/users/get-user/handler.main
    events:
      - http:
          path: /users/{id}
          method: get
          cors: true
          authorizer:
            name: jwt-authorizer
            type: request

  list-users:
    handler: functions/users/list-users/handler.main
    events:
      - http:
          path: /users
          method: get
          cors: true
          authorizer:
            name: jwt-authorizer
            type: request

  # Utility functions
  webhook-handler:
    handler: functions/api/webhook/handler.main
    events:
      - http:
          path: /webhook/{service}
          method: post
          cors: true

  # Background jobs
  email-sender:
    handler: functions/jobs/email-sender/handler.main
    events:
      - sqs:
          arn:
            Fn::GetAtt: [EmailQueue, Arn]
          batchSize: 10

  # Custom authorizer
  jwt-authorizer:
    handler: shared/middleware/auth.authorize

resources:
  Resources:
    # DynamoDB Tables
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-${self:provider.stage}-users
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
          - AttributeName: email
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        GlobalSecondaryIndexes:
          - IndexName: email-index
            KeySchema:
              - AttributeName: email
                KeyType: HASH
            Projection:
              ProjectionType: ALL
        BillingMode: PAY_PER_REQUEST

    # S3 Bucket for file uploads
    UploadsBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-${self:provider.stage}-uploads
        CorsConfiguration:
          CorsRules:
            - AllowedHeaders: ['*']
              AllowedMethods: [GET, PUT, POST, DELETE, HEAD]
              AllowedOrigins: ['*']

    # SQS Queue for background jobs
    EmailQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:service}-${self:provider.stage}-email-queue
        VisibilityTimeoutSeconds: 300
        MessageRetentionPeriod: 1209600
```

### 3. Function Implementation Examples

#### Authentication Function (functions/auth/login/handler.js)
```javascript
{{#isNodeJS}}
import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { response, errorResponse } from '../../../shared/utils/response.js';
import { validateInput } from '../../../shared/utils/validation.js';
import { logger } from '../../../shared/utils/logger.js';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const main = async (event, context) => {
  const correlationId = context.awsRequestId;
  logger.info('Login attempt started', { correlationId });

  try {
    // Validate input
    const body = JSON.parse(event.body || '{}');
    const { email, password } = validateInput(body, loginSchema);

    // Find user by email
    const getUserCommand = new QueryCommand({
      TableName: `${process.env.SERVICE_NAME}-${process.env.STAGE}-users`,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
    });

    const userResult = await docClient.send(getUserCommand);
    const user = userResult.Items?.[0];

    if (!user) {
      logger.warn('Login failed: User not found', { email, correlationId });
      return errorResponse(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password', { email, correlationId });
      return errorResponse(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login failed: Account inactive', { email, correlationId });
      return errorResponse(403, 'Account is inactive');
    }

    // Generate JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iss: process.env.SERVICE_NAME,
      aud: process.env.JWT_AUDIENCE || 'api',
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });

    // Update last login timestamp
    await docClient.send(new UpdateItemCommand({
      TableName: `${process.env.SERVICE_NAME}-${process.env.STAGE}-users`,
      Key: { id: user.id },
      UpdateExpression: 'SET lastLoginAt = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString(),
      },
    }));

    // Prepare response data
    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      expiresIn: 86400, // 24 hours in seconds
    };

    logger.info('Login successful', { 
      userId: user.id, 
      email: user.email, 
      correlationId 
    });

    return response(200, responseData);

  } catch (error) {
    logger.error('Login error', { 
      error: error.message, 
      stack: error.stack, 
      correlationId 
    });

    if (error.name === 'ValidationError') {
      return errorResponse(400, 'Invalid input', error.details);
    }

    return errorResponse(500, 'Internal server error');
  }
};
{{/isNodeJS}}

{{#isPython}}
import json
import os
import bcrypt
import jwt
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ['AWS_REGION'])
users_table = dynamodb.Table(f"{os.environ['SERVICE_NAME']}-{os.environ['STAGE']}-users")

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle user login requests
    """
    correlation_id = context.aws_request_id
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')
        
        # Validate input
        if not email or not password:
            return error_response(400, 'Email and password are required')
        
        # Find user by email
        try:
            response = users_table.query(
                IndexName='email-index',
                KeyConditionExpression='email = :email',
                ExpressionAttributeValues={':email': email}
            )
            
            users = response.get('Items', [])
            if not users:
                return error_response(401, 'Invalid credentials')
            
            user = users[0]
            
        except ClientError as e:
            print(f"DynamoDB error: {e}")
            return error_response(500, 'Database error')
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return error_response(401, 'Invalid credentials')
        
        # Check if user is active
        if not user.get('isActive', True):
            return error_response(403, 'Account is inactive')
        
        # Generate JWT token
        payload = {
            'sub': user['id'],
            'email': user['email'],
            'role': user['role'],
            'iss': os.environ['SERVICE_NAME'],
            'aud': os.environ.get('JWT_AUDIENCE', 'api'),
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow(),
        }
        
        token = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')
        
        # Update last login timestamp
        try:
            users_table.update_item(
                Key={'id': user['id']},
                UpdateExpression='SET lastLoginAt = :timestamp',
                ExpressionAttributeValues={
                    ':timestamp': datetime.utcnow().isoformat()
                }
            )
        except ClientError as e:
            print(f"Failed to update last login: {e}")
        
        # Prepare response
        response_data = {
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user.get('name'),
                'role': user['role'],
                'avatar': user.get('avatar'),
            },
            'expiresIn': 86400,  # 24 hours
        }
        
        return success_response(response_data)
        
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        print(f"Unexpected error: {e}")
        return error_response(500, 'Internal server error')

def success_response(data: Any) -> Dict[str, Any]:
    """Return a successful API response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        'body': json.dumps({
            'success': True,
            'data': data,
            'timestamp': datetime.utcnow().isoformat(),
        })
    }

def error_response(status_code: int, message: str, details: Any = None) -> Dict[str, Any]:
    """Return an error API response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        'body': json.dumps({
            'success': False,
            'error': {
                'message': message,
                'details': details,
            },
            'timestamp': datetime.utcnow().isoformat(),
        })
    }
{{/isPython}}
```

### 4. Shared Utilities

#### Response Helper (shared/utils/response.js)
```javascript
export const response = (statusCode, data, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
    body: JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
  };
};

export const errorResponse = (statusCode, message, details = null) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify({
      success: false,
      error: {
        message,
        details,
        code: statusCode,
      },
      timestamp: new Date().toISOString(),
    }),
  };
};

export const redirectResponse = (location, statusCode = 302) => {
  return {
    statusCode,
    headers: {
      Location: location,
    },
    body: '',
  };
};
```

#### JWT Authorizer (shared/middleware/auth.js)
```javascript
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authorize = async (event, context) => {
  const token = extractToken(event);
  
  if (!token) {
    logger.warn('Authorization failed: No token provided');
    throw new Error('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate policy
    const policy = generatePolicy(decoded.sub, 'Allow', event.methodArn);
    
    // Add user info to context
    policy.context = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    logger.info('Authorization successful', { userId: decoded.sub });
    return policy;
    
  } catch (error) {
    logger.warn('Authorization failed: Invalid token', { error: error.message });
    throw new Error('Unauthorized');
  }
};

function extractToken(event) {
  // Check Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check query parameter
  if (event.queryStringParameters && event.queryStringParameters.token) {
    return event.queryStringParameters.token;
  }
  
  return null;
}

function generatePolicy(principalId, effect, resource) {
  const authResponse = {
    principalId,
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  return authResponse;
}
```

### 5. Background Jobs

#### Email Sender Function (functions/jobs/email-sender/handler.js)
```javascript
import { SQSHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../../../shared/utils/logger.js';

const sesClient = new SESClient({ region: process.env.AWS_REGION });

export const main = async (event) => {
  const records = event.Records;
  
  for (const record of records) {
    try {
      const messageBody = JSON.parse(record.body);
      await sendEmail(messageBody);
      
      logger.info('Email sent successfully', { 
        messageId: record.messageId,
        recipient: messageBody.to 
      });
      
    } catch (error) {
      logger.error('Failed to send email', {
        messageId: record.messageId,
        error: error.message,
        body: record.body,
      });
      
      // Re-throw to trigger DLQ if configured
      throw error;
    }
  }
};

async function sendEmail(emailData) {
  const { to, subject, htmlBody, textBody, from } = emailData;
  
  const params = {
    Source: from || process.env.DEFAULT_FROM_EMAIL,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  return await sesClient.send(command);
}
```

### 6. Testing Configuration

#### Jest Test Setup (tests/setup.js)
```javascript
import { jest } from '@jest/globals';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
  QueryCommand: jest.fn(),
  PutCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

// Mock environment variables
process.env.SERVICE_NAME = 'test-service';
process.env.STAGE = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.AWS_REGION = 'us-east-1';

// Global test utilities
global.createMockEvent = (body, headers = {}, pathParameters = {}) => ({
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  pathParameters,
  queryStringParameters: {},
  requestContext: {
    requestId: 'test-request-id',
  },
});

global.createMockContext = (functionName = 'test-function') => ({
  functionName,
  awsRequestId: 'test-request-id',
  getRemainingTimeInMillis: () => 30000,
});
```

#### Unit Test Example (tests/unit/auth/login.test.js)
```javascript
import { jest } from '@jest/globals';
import { main } from '../../../functions/auth/login/handler.js';

describe('Auth Login Function', () => {
  let mockDocClient;

  beforeEach(() => {
    mockDocClient = {
      send: jest.fn(),
    };
    
    jest.clearAllMocks();
  });

  test('should return 400 for invalid input', async () => {
    const event = createMockEvent({ email: 'invalid-email' });
    const context = createMockContext();

    const result = await main(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).success).toBe(false);
  });

  test('should return 401 for non-existent user', async () => {
    mockDocClient.send.mockResolvedValue({ Items: [] });

    const event = createMockEvent({
      email: 'test@example.com',
      password: 'password123',
    });
    const context = createMockContext();

    const result = await main(event, context);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).error.message).toBe('Invalid credentials');
  });

  test('should return token for valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: '$2a$10$hashedpassword',
      isActive: true,
      role: 'user',
    };

    mockDocClient.send.mockResolvedValue({ Items: [mockUser] });

    const event = createMockEvent({
      email: 'test@example.com',
      password: 'password123',
    });
    const context = createMockContext();

    const result = await main(event, context);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('test@example.com');
  });
});
```

### 7. Deployment Scripts

#### Deployment Script (scripts/deploy.sh)
```bash
#!/bin/bash
set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Deploying to $STAGE environment in $REGION region..."

# Load environment variables
if [ -f ".env.$STAGE" ]; then
  export $(cat .env.$STAGE | grep -v ^# | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Build functions
echo "🔨 Building functions..."
npm run build

# Deploy with Serverless Framework
echo "☁️ Deploying to AWS..."
npx serverless deploy \
  --stage $STAGE \
  --region $REGION \
  --verbose

# Run smoke tests
echo "✅ Running smoke tests..."
npm run test:smoke -- --stage $STAGE

echo "🎉 Deployment completed successfully!"
echo "API Gateway URL: $(npx serverless info --stage $STAGE --verbose | grep 'https://' | head -1 | awk '{print $3}')"
```

## Success Criteria
The generated serverless functions should:
1. ✅ Support multiple cloud providers and runtimes
2. ✅ Include comprehensive authentication and authorization
3. ✅ Provide scalable event-driven architecture
4. ✅ Include proper error handling and logging
5. ✅ Support background job processing
6. ✅ Include infrastructure as code configuration
7. ✅ Be production-ready with monitoring and testing

## Additional Notes
- Follow serverless best practices for cold start optimization
- Implement proper security measures and IAM policies
- Include comprehensive monitoring and alerting
- Support local development with serverless-offline
- Implement proper database connection pooling

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*