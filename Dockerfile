# Multi-stage build for Node.js application
FROM node:22-slim AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY gs-client-app/package*.json ./gs-client-app/
COPY gs-client-server/package*.json ./gs-client-server/

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM node:22-slim AS build

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY gs-client-app/package*.json ./gs-client-app/
COPY gs-client-server/package*.json ./gs-client-server/

# Clean npm cache and install dependencies
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN rm -rf gs-client-app/node_modules gs-client-app/package-lock.json
RUN rm -rf gs-client-server/node_modules gs-client-server/package-lock.json

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY gs-client-app/package*.json ./gs-client-app/
COPY gs-client-server/package*.json ./gs-client-server/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "run", "start:https"]
