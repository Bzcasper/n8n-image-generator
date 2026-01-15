#!/bin/bash

# Production Deployment Script for SplashTool Backend

echo "🚀 Deploying SplashTool Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗃️ Running database migrations..."
npx prisma db push

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Backend deployment complete!"
echo "🚀 Start with: npm start"