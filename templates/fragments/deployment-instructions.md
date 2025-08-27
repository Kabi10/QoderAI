---
fragment: "deployment-instructions"
metadata:
  category: "deployment"
  author: "Template System"
---

## Deployment Instructions

### Environment Setup
```bash
# Create production environment file
cp .env.example .env.production

# Configure production variables
NODE_ENV=production
PORT=8080
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
```

### Build Process
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Run tests
npm run test:production
```

### Container Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
```

### Health Checks
```javascript
// health.js
export const healthCheck = async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };

  res.status(200).json(health);
};
```