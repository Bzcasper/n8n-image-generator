# SplashTool Backend API

A comprehensive backend API for the SplashTool AI image generation platform, built with Fastify and TypeScript.

## Features

- **User Authentication** - JWT-based auth with refresh tokens
- **User Management** - Registration, login, profile management
- **Security** - Password hashing, rate limiting, CORS, Helmet
- **Database** - PostgreSQL with Prisma ORM
- **API Validation** - Zod schema validation
- **Image Tracking** - Store user-generated images

## Tech Stack

- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Zod

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secrets
   ```

3. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### User Management
- `GET /api/users/images` - Get user's generated images
- `POST /api/users/images` - Track new generated image

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/splashtool_db"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Tokens:** Short-lived access tokens (15min) + refresh tokens (7 days)
- **Rate Limiting:** 100 requests per minute per IP
- **CORS:** Configured for frontend integration
- **Helmet:** Security headers
- **Input Validation:** Zod schemas for all endpoints

## Project Structure

```
backend/
├── src/
│   ├── middleware/     # Auth middleware
│   ├── routes/        # API route handlers
│   ├── utils/         # Auth utilities, validation
│   └── server.ts      # Main server file
├── prisma/
│   └── schema.prisma  # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

The server runs on `http://localhost:3001` by default. Make sure your frontend is configured to proxy API requests to this URL.

## Deployment

This backend is designed to work with modern deployment platforms like Railway, Render, or Vercel. Make sure to set the environment variables in your deployment platform.