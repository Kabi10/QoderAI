# Next.js Full-Stack Application - AI Generation Prompt

## Project Overview
**Category:** Modern Frontend  
**Project Name:** {{projectName}}  
**Rendering Strategy:** {{renderingStrategy}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Next.js Features
- {{#hasSSR}}Server-Side Rendering for dynamic content{{/hasSSR}}
- {{#hasSSG}}Static Site Generation for performance{{/hasSSG}}
- {{#hasISR}}Incremental Static Regeneration{{/hasISR}}
- {{#hasAPIRoutes}}Built-in API routes for backend functionality{{/hasAPIRoutes}}
- {{#hasMiddleware}}Edge middleware for request processing{{/hasMiddleware}}
- {{#hasAuthentication}}Authentication with NextAuth.js{{/hasAuthentication}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete Next.js application with the following structure:
```
{{projectName}}/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/             # Route groups
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   └── api/                # API routes
│   │       ├── auth/
│   │       ├── users/
│   │       └── webhook/
│   ├── components/             # Reusable components
│   │   ├── ui/                # UI primitives
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── providers/         # Context providers
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── constants.ts
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # Global styles and themes
│   └── middleware.ts          # Edge middleware
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── prisma/                    # Database schema (if using Prisma)
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── api/
├── docs/
│   ├── deployment.md
│   ├── development.md
│   └── api.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### 2. Core Application Setup

#### Root Layout (app/layout.tsx)
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: '{{projectName}}',
    template: '%s | {{projectName}}'
  },
  description: 'A modern Next.js application built with TypeScript and Tailwind CSS',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://{{projectName}}.com',
    title: '{{projectName}}',
    description: 'A modern Next.js application',
    siteName: '{{projectName}}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '{{projectName}}',
    description: 'A modern Next.js application',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

#### Main Page (app/page.tsx)
```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Code,
      title: 'TypeScript',
      description: 'Full type safety across the application',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Optimized with SSG, SSR, and ISR',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Built-in security best practices',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6 mb-16">
        <Badge variant="outline" className="mb-4">
          Next.js 14 • TypeScript • Tailwind CSS
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{projectName}}
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern, full-stack Next.js application with TypeScript, 
          Tailwind CSS, and all the best practices built-in.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">View Docs</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 3. API Routes Implementation

#### User API Route (app/api/users/route.ts)
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const search = searchParams.get('search') ?? '';

    // Database query
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const json = await request.json();
    const body = createUserSchema.parse(json);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Authentication Setup

#### Auth Configuration (lib/auth.ts)
```tsx
{{#hasAuthentication}}
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
{{/hasAuthentication}}
```

### 5. Database Setup

#### Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### 6. UI Components with Tailwind CSS

#### Button Component (components/ui/button.tsx)
```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 7. Middleware Configuration

#### Edge Middleware (middleware.ts)
```tsx
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect to login if accessing protected routes without authentication
    if (pathname.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Redirect to dashboard if accessing auth pages while authenticated
    if (pathname.startsWith('/auth') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 8. Performance Optimization

#### Next.js Configuration (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['prisma'],
  },
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  {{#hasSSG}}
  async generateStaticParams() {
    // Generate static paths for SSG
    return [
      { slug: 'about' },
      { slug: 'contact' },
      { slug: 'privacy' },
    ];
  },
  {{/hasSSG}}
};

module.exports = nextConfig;
```

## Success Criteria
The generated Next.js application should:
1. ✅ Support both SSR and SSG rendering strategies
2. ✅ Include comprehensive authentication system
3. ✅ Provide type-safe API routes with validation
4. ✅ Include responsive UI with Tailwind CSS
5. ✅ Support database integration with Prisma
6. ✅ Include proper SEO optimization
7. ✅ Be ready for deployment to {{deploymentTarget}}

## Additional Notes
- Follow Next.js 13+ App Router patterns
- Implement proper error boundaries and loading states
- Include comprehensive TypeScript types
- Use React Server Components where appropriate
- Implement proper caching strategies

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*