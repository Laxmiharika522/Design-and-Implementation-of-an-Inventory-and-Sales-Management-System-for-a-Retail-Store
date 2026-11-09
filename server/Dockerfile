# ========================================================
# Production Dockerfile for InventoryPro Backend API
# Deploys to AWS App Runner, AWS ECS (Fargate), or Elastic Beanstalk
# ========================================================

FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN apk add --no-cache curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY init_db.js ./
COPY seed_all_products.js ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/live || exit 1

CMD ["node", "src/index.js"]

