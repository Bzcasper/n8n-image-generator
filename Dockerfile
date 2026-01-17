# Base image with Node.js
FROM node:18-alpine AS base

WORKDIR /app

# Build frontend
FROM base AS frontend-build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Build backend
FROM base AS backend-build

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Final multi-arch image that can run either service
FROM node:18-alpine

WORKDIR /app

# Install nginx for frontend serving
RUN apk add --no-cache nginx

# Copy backend build artifacts
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/package*.json ./

# Generate Prisma client
RUN npx prisma generate

# Copy frontend build to nginx location
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose both ports
EXPOSE 80 3001

# Use a startup script to run the appropriate process
RUN echo '#!/bin/sh\n\
if [ "$SERVICE" = "app" ]; then\n\
  exec nginx -g "daemon off;"\n\
elif [ "$SERVICE" = "backend" ]; then\n\
  exec node dist/server.js\n\
fi\n' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
