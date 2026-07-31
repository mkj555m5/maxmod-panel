import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

/**
 * Ensure DATABASE_URL points to a writable location.
 * If DATABASE_URL is set but the directory doesn't exist, try to create it.
 * If DATABASE_URL is NOT set, auto-detect a writable location:
 *   1. /data (Railway volume mount — works even without an actual volume attached)
 *   2. /tmp/maxmod (fallback for read-only filesystems)
 *   3. ./db (local dev fallback)
 */
function ensureDatabaseUrl() {
  const currentUrl = process.env.DATABASE_URL
  if (currentUrl) {
    // Make sure the parent directory exists and is writable
    const dbPath = currentUrl.replace(/^file:/, '')
    const dir = path.dirname(dbPath)
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.accessSync(dir, fs.constants.W_OK)
      console.log('[db] DATABASE_URL =', currentUrl)
      return
    } catch (e) {
      console.warn(`[db] DATABASE_URL points to unwritable path: ${currentUrl}, falling back to auto-detect`)
    }
  }

  const candidates = [
    '/data',
    '/tmp/maxmod',
    path.join(process.cwd(), 'db'),
  ]
  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.accessSync(dir, fs.constants.W_OK)
      process.env.DATABASE_URL = `file:${dir}/custom.db`
      console.log('[db] DATABASE_URL auto-set to', process.env.DATABASE_URL)
      return
    } catch {
      continue
    }
  }
  // Last resort: let Prisma throw with a clear error
  console.error('[db] Could not find a writable directory for SQLite!')
}

ensureDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
