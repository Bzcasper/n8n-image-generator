# AGENTS.md

This document provides strict guidelines for AI agents working in this repository.

## Build, Lint, and Test Commands

### Frontend (React + TypeScript + Vite)
```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend (Fastify + TypeScript)
```bash
cd backend
npm run dev              # Start development server (localhost:3001)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run all tests (Vitest)
npm run test -- --run    # Run tests once without watch mode
npm run test -- <file>   # Run specific test file (e.g., npm run test -- auth.test.ts)

# Database commands
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio
```

## Code Style Guidelines

### TypeScript Configuration

**Frontend (Vite + React):**
- Strict mode enabled in tsconfig.app.json
- ES2020 target, ESNext module resolution
- JSX: react-jsx, bundler module resolution
- noUnusedLocals: true, noUnusedParameters: true, noFallthroughCasesInSwitch: true

**Backend (Fastify):**
- Strict mode enabled
- ES2022 target, node module resolution
- Path aliases: @/* for src imports
- outDir: ./dist, rootDir: ./src

### Type Definitions

**Interfaces (object shapes):**
```typescript
interface HeaderProps {
  onBackToLanding?: () => void;
}
```

**Type Aliases (unions/primitives):**
```typescript
type Status = 'active' | 'inactive';
```

**Zod inferred types:**
```typescript
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Module extensions:**
```typescript
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}
```

### Import Style (STRICT)

```typescript
// 1. External dependencies (sorted alphabetically)
import React, { useState, useCallback } from 'react';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// 2. Internal library imports (sorted alphabetically)
import { hashPassword, verifyPassword } from '../utils/auth.js';
import { authClient } from '../lib/auth';

// 3. Relative imports (sorted alphabetically)
import { Header } from './Header';
import { GenerationForm } from './GenerationForm';
import type { GenerationParams } from '../types';
```

**Extension rules:**
- Backend: MUST use `.js` extension (ES modules)
- Frontend: Omit extensions (Vite handles them)

**Export rules:**
- Components: `export default ComponentName;`
- Utilities/Route functions: `export const functionName = ...` or `export async function`
- Types: `export interface ...` or `export type ...`

### Naming Conventions

| Category | Pattern | Examples |
|----------|---------|----------|
| Variables/Functions | camelCase | `hashPassword`, `verifyToken`, `handleImageClick` |
| Components | PascalCase | `Header`, `ImageGenerator`, `GenerationForm` |
| Interfaces/Types | PascalCase | `UserProps`, `JWTPayload`, `GenerationParams` |
| Constants | UPPER_SNAKE_CASE | `JWT_SECRET`, `STYLE_OPTIONS` |
| Enums | UPPER_SNAKE_CASE | `USER`, `ADMIN` (in Prisma) |
| Files (components) | PascalCase | `Header.tsx`, `ImageGenerator.tsx` |
| Files (utilities) | camelCase | `auth.ts`, `validation.ts` |

### React Component Patterns

**Component declaration:**
```typescript
interface ImageGeneratorProps {
  onBackToLanding: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBackToLanding }) => {
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const generateImage = useCallback(async (params: GenerationParams) => {
    setIsLoading(true);
    try {
      // Logic here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return <div>...</div>;
};

export default ImageGenerator;
```

**State patterns:**
- useState with explicit types: `useState<string | null>(null)`
- useCallback for memoized functions with dependencies
- useEffect for side effects with proper cleanup

**Event handlers:**
```typescript
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  // Handler logic
};

const handleSubmit = useCallback((e: React.FormEvent) => {
  e.preventDefault();
  // Submit logic
}, [dependencies]);
```

**Error logging:**
```typescript
try {
  // Operation
} catch (err) {
  console.error('Download failed:', err);  // Use console.error, not console.log
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

### Styling Guidelines

**Tailwind custom colors (MUST USE THESE):**
```css
--navy: #006D88
--mint: #48E5B6
--blue: #00B4FF
```

**Custom fonts:**
- `font-sniglet`: Main display font (400, 800 weights)
- `font-varela`: UI text (Varela Round)
- `font-questrial`: Footer/body text

**Custom animations:**
- `animate-gradient-x`: Gradient background animation
- `animate-float`: Subtle floating effect
- `animate-pulse-glow`: Glowing pulse effect
- `animate-border-draw`: Border drawing animation
- `animate-fade-in-up`: Fade up animation

**Custom utilities:**
- `rounded-20`: 20px border radius
- `rounded-16`: 16px border radius
- `custom-scrollbar`: Custom scrollbar styling

**Styling approach:**
- PREFER className for Tailwind classes
- USE inline styles for dynamic values and complex gradients
- USE `style={{ }}` for values from props or state

```typescript
// Dynamic gradient with inline style
<div
  style={{
    background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
  }}
/>

// Tailwind for static styles
<div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-6" />
```

### Backend Route Patterns

**Route structure:**
```typescript
export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = request.body as any;
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: validation.error.issues
      });
    }
    
    try {
      // Business logic
      reply.code(201).send({ user, accessToken, refreshToken });
    } catch (error) {
      console.error('Registration error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  fastify.get('/protected', {
    preHandler: authenticate,
  }, async (request, reply) => {
    // Protected route logic
  });
}
```

**Prisma query patterns:**
```typescript
// ALWAYS use select to exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    username: true,
    // NEVER select password
  },
});

// Use orderBy for consistent results
const images = await prisma.generatedImage.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
});

// Cascade delete on relations
@@map("users")  // Custom table names
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

### Zod Validation

**Schema definition:**
```typescript
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

**Validation pattern:**
```typescript
const validation = registerSchema.safeParse(body);
if (!validation.success) {
  return reply.code(400).send({
    error: 'Validation failed',
    details: validation.error.issues
  });
}
const { email, password, username } = validation.data;
```

### Security Requirements

**Authentication:**
- JWT access tokens: 15 minutes expiry
- JWT refresh tokens: 7 days expiry
- bcrypt with 12 salt rounds for password hashing

**Environment variables:**
- Frontend: `VITE_*` prefix (accessible to client)
- Backend: Direct access (server-side only)
- NEVER commit `.env` files

**Security headers (Helmet):**
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
  },
}
```

**Rate limiting:**
- 100 requests per minute per IP
- skipOnError: true

### Error Handling

**Backend:**
```typescript
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return reply.code(404).send({ error: 'User not found' });
  }
  reply.send({ user });
} catch (error) {
  console.error('Operation error:', error);  // Contextual error logging
  reply.code(500).send({ error: 'Internal server error' });
}
```

**Frontend:**
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    }
    throw new Error(`Failed to generate image: ${response.statusText}`);
  }
  // Success handling
} catch (err) {
  setError(err instanceof Error ? err.message : 'An unexpected error occurred');
}
```

### Database Schema Rules

**Prisma models:**
- Use `@id @default(cuid())` for primary keys
- Use `@unique` for unique constraints
- Use `@default(now())` and `@updatedAt` for timestamps
- Use `@@map("table_name")` for custom table names
- Use enums in UPPER_SNAKE_CASE

**Example:**
```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  password       String
  role           Role      @default(USER)
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  sessions       Session[]
  generatedImages GeneratedImage[]
  
  @@map("users")
}
```

### Fastify Server Configuration

```typescript
const fastify = Fastify({
  logger: true,
  trustProxy: true,
});

// CORS
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

// Helmet
await fastify.register(helmet, { /* CSP config */ });

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: true,
  keyGenerator: (req) => req.ip,
});

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}));
```

### Formatting Rules

**General:**
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Line length: 120 characters max
- Trailing commas in multi-line objects/arrays

**Object/Array formatting:**
```typescript
const obj = {
  a: 1,
  b: 2,
  c: 3,  // Trailing comma
};

const arr = [
  'one',
  'two',
  'three',  // Trailing comma
];
```

### File Organization

```
frontend/src/
├── components/       # Reusable UI components (PascalCase)
│   ├── Header.tsx
│   ├── ImageGenerator.tsx
│   └── ...
├── pages/            # Route components (PascalCase)
│   ├── home.tsx
│   ├── account.tsx
│   └── auth.tsx
├── lib/              # Utilities, helpers (camelCase)
│   ├── auth.ts
│   └── db.ts
├── types.ts          # Shared type definitions
└── index.css         # Global styles + Tailwind

backend/src/
├── middleware/       # Request middleware
│   └── auth.ts
├── routes/           # API route handlers
│   ├── auth.ts
│   └── users.ts
├── utils/            # Pure functions, utilities
│   ├── auth.ts
│   └── validation.ts
├── server.ts         # Entry point
└── prisma/
    └── schema.prisma  # Database schema
```

## Before Committing

1. Run frontend linter: `npm run lint`
2. Run backend linter: `cd backend && npm run lint`
3. Build frontend: `npm run build`
4. Run backend tests: `cd backend && npm run test`
5. Verify no sensitive data in changes (no .env files, no secrets)
6. Test all modified functionality manually
