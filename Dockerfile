# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Copy necessary files
COPY .env.production ./
COPY server/src/database/migrations ./server/database/migrations

# Create non-root user
RUN addgroup -S remag && \
    adduser -S remag -G remag

# Set ownership
RUN chown -R remag:remag /app

# Switch to non-root user
USER remag

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server/dist/index.js"]
