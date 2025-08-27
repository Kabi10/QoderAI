---
extends: "application-base"
blocks:
  - header
  - main
  - frontend-specific
metadata:
  category: "web-application"
  complexity: "intermediate"
  author: "Template System"
---

{{> header}}

{{#block main}}
## Web Application Implementation Guide

### 1. Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API services
├── store/               # State management
├── styles/              # CSS/SCSS files
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### 2. Component Development
{{#techStack}}
{{#contains . "React"}}
#### React Components
- Use functional components with hooks
- Implement proper prop validation
- Follow component composition patterns
- Use React.memo for performance optimization

```javascript
import React, { memo } from 'react';

const Component = memo(({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
});

export default Component;
```
{{/contains}}
{{#contains . "Vue"}}
#### Vue Components
- Use Composition API for better TypeScript support
- Implement proper prop validation
- Follow Vue 3 best practices

```vue
<template>
  <div>
    <!-- Component template -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Component logic
</script>
```
{{/contains}}
{{/techStack}}

### 3. State Management
{{#techStack}}
{{#contains . "Redux"}}
#### Redux Toolkit
- Use Redux Toolkit for simplified state management
- Implement proper action creators and reducers
- Use RTK Query for API state management
{{/contains}}
{{#contains . "Zustand"}}
#### Zustand Store
- Implement lightweight state management
- Use store slices for organization
- Implement proper TypeScript types
{{/contains}}
{{/techStack}}

### 4. Routing Configuration
{{#techStack}}
{{#contains . "React"}}
#### React Router
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Add more routes */}
      </Routes>
    </BrowserRouter>
  );
}
```
{{/contains}}
{{/techStack}}

### 5. API Integration
```javascript
// services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};
```
{{/block}}

{{#block frontend-specific}}
## Frontend-Specific Features

### UI/UX Implementation
- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1 AA)
- Modern CSS with Flexbox/Grid
- Component-based styling architecture

### Performance Optimization
- Code splitting and lazy loading
- Image optimization and lazy loading
- Bundle size optimization
- Caching strategies

### Development Tools
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "test": "jest",
    "test:e2e": "cypress run"
  }
}
```

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- Polyfills for missing features
{{/block}}

{{> footer}}