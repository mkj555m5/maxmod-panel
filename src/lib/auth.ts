import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'
import { ensureSchema } from './db-init'
import { createHash, randomBytes } from 'crypto'

// Simple session token store (in-memory for dev, would use Redis/DB in production)
const sessions = new Map<string, { userId: string; expires: number }>()

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7 // 7 days

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + '_maxmod_salt_2025').digest('hex')
}

export function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { userId, expires: Date.now() + SESSION_DURATION })
  return token
}

export function getSession(token: string | undefined) {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expires) {
    sessions.delete(token)
    return null
  }
  return session
}

export function destroySession(token: string) {
  sessions.delete(token)
}

export function getTokenFromRequest(req: NextRequest): string | undefined {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7)
  }
  const token = req.cookies.get('maxmod_session')?.value
  return token
}

export async function getUserFromRequest(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const session = getSession(token)
  if (!session) return null
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { package: true },
  })
  return user
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set('maxmod_session', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

// Seed initial data (owner + packages + system stats)
export async function seedDatabase() {
  // Make sure schema is applied (creates tables if missing)
  await ensureSchema()

  // Check if owner exists
  const existingOwner = await db.user.findFirst({
    where: { role: 'OWNER' },
  }).catch((e) => {
    console.error('[seedDatabase] findFirst failed:', e)
    return null
  })
  if (existingOwner) return

  // Create packages
  const freePkg = await db.package.create({
    data: {
      name: 'FREE',
      displayName: 'Free Package',
      ramLimit: 512,
      diskLimit: 1024,
      cpuLimit: 25,
      appLimit: 2,
      isUnlimited: false,
      price: 0,
      color: 'slate',
    },
  })

  const proPkg = await db.package.create({
    data: {
      name: 'PRO',
      displayName: 'Pro Package',
      ramLimit: 2048,
      diskLimit: 5120,
      cpuLimit: 50,
      appLimit: 10,
      isUnlimited: false,
      price: 9.99,
      color: 'emerald',
    },
  })

  const bizPkg = await db.package.create({
    data: {
      name: 'BUSINESS',
      displayName: 'Business Package',
      ramLimit: 8192,
      diskLimit: 20480,
      cpuLimit: 75,
      appLimit: 50,
      isUnlimited: false,
      price: 29.99,
      color: 'amber',
    },
  })

  const godPkg = await db.package.create({
    data: {
      name: 'GOD',
      displayName: 'GOD Package',
      ramLimit: 999999,
      diskLimit: 999999,
      cpuLimit: 100,
      appLimit: 999999,
      isUnlimited: true,
      price: 99.99,
      color: 'fuchsia',
    },
  })

  // Create owner account
  await db.user.create({
    data: {
      username: 'mkj555m',
      password: hashPassword('@ROblox2011'),
      role: 'OWNER',
      packageId: godPkg.id,
      status: 'ACTIVE',
    },
  })

  // Create system stats (assume 32GB RAM, 500GB disk)
  await db.systemStat.create({
    data: {
      totalRam: 32768,
      totalDisk: 512000,
      usedRam: 2048,
      usedDisk: 51200,
      cpuUsage: 12.5,
    },
  })
}
