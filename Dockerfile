# Multi-stage build for Node.js application
FROM node:24 AS base

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies first
RUN npm ci

# Stage 1: Build Vite/App
FROM node:24 AS app-build

WORKDIR /app

# Copy app package files
COPY gs-client-app/package*.json ./gs-client-app/
WORKDIR /app/gs-client-app

# Install app dependencies
RUN npm install

# Install rollup native binary to fix build issues
RUN npm install @rollup/rollup-linux-x64-gnu --save-optional

# Completely remove sass-embedded and force pure sass usage
# RUN npm uninstall sass-embedded --save-dev || true
# RUN rm -rf node_modules/sass-embedded || true
# RUN rm -rf node_modules/@quasar/vite-plugin/node_modules/sass-embedded || true

# # Install only pure sass
# RUN npm install sass@^1.93.2 --save-dev

# Set environment variables to force sass usage instead of sass-embedded
# ENV SASS_BINARY_SITE=https://github.com/sass/dart-sass/releases/download/
# ENV SASS_BINARY_NAME=dart-sass-linux-x64-1.69.5.tar.gz
# ENV SASS_USE_EMBEDDED=false
# ENV SASS_EMBEDDED=false
# ENV SASS_IMPLEMENTATION=sass
# ENV SASS_EMBEDDED_DISABLE=true

# Force sass to use pure JS implementation
# RUN npm config set sass_embedded false || true

# Copy app source code
COPY gs-client-app/ ./

# Build the app
RUN npm run build

# Stage 2: Build Express/Server
FROM node:24 AS server-build

WORKDIR /app

# Copy server package files
COPY gs-client-server/package*.json ./gs-client-server/
WORKDIR /app/gs-client-server

# Install server dependencies
RUN npm install

# Copy server source code
COPY gs-client-server/ ./

# Build the server
RUN npm run build

# Stage 3: Final build stage
FROM node:24 AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci

# Copy built app from app-build stage
COPY --from=app-build /app/dist ./dist/client

# Copy built server from server-build stage
COPY --from=server-build /app/dist ./dist/server

# Production stage - Use Alpine for smaller image
FROM node:24-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy root package files
COPY package*.json ./

# Install only production dependencies for root
RUN npm ci --only=production && npm cache clean --force

# Copy server package files and install production dependencies
COPY gs-client-server/package*.json ./gs-client-server/
WORKDIR /app/gs-client-server
RUN npm install --only=production && npm cache clean --force

# Copy built application from build stage
WORKDIR /app
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:https"]
