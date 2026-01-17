# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build frontend
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-build

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build backend
RUN npm run build

# Production stage for frontend
FROM nginx:alpine AS frontend

# Copy built frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Production stage for backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy backend dependencies and built code
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/package*.json ./

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/server.js"]
