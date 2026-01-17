# Base build stage
FROM node:18-alpine AS base

WORKDIR /app

# Frontend build stage
FROM base AS frontend-build

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend build stage
FROM base AS backend-build

COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build
RUN npx prisma generate

# Production image
FROM node:18-alpine

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy frontend build
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend files
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/package*.json ./

EXPOSE 80 3001
