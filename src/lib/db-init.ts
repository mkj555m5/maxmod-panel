import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * Ensures the SQLite database has the latest Prisma schema applied.
 * Called lazily before the first DB query — survives missing prisma db push
 * in the startup script (e.g. when Railway skips the Dockerfile CMD or
 * when the volume isn't attached and /data was just created fresh).
 *
 * Idempotent: only runs once per process.
 */

let initialized = false
let initPromise: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (initialized) return
  if (!initPromise) {
    initPromise = applySchema().then(() => {
      initialized = true
    }).catch((e) => {
      console.error('[db-init] Schema apply failed:', e)
      // Allow retry on next request
      initPromise = null
    })
  }
  return initPromise
}

async function applySchema(): Promise<void> {
  const schemaPath = findSchemaPath()
  const cliPath = findPrismaCli()

  if (!schemaPath) {
    console.error('[db-init] schema.prisma not found — skipping schema apply')
    return
  }
  if (!cliPath) {
    console.error('[db-init] prisma CLI not found — skipping schema apply')
    return
  }

  console.log('[db-init] Applying schema from', schemaPath)
  try {
    execSync(
      `node "${cliPath}" db push --accept-data-loss --skip-generate --schema="${schemaPath}"`,
      {
        stdio: 'pipe',
        env: process.env,
        timeout: 30000,
      }
    )
    console.log('[db-init] Schema applied successfully')
  } catch (e: any) {
    console.error('[db-init] prisma db push failed:', e.message)
    if (e.stderr) console.error('[db-init] stderr:', e.stderr.toString())
    throw e
  }
}

function findSchemaPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'prisma/schema.prisma'),
    path.join(__dirname, '../prisma/schema.prisma'),
    path.join(__dirname, '../../prisma/schema.prisma'),
    path.join(__dirname, '../../../prisma/schema.prisma'),
    '/app/prisma/schema.prisma',
  ]
  return candidates.find((p) => fs.existsSync(p)) || null
}

function findPrismaCli(): string | null {
  const candidates = [
    path.join(process.cwd(), 'node_modules/prisma/build/index.js'),
    path.join(__dirname, '../node_modules/prisma/build/index.js'),
    path.join(__dirname, '../../node_modules/prisma/build/index.js'),
    path.join(__dirname, '../../../node_modules/prisma/build/index.js'),
    '/app/node_modules/prisma/build/index.js',
  ]
  return candidates.find((p) => fs.existsSync(p)) || null
}
