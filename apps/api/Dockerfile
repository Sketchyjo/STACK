# Use Node.js Alpine image for smaller size
FROM node:18-alpine AS base

# Enable corepack for package manager
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependency files and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm --filter @stack/database db:generate

# Build the API
RUN pnpm --filter @stack/api build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 stack

# Copy built application
COPY --from=builder --chown=stack:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=stack:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=stack:nodejs /app/packages ./packages

USER stack

# Expose the port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]