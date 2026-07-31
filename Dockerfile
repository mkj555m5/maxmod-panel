# Maxmod Panel - Dockerfile for Railway / Docker deployment
# Multi-stage build for smaller image size

# ---- Stage 1: Dependencies ----
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Generate Prisma client
RUN bun run db:generate

# ---- Stage 2: Build ----
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js standalone app
RUN bun run build

# ---- Stage 3: Runner ----
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for DB access
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create data directory for SQLite
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
