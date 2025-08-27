# GraphQL API - AI Generation Prompt

## Project Overview
**Category:** Backend & Database  
**Project Name:** {{projectName}}  
**GraphQL Implementation:** {{graphqlImplementation}}  
**Database:** {{database}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### GraphQL Features
- {{#hasTypeSafety}}Type-safe schema definition and resolvers{{/hasTypeSafety}}
- {{#hasSubscriptions}}Real-time subscriptions support{{/hasSubscriptions}}
- {{#hasAuthentication}}JWT-based authentication and authorization{{/hasAuthentication}}
- {{#hasCaching}}Advanced caching strategies{{/hasCaching}}
- {{#hasValidation}}Input validation and sanitization{{/hasValidation}}
- {{#hasErrorHandling}}Comprehensive error handling{{/hasErrorHandling}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete GraphQL API with the following structure:
```
{{projectName}}-graphql-api/
├── src/
│   ├── schema/                 # GraphQL schema definitions
│   │   ├── typeDefs/
│   │   │   ├── user.graphql
│   │   │   ├── post.graphql
│   │   │   ├── comment.graphql
│   │   │   └── index.ts
│   │   ├── resolvers/
│   │   │   ├── user.ts
│   │   │   ├── post.ts
│   │   │   ├── comment.ts
│   │   │   ├── mutation.ts
│   │   │   ├── query.ts
│   │   │   ├── subscription.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── models/                 # Database models
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   └── Comment.ts
│   ├── services/               # Business logic services
│   │   ├── UserService.ts
│   │   ├── PostService.ts
│   │   ├── AuthService.ts
│   │   └── EmailService.ts
│   ├── middleware/             # GraphQL middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   └── logging.ts
│   ├── utils/                  # Utility functions
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   └── errors.ts
│   ├── types/                  # TypeScript types
│   │   ├── generated.ts        # Generated from GraphQL schema
│   │   ├── context.ts
│   │   └── custom.ts
│   ├── config/                 # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── plugins/                # GraphQL plugins
│   │   ├── complexity.ts
│   │   ├── depth.ts
│   │   └── cache.ts
│   ├── server.ts               # Server setup
│   └── app.ts                  # Application entry point
├── prisma/                     # Database schema (if using Prisma)
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/                      # Test files
│   ├── __mocks__/
│   ├── integration/
│   ├── unit/
│   └── setup.ts
├── docs/                       # Documentation
│   ├── schema.md
│   ├── queries.md
│   └── mutations.md
├── scripts/                    # Utility scripts
│   ├── generate-types.ts
│   ├── seed-db.ts
│   └── migrate.ts
├── .env.example
├── codegen.yml                 # GraphQL Code Generator config
├── apollo.config.js            # Apollo Studio config
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### 2. GraphQL Schema Definition

#### User Schema (schema/typeDefs/user.graphql)
```graphql
type User {
  id: ID!
  email: String!
  username: String!
  firstName: String
  lastName: String
  avatar: String
  bio: String
  role: UserRole!
  isActive: Boolean!
  lastLoginAt: DateTime
  posts: [Post!]!
  comments: [Comment!]!
  followers: [User!]!
  following: [User!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

input CreateUserInput {
  email: String!
  username: String!
  password: String!
  firstName: String
  lastName: String
}

input UpdateUserInput {
  username: String
  firstName: String
  lastName: String
  bio: String
  avatar: String
}

input UserFilters {
  role: UserRole
  isActive: Boolean
  search: String
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

extend type Query {
  me: User
  user(id: ID!): User
  users(
    first: Int
    after: String
    filters: UserFilters
  ): UserConnection!
}

extend type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  followUser(userId: ID!): User!
  unfollowUser(userId: ID!): User!
}

extend type Subscription {
  userUpdated(userId: ID!): User!
  userFollowed(userId: ID!): User!
}
```

#### Post Schema (schema/typeDefs/post.graphql)
```graphql
type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String
  slug: String!
  status: PostStatus!
  tags: [String!]!
  author: User!
  comments: [Comment!]!
  likes: [User!]!
  likesCount: Int!
  commentsCount: Int!
  readTime: Int
  featuredImage: String
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

input CreatePostInput {
  title: String!
  content: String!
  excerpt: String
  tags: [String!]
  status: PostStatus = DRAFT
  featuredImage: String
}

input UpdatePostInput {
  title: String
  content: String
  excerpt: String
  tags: [String!]
  status: PostStatus
  featuredImage: String
}

input PostFilters {
  status: PostStatus
  authorId: ID
  tags: [String!]
  search: String
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

extend type Query {
  post(id: ID, slug: String): Post
  posts(
    first: Int
    after: String
    filters: PostFilters
    orderBy: PostOrderBy
  ): PostConnection!
}

extend type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  publishPost(id: ID!): Post!
  likePost(postId: ID!): Post!
  unlikePost(postId: ID!): Post!
}

extend type Subscription {
  postCreated: Post!
  postUpdated(postId: ID!): Post!
  postLiked(postId: ID!): Post!
}

enum PostOrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  UPDATED_AT_ASC
  UPDATED_AT_DESC
  LIKES_COUNT_ASC
  LIKES_COUNT_DESC
}
```

### 3. Resolver Implementation

#### User Resolvers (schema/resolvers/user.ts)
```typescript
import { GraphQLError } from 'graphql';
import { Context } from '../types/context';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { validateInput } from '../utils/validation';
import { requireAuth, requireRole } from '../middleware/auth';

export const userResolvers = {
  Query: {
    me: requireAuth(async (parent, args, context: Context) => {
      return await UserService.findById(context.user.id);
    }),

    user: async (parent, { id }, context: Context) => {
      const user = await UserService.findById(id);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return user;
    },

    users: async (parent, { first = 10, after, filters }, context: Context) => {
      return await UserService.findMany({
        first,
        after,
        filters,
      });
    },
  },

  Mutation: {
    createUser: async (parent, { input }, context: Context) => {
      const validatedInput = validateInput(input, createUserSchema);
      
      const existingUser = await UserService.findByEmail(validatedInput.email);
      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'CONFLICT' }
        });
      }

      const hashedPassword = await AuthService.hashPassword(validatedInput.password);
      return await UserService.create({
        ...validatedInput,
        password: hashedPassword,
      });
    },

    updateUser: requireAuth(async (parent, { id, input }, context: Context) => {
      // Check if user can update this profile
      if (context.user.id !== id && context.user.role !== 'ADMIN') {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      const validatedInput = validateInput(input, updateUserSchema);
      return await UserService.update(id, validatedInput);
    }),

    deleteUser: requireRole('ADMIN')(async (parent, { id }, context: Context) => {
      const deleted = await UserService.delete(id);
      if (!deleted) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return true;
    }),

    followUser: requireAuth(async (parent, { userId }, context: Context) => {
      if (context.user.id === userId) {
        throw new GraphQLError('Cannot follow yourself', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      return await UserService.followUser(context.user.id, userId);
    }),
  },

  User: {
    posts: async (parent, args, context: Context) => {
      return await context.loaders.postsByUserId.load(parent.id);
    },

    comments: async (parent, args, context: Context) => {
      return await context.loaders.commentsByUserId.load(parent.id);
    },

    followers: async (parent, args, context: Context) => {
      return await context.loaders.followersByUserId.load(parent.id);
    },

    following: async (parent, args, context: Context) => {
      return await context.loaders.followingByUserId.load(parent.id);
    },
  },

  Subscription: {
    userUpdated: {
      subscribe: requireAuth((parent, { userId }, context: Context) => {
        return context.pubsub.asyncIterator(`USER_UPDATED_${userId}`);
      }),
    },

    userFollowed: {
      subscribe: requireAuth((parent, { userId }, context: Context) => {
        return context.pubsub.asyncIterator(`USER_FOLLOWED_${userId}`);
      }),
    },
  },
};
```

### 4. Context and Data Loaders

#### Context Setup (types/context.ts)
```typescript
import { Request, Response } from 'express';
import { PubSub } from 'graphql-subscriptions';
import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { User } from '../models/User';
import { createLoaders } from '../utils/dataLoaders';

export interface Context {
  req: Request;
  res: Response;
  prisma: PrismaClient;
  pubsub: PubSub;
  user?: User;
  loaders: {
    userById: DataLoader<string, User>;
    postsByUserId: DataLoader<string, Post[]>;
    commentsByPostId: DataLoader<string, Comment[]>;
    commentsByUserId: DataLoader<string, Comment[]>;
    followersByUserId: DataLoader<string, User[]>;
    followingByUserId: DataLoader<string, User[]>;
  };
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const prisma = new PrismaClient();
  const pubsub = new PubSub();
  
  // Extract user from JWT token
  let user: User | undefined;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      user = await prisma.user.findUnique({
        where: { id: payload.sub as string }
      });
    } catch (error) {
      // Invalid token, user remains undefined
    }
  }

  const loaders = createLoaders(prisma);

  return {
    req,
    res,
    prisma,
    pubsub,
    user,
    loaders,
  };
}
```

#### Data Loaders (utils/dataLoaders.ts)
```typescript
import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  return {
    userById: new DataLoader(async (ids: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: ids as string[] } }
      });
      
      const userMap = new Map(users.map(user => [user.id, user]));
      return ids.map(id => userMap.get(id) || null);
    }),

    postsByUserId: new DataLoader(async (userIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: userIds as string[] } },
        orderBy: { createdAt: 'desc' }
      });
      
      const postsByUser = new Map<string, any[]>();
      posts.forEach(post => {
        const userPosts = postsByUser.get(post.authorId) || [];
        userPosts.push(post);
        postsByUser.set(post.authorId, userPosts);
      });
      
      return userIds.map(userId => postsByUser.get(userId) || []);
    }),

    commentsByPostId: new DataLoader(async (postIds: readonly string[]) => {
      const comments = await prisma.comment.findMany({
        where: { postId: { in: postIds as string[] } },
        orderBy: { createdAt: 'asc' }
      });
      
      const commentsByPost = new Map<string, any[]>();
      comments.forEach(comment => {
        const postComments = commentsByPost.get(comment.postId) || [];
        postComments.push(comment);
        commentsByPost.set(comment.postId, postComments);
      });
      
      return postIds.map(postId => commentsByPost.get(postId) || []);
    }),
  };
}
```

### 5. Server Setup

#### Apollo Server Configuration (server.ts)
```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schema';
import { resolvers } from './schema/resolvers';
import { createContext } from './types/context';
import { formatError } from './utils/errors';
import { complexityPlugin } from './plugins/complexity';
import { depthLimitPlugin } from './plugins/depth';
import { cachePlugin } from './plugins/cache';

export async function createApolloServer() {
  const app = express();
  const httpServer = createServer(app);

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Create context for subscriptions
        return createContext({
          req: ctx.extra.request,
          res: ctx.extra.response,
        });
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      complexityPlugin(),
      depthLimitPlugin(10),
      cachePlugin(),
    ],
    formatError,
    introspection: process.env.NODE_ENV !== 'production',
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    }),
    json({ limit: '10mb' }),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return { app, httpServer, server };
}
```

### 6. Authentication Middleware

#### Auth Middleware (middleware/auth.ts)
```typescript
import { GraphQLError } from 'graphql';
import { Context } from '../types/context';
import { UserRole } from '../types/generated';

export function requireAuth<T extends any[], R>(
  resolver: (parent: any, args: any, context: Context, info: any) => R
) {
  return (parent: any, args: any, context: Context, info: any): R => {
    if (!context.user) {
      throw new GraphQLError('Authentication required', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }
    return resolver(parent, args, context, info);
  };
}

export function requireRole(...roles: UserRole[]) {
  return function <T extends any[], R>(
    resolver: (parent: any, args: any, context: Context, info: any) => R
  ) {
    return requireAuth((parent: any, args: any, context: Context, info: any): R => {
      if (!context.user || !roles.includes(context.user.role)) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: {
            code: 'FORBIDDEN',
            http: { status: 403 },
          },
        });
      }
      return resolver(parent, args, context, info);
    });
  };
}

export function optionalAuth<T extends any[], R>(
  resolver: (parent: any, args: any, context: Context, info: any) => R
) {
  return (parent: any, args: any, context: Context, info: any): R => {
    // User is optional, no error if not authenticated
    return resolver(parent, args, context, info);
  };
}
```

### 7. Caching and Performance

#### Redis Cache Plugin (plugins/cache.ts)
```typescript
import { Plugin } from '@apollo/server';
import Redis from 'ioredis';
import { Context } from '../types/context';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export function cachePlugin(): Plugin<Context> {
  return {
    async requestDidStart() {
      return {
        async willSendResponse(requestContext) {
          const { request, response, contextValue } = requestContext;
          
          // Only cache successful queries
          if (response.body.kind === 'single' && !response.body.singleResult.errors) {
            const cacheKey = generateCacheKey(request.query, request.variables);
            const ttl = getCacheTTL(request.query);
            
            if (ttl > 0) {
              await redis.setex(
                cacheKey,
                ttl,
                JSON.stringify(response.body.singleResult.data)
              );
            }
          }
        },
        
        async didResolveOperation(requestContext) {
          const { request } = requestContext;
          const cacheKey = generateCacheKey(request.query, request.variables);
          
          const cachedResult = await redis.get(cacheKey);
          if (cachedResult) {
            requestContext.response.body = {
              kind: 'single',
              singleResult: {
                data: JSON.parse(cachedResult),
              },
            };
            return; // Skip execution
          }
        },
      };
    },
  };
}

function generateCacheKey(query: string, variables: any): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(query + JSON.stringify(variables))
    .digest('hex');
  return `graphql:${hash}`;
}

function getCacheTTL(query: string): number {
  // Different TTL based on query type
  if (query.includes('users') || query.includes('posts')) {
    return 300; // 5 minutes
  }
  if (query.includes('me')) {
    return 60; // 1 minute
  }
  return 0; // No cache
}
```

## Success Criteria
The generated GraphQL API should:
1. ✅ Provide type-safe schema and resolvers
2. ✅ Include comprehensive authentication and authorization
3. ✅ Support real-time subscriptions
4. ✅ Implement efficient data loading with DataLoader
5. ✅ Include caching and performance optimizations
6. ✅ Provide comprehensive error handling
7. ✅ Include complete API documentation

## Additional Notes
- Follow GraphQL best practices and conventions
- Implement proper pagination with cursor-based approach
- Include comprehensive input validation
- Use DataLoader to prevent N+1 query problems
- Implement proper error handling and logging

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*