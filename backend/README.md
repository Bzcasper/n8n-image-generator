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

### Development Setup

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

### Production Deployment

1. **Environment Setup:**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="your-production-database-url"
   export JWT_SECRET="your-production-jwt-secret"
   export JWT_REFRESH_SECRET="your-production-refresh-secret"
   ```

2. **Deploy using the script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Or manual deployment:**
   ```bash
   npm ci --only=production
   npx prisma generate
   npx prisma db push
   npm run build
   npm start
   ```

### Testing Authentication

```bash
# Test health endpoint
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Access protected route
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials in `.env`:**

### Required Variables

#### Database Configuration

```env
# Database - Neon PostgreSQL
# Get your connection string from: https://console.neon.tech
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require&channel_binding=require"

# Get your API key from: https://console.neon.tech
NEON_API_KEY="your-neon-api-key"
```

**Setting up Neon PostgreSQL:**
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select existing one
3. Copy the connection string to `DATABASE_URL`
4. Go to API Keys section and generate a new key for `NEON_API_KEY`

#### JWT Secrets

```env
# JWT Secrets (generate random strings for production)
# Use: openssl rand -base64 32 to generate secure secrets
JWT_SECRET="your-jwt-secret-key-minimum-32-characters-long"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-different-from-jwt-secret"
```

**Generating secure secrets:**
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

**Security Note:** Never use the example values in production. Always generate unique, random secrets.

#### Server Configuration

```env
PORT=3001
NODE_ENV="development"  # Set to "production" for production
HOST="0.0.0.0"
FRONTEND_URL="http://localhost:5173"  # Update with your production frontend URL
```

### Optional Variables

#### Object Storage (Cloudflare R2)

```env
# Get credentials from: https://dash.cloudflare.com -> R2 -> Create Bucket
R2_BUCKET_NAME="your-bucket-name"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_PUBLIC_URL="https://your-r2-bucket.r2.dev"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_CUSTOM_DOMAIN="https://images.yourdomain.com"
```

**Setting up Cloudflare R2:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 > Create Bucket
3. Create an API Token with R2 permissions
4. Configure your bucket with a custom domain for public access

#### Email Service (Optional)

```env
# For Gmail, use an App Password: https://support.google.com/accounts/answer/185833
EMAIL_SERVICE="gmail"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="YourApp <noreply@yourdomain.com>"
```

**Setting up Gmail for email:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use the generated password for `EMAIL_PASS`

#### Security Settings

```env
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW="1 minute"
LOG_LEVEL="info"  # Options: "error", "warn", "info", "debug"
```

### Security Best Practices

1. **NEVER commit `.env` files** - They are already in `.gitignore`
2. **Use different secrets for each environment** (dev, staging, production)
3. **Rotate secrets regularly** - Every 90 days for production
4. **Use strong, random secrets** - Minimum 32 characters for JWT secrets
5. **Set appropriate `NODE_ENV`** - Always use `production` in production
6. **Limit database access** - Use read-only credentials where possible
7. **Use environment-specific values** - Different `FRONTEND_URL` for each environment

### Regenerating Compromised Credentials

If you suspect your credentials have been compromised (e.g., committed to version control), immediately:

1. **Neon Database:**
   - Go to Neon Console > Your Project > Connection Details
   - Reset the database password
   - Update `DATABASE_URL` with new credentials

2. **Neon API Key:**
   - Go to Neon Console > API Keys
   - Delete the compromised key
   - Generate a new key
   - Update `NEON_API_KEY`

3. **JWT Secrets:**
   - Generate new secrets using `openssl rand -base64 32`
   - Update `JWT_SECRET` and `JWT_REFRESH_SECRET`
   - **Important:** All existing sessions will be invalidated, users will need to re-login

4. **R2 Credentials:**
   - Go to Cloudflare Dashboard > R2 > Manage R2 API Tokens
   - Revoke old tokens
   - Create new tokens
   - Update R2 environment variables

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