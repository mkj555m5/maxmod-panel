import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET all domains (owner sees all, user sees own apps' domains)
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let domains
  if (user.role === 'OWNER') {
    domains = await db.domain.findMany({
      include: { app: { select: { id: true, name: true, user: { select: { username: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
  } else {
    domains = await db.domain.findMany({
      where: { app: { userId: user.id } },
      include: { app: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  return NextResponse.json({ domains })
}

// POST - create a new domain record (registers domain for an app)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { hostname, type, appId, isPrimary } = body

  if (!hostname) {
    return NextResponse.json({ error: 'hostname_required' }, { status: 400 })
  }

  // Normalize hostname
  const normalizedHostname = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  // Validate hostname format
  const hostnameRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/
  if (!hostnameRegex.test(normalizedHostname)) {
    return NextResponse.json({ error: 'invalid_hostname' }, { status: 400 })
  }

  // Check if hostname already exists
  const existing = await db.domain.findUnique({ where: { hostname: normalizedHostname } })
  if (existing) {
    return NextResponse.json({ error: 'hostname_exists' }, { status: 409 })
  }

  // If linking to an app, verify ownership
  if (appId) {
    const app = await db.app.findUnique({ where: { id: appId } })
    if (!app) {
      return NextResponse.json({ error: 'app_not_found' }, { status: 404 })
    }
    if (user.role !== 'OWNER' && app.userId !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  } else if (user.role !== 'OWNER') {
    // Only owner can create panel-level domains
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // If setting as primary, unset other primaries
  if (isPrimary) {
    await db.domain.updateMany({
      where: { isPrimary: true },
      data: { isPrimary: false },
    })
  }

  const domain = await db.domain.create({
    data: {
      hostname: normalizedHostname,
      type: type || 'CUSTOM',
      appId: appId || null,
      status: 'ACTIVE',
      sslStatus: 'ACTIVE',
      isPrimary: isPrimary || false,
    },
    include: { app: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ domain })
}
