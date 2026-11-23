# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY apps/api/package.json ./apps/api/
RUN npm install -g turbo && \
    turbo install --no-favicon

# Copy source files
COPY . .

# Build the application
RUN turbo run build --filter=api...

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies
COPY package.json ./
COPY apps/api/package.json ./apps/api/
RUN npm install -g turbo && \
    turbo install --no-favicon

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY --from=builder /app/apps/api/tsconfig.build.json ./apps/api/tsconfig.build.json

WORKDIR /app/apps/api

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]