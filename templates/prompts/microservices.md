# Microservices Architecture - AI Generation Prompt

## Project Overview
**Category:** Cloud & DevOps  
**Project Name:** {{projectName}}  
**Architecture Pattern:** {{architecturePattern}}  
**Communication Pattern:** {{communicationPattern}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Microservices Components
- {{#hasApiGateway}}API Gateway for request routing and authentication{{/hasApiGateway}}
- {{#hasServiceDiscovery}}Service discovery and registration mechanism{{/hasServiceDiscovery}}
- {{#hasLoadBalancing}}Load balancing and traffic distribution{{/hasLoadBalancing}}
- {{#hasEventDriven}}Event-driven communication and messaging{{/hasEventDriven}}
- {{#hasObservability}}Distributed tracing and monitoring{{/hasObservability}}
- {{#hasDataManagement}}Database per service pattern{{/hasDataManagement}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete microservices architecture with the following structure:
```
{{projectName}}-microservices/
├── services/                   # Individual microservices
│   ├── user-service/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── order-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── inventory-service/
├── shared/                     # Shared libraries and utilities
│   ├── libs/
│   │   ├── common/
│   │   ├── auth/
│   │   └── events/
│   └── types/
├── infrastructure/             # Infrastructure as code
│   ├── kubernetes/
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   └── configmaps/
│   ├── docker-compose/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   └── terraform/
├── api-gateway/                # API Gateway configuration
│   ├── kong/
│   ├── envoy/
│   └── nginx/
├── monitoring/                 # Observability stack
│   ├── prometheus/
│   ├── grafana/
│   ├── jaeger/
│   └── elk/
├── scripts/                    # Automation scripts
│   ├── build-all.sh
│   ├── deploy-all.sh
│   ├── test-all.sh
│   └── migrate-all.sh
└── docs/
    ├── architecture.md
    ├── api-documentation/
    └── deployment-guide.md
```

### 2. Core Service Template

#### Service Structure (Example: User Service)
```javascript
// src/app.js
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from '@{{projectName}}/common';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const logger = new Logger('UserService');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'user-service'
  });
});

const server = createServer(app);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
```

#### Database Configuration
```javascript
// src/config/database.js
import { Sequelize } from 'sequelize';
import { Logger } from '@{{projectName}}/common';

const logger = new Logger('Database');

const sequelize = new Sequelize({
  dialect: 'postgresql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'user_service',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /ConnectionError/,
      /ConnectionRefusedError/,
      /ConnectionTimedOutError/,
      /TimeoutError/,
    ],
    max: 3
  }
});

export default sequelize;
```

### 3. Service Communication

#### Event-Driven Communication
```javascript
// shared/libs/events/EventBus.js
import { EventEmitter } from 'events';
import { Logger } from '@{{projectName}}/common';

export class EventBus extends EventEmitter {
  constructor() {
    super();
    this.logger = new Logger('EventBus');
  }

  async publishEvent(eventType, payload, metadata = {}) {
    const event = {
      id: generateUUID(),
      type: eventType,
      payload,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME
      }
    };

    this.logger.info(`Publishing event: ${eventType}`, { eventId: event.id });
    
    try {
      // Publish to message broker (Redis, RabbitMQ, Kafka)
      await this.messageQueue.publish(eventType, event);
      this.emit('event:published', event);
    } catch (error) {
      this.logger.error('Failed to publish event', error);
      throw error;
    }
  }

  async subscribeToEvent(eventType, handler) {
    this.logger.info(`Subscribing to event: ${eventType}`);
    
    await this.messageQueue.subscribe(eventType, async (event) => {
      try {
        await handler(event);
        this.emit('event:processed', event);
      } catch (error) {
        this.logger.error(`Error processing event ${event.id}`, error);
        // Implement retry logic or dead letter queue
        await this.handleFailedEvent(event, error);
      }
    });
  }
}
```

#### HTTP Service Communication
```javascript
// shared/libs/common/ServiceClient.js
import axios from 'axios';
import CircuitBreaker from 'opossum';
import { Logger } from './Logger.js';

export class ServiceClient {
  constructor(serviceName, baseURL) {
    this.serviceName = serviceName;
    this.baseURL = baseURL;
    this.logger = new Logger(`ServiceClient:${serviceName}`);
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `{{projectName}}-service-client`
      }
    });

    // Setup circuit breaker
    this.circuitBreaker = new CircuitBreaker(this.makeRequest.bind(this), {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    this.setupInterceptors();
    this.setupCircuitBreakerEvents();
  }

  setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Request failed to ${this.serviceName}`, {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async makeRequest(config) {
    return await this.client(config);
  }

  async get(path, config = {}) {
    return this.circuitBreaker.fire({ method: 'GET', url: path, ...config });
  }

  async post(path, data, config = {}) {
    return this.circuitBreaker.fire({ 
      method: 'POST', 
      url: path, 
      data, 
      ...config 
    });
  }
}
```

### 4. API Gateway Configuration

#### Kong API Gateway
```yaml
# api-gateway/kong/kong.yml
_format_version: "3.0"

services:
  - name: user-service
    url: http://user-service:3001
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: cors
        config:
          origins: ["*"]
          methods: ["GET", "POST", "PUT", "DELETE"]
      - name: jwt
        config:
          secret_is_base64: false

  - name: order-service
    url: http://order-service:3002
    plugins:
      - name: rate-limiting
        config:
          minute: 200
          hour: 2000

routes:
  - name: users-route
    service: user-service
    paths:
      - /api/v1/users
    strip_path: false

  - name: orders-route
    service: order-service
    paths:
      - /api/v1/orders
    strip_path: false

plugins:
  - name: prometheus
    config:
      per_consumer: true
  - name: request-id
    config:
      header_name: X-Request-ID
```

### 5. Container Orchestration

#### Kubernetes Deployment
```yaml
# infrastructure/kubernetes/deployments/user-service.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: {{projectName}}
  labels:
    app: user-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: {{dockerRegistry}}/user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: db-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: {{projectName}}
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

#### Docker Compose for Development
```yaml
# infrastructure/docker-compose/docker-compose.yml
version: '3.8'

services:
  # API Gateway
  kong:
    image: kong:3.4
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    volumes:
      - ../api-gateway/kong:/kong/declarative
    ports:
      - "8000:8000"
      - "8001:8001"

  # Services
  user-service:
    build:
      context: ../../services/user-service
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DB_HOST=user-db
      - DB_PASSWORD=password
      - REDIS_URL=redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - user-db
      - redis

  order-service:
    build:
      context: ../../services/order-service
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DB_HOST=order-db
      - DB_PASSWORD=password
      - REDIS_URL=redis://redis:6379
    ports:
      - "3002:3002"
    depends_on:
      - order-db
      - redis

  # Databases
  user-db:
    image: postgres:15
    environment:
      POSTGRES_DB: user_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - user_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  order-db:
    image: postgres:15
    environment:
      POSTGRES_DB: order_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - order_db_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  # Message Queue
  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ../monitoring/prometheus:/etc/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  user_db_data:
  order_db_data:
  redis_data:
  grafana_data:
```

### 6. Observability and Monitoring

#### Distributed Tracing
```javascript
// shared/libs/common/Tracing.js
import { NodeTracerProvider } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

export function initializeTracing(serviceName) {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
    }),
  });

  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
  provider.register();

  return provider;
}
```

#### Health Check Implementation
```javascript
// shared/libs/common/HealthCheck.js
export class HealthCheck {
  constructor() {
    this.checks = new Map();
  }

  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  async runChecks() {
    const results = {};
    let allHealthy = true;

    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results[name] = {
          status: 'healthy',
          ...result
        };
      } catch (error) {
        allHealthy = false;
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: results
    };
  }
}
```

## Success Criteria
The generated microservices architecture should:
1. ✅ Support independent service deployment and scaling
2. ✅ Include comprehensive inter-service communication
3. ✅ Provide distributed tracing and monitoring
4. ✅ Implement circuit breakers and fault tolerance
5. ✅ Include API gateway for centralized routing
6. ✅ Support event-driven architecture patterns
7. ✅ Include complete infrastructure automation

## Additional Notes
- Follow the 12-factor app methodology
- Implement proper service boundaries and data ownership
- Include comprehensive testing strategies
- Support both synchronous and asynchronous communication
- Implement proper security and authentication across services

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*