# ========================================================
# Unified Multi-Stage Dockerfile for InventoryPro Full-Stack
# Builds React frontend + Node.js backend into a single
# lightweight, production-ready container for AWS App Runner,
# AWS ECS Fargate, AWS Elastic Beanstalk, or AWS EC2.
# ========================================================

# --- Stage 1: Build Frontend Client ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
# Build production bundle with relative API routes (/api)
ENV VITE_API_URL=/api
RUN npm run build

# --- Stage 2: Install Backend Dependencies ---
FROM node:20-alpine AS server-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

# --- Stage 3: Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for AWS / Docker health checks
RUN apk add --no-cache curl

# Create non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy backend files and dependencies
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/
COPY server/src ./server/src
COPY server/init_db.js ./server/
COPY server/seed_all_products.js ./server/

# Copy built frontend assets to client/dist where Express serves them
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure appuser owns the application files
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/live || exit 1

CMD ["node", "server/src/index.js"]

