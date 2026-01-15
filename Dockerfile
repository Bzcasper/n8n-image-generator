# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# SECURITY: Environment variables should be passed at runtime using:
# - Docker: docker run -e VAR_NAME=value
# - Docker Compose: environment: section in docker-compose.yml
# - For production, consider Docker secrets or a secrets management service
# (e.g., AWS Secrets Manager, HashiCorp Vault)
# NEVER include .env files in Docker images as they bake secrets into the image

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]