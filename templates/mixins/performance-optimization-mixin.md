---
mixin: "performance-optimization"
insertAt: "## Development Guidelines"
metadata:
  category: "performance"
  complexity: "advanced"
  author: "Template System"
---

## Performance Optimization

### Frontend Performance
{{#techStack}}
{{#contains . "React"}}
#### React Performance Optimizations
- Use React.memo for component memoization
- Implement useMemo and useCallback hooks appropriately
- Use React.lazy for code splitting
- Optimize re-renders with proper dependency arrays

```javascript
// hooks/useOptimizedCallback.js
import { useCallback, useMemo } from 'react';

export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

// components/OptimizedComponent.js
import React, { memo, useMemo } from 'react';

const OptimizedComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
```
{{/contains}}
{{/techStack}}

#### Bundle Optimization
```javascript
// webpack.config.js / vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', 'antd'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

#### Image Optimization
```javascript
// utils/imageOptimization.js
export const optimizeImage = (src, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For Next.js projects
  if (typeof window !== 'undefined' && window.next) {
    return {
      src,
      width,
      height,
      quality,
      format
    };
  }
  
  // For other frameworks, implement image optimization service
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: format
  });
  
  return `${src}?${params.toString()}`;
};

// components/OptimizedImage.js
import React from 'react';

const OptimizedImage = ({ src, alt, width, height, ...props }) => {
  const optimizedSrc = optimizeImage(src, { width, height });
  
  return (
    <picture>
      <source srcSet={optimizedSrc} type="image/webp" />
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        loading="lazy"
        {...props}
      />
    </picture>
  );
};
```

### Backend Performance

#### Database Optimization
```javascript
// models/optimizedQueries.js
export class OptimizedQueries {
  static async getUsersWithPosts(userId) {
    // Use joins instead of N+1 queries
    return await User.findByPk(userId, {
      include: [{
        model: Post,
        attributes: ['id', 'title', 'createdAt']
      }],
      attributes: ['id', 'name', 'email']
    });
  }

  static async getPostsWithPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return await Post.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'name']
      }]
    });
  }
}
```

#### Caching Strategy
```javascript
// middleware/cache.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage in routes
router.get('/api/posts', cacheMiddleware(600), async (req, res) => {
  const posts = await Post.findAll();
  res.json(posts);
});
```

#### Response Compression
```javascript
// middleware/compression.js
import compression from 'compression';

export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});
```

### Performance Monitoring

#### Web Vitals Tracking
```javascript
// utils/performanceMonitoring.js
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
};

const sendToAnalytics = (metric) => {
  // Send to your analytics service
  console.log('Performance metric:', metric);
  
  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      non_interaction: true
    });
  }
};
```

#### Performance Budget
```javascript
// performance-budget.js
export const performanceBudget = {
  // Bundle sizes (in KB)
  javascript: 250,
  css: 50,
  images: 500,
  fonts: 100,
  
  // Performance metrics (in ms)
  firstContentfulPaint: 1500,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  
  // Lighthouse scores
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95
};

// Implement budget checking in CI/CD
export const checkPerformanceBudget = async () => {
  const lighthouse = await import('lighthouse');
  // Run Lighthouse and check against budget
};
```

### Load Testing & Monitoring
```javascript
// scripts/loadTest.js
import autocannon from 'autocannon';

const runLoadTest = async () => {
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 30,
    pipelining: 1
  });
  
  console.log('Load test results:', result);
  
  // Check if performance meets requirements
  if (result.requests.average < 1000) {
    throw new Error('Performance below threshold');
  }
};

// Run load test
runLoadTest().catch(console.error);
```

### Performance Best Practices

1. **Code Splitting**
   - Split code by routes and features
   - Use dynamic imports for large libraries
   - Implement progressive loading

2. **Resource Optimization**
   - Minimize HTTP requests
   - Use CDN for static assets
   - Implement proper caching headers

3. **Database Performance**
   - Use database indexes effectively
   - Implement query optimization
   - Use connection pooling

4. **Monitoring & Alerting**
   - Set up performance monitoring
   - Create performance alerts
   - Regular performance audits