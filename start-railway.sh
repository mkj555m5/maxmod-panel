#!/bin/sh
# Maxmod Panel - Railway startup script
# Ensures the SQLite database exists on the volume and schema is applied.
# Uses /bin/sh for maximum compatibility (slim images may not have bash).

set -e

echo "[maxmod-panel] Starting Railway deployment..."
echo "[maxmod-panel] DATABASE_URL = ${DATABASE_URL:-NOT_SET}"
echo "[maxmod-panel] PORT = ${PORT:-8080}"

# Make sure /data exists (volume mount point on Railway)
if [ ! -d "/data" ]; then
  echo "[maxmod-panel] /data not found — creating local fallback directory"
  mkdir -p /data 2>/dev/null || true
fi

# If DATABASE_URL is not set, default to /data/custom.db (volume path)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/data/custom.db"
  echo "[maxmod-panel] DATABASE_URL not set — defaulting to $DATABASE_URL"
fi

# Apply Prisma schema to the database (creates file + tables if missing)
# This is safe to run on every startup — it only applies changes if needed.
echo "[maxmod-panel] Applying Prisma schema..."
node ./node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate || {
  echo "[maxmod-panel] WARNING: prisma db push failed — the seedDatabase() function will attempt to create tables at runtime"
}

# Start the Next.js standalone server
echo "[maxmod-panel] Starting server on port ${PORT:-8080}..."
exec node server.js
