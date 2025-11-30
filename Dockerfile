# Dockerfile for Smart Learning Path Generator
# Multi-stage build for production

# Stage 1: Build React app
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build and run server
FROM node:18-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

# Copy server source
COPY server/ ./

# Copy built React app
COPY --from=client-builder /app/client/build ./public

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "index.js"]

