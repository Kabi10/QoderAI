---
mixin: "authentication"
insertAt: "### 3\\. Core Features"
metadata:
  category: "security"
  complexity: "intermediate"
  author: "Template System"
---

## Authentication & Authorization

### Authentication Strategy
{{#hasJWT}}
#### JWT-based Authentication
- Stateless authentication using JSON Web Tokens
- Secure token storage and refresh mechanisms
- Role-based access control (RBAC)

```javascript
// auth/jwt.js
import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```
{{/hasJWT}}

{{#hasOAuth}}
#### OAuth 2.0 Integration
- Support for Google, GitHub, and other OAuth providers
- Secure OAuth flow implementation
- User profile data integration

```javascript
// auth/oauth.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Handle OAuth callback
  return done(null, profile);
}));
```
{{/hasOAuth}}

### Authorization Middleware
```javascript
// middleware/auth.js
export const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### User Authentication Routes
```javascript
// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../auth/jwt.js';

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });
  
  const token = generateToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
```

### Frontend Authentication
{{#techStack}}
{{#contains . "React"}}
#### React Authentication Context
```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user
      verifyAndSetUser(token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```
{{/contains}}
{{/techStack}}

### Security Best Practices
1. **Password Security**
   - Use bcrypt with minimum 12 salt rounds
   - Implement password complexity requirements
   - Consider password breach checking

2. **Token Security**
   - Use secure, httpOnly cookies when possible
   - Implement token refresh mechanisms
   - Set appropriate token expiration times

3. **Input Validation**
   - Validate all authentication inputs
   - Implement rate limiting for auth endpoints
   - Use CSRF protection

4. **Session Management**
   - Implement proper session invalidation
   - Track active sessions
   - Provide logout from all devices functionality