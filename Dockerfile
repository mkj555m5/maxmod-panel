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
# Use Node.js official slim image (Debian-based, has groupadd/useradd)
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create non-root user for security (Debian uses groupadd/useradd, not addgroup/adduser)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home --shell /bin/false nextjs

# Install curl for healthcheck (slim images don't include it by default)
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy standalone server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for DB access (CLI + client + schema)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy Railway startup script (runs prisma db push before server starts)
COPY --from=builder /app/start-railway.sh ./start-railway.sh
RUN chmod +x ./start-railway.sh

# Create data directory for SQLite (volume mount point on Railway)
# Railway mounts the volume at /data — make sure it exists and is writable
RUN mkdir -p /app/db /data && chown -R nextjs:nodejs /app /data

USER nextjs

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Startup: apply Prisma schema to /data volume, then start the Next.js server
CMD ["./start-railway.sh"]
