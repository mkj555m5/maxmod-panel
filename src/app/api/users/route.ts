import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, hashPassword } from '@/lib/auth'

// GET all users (owner only)
export async function GET(req: NextRequest) {
  const currentUser = await getUserFromRequest(req)
  if (!currentUser || currentUser.role !== 'OWNER') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }
  const users = await db.user.findMany({
    include: { package: true, _count: { select: { apps: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      status: u.status,
      package: u.package,
      appsCount: u._count.apps,
      createdAt: u.createdAt,
    })),
  })
}

// POST create user (owner only)
export async function POST(req: NextRequest) {
  const currentUser = await getUserFromRequest(req)
  if (!currentUser || currentUser.role !== 'OWNER') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { username, password, packageId } = body

  if (!username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { username: username.trim() } })
  if (existing) {
    return NextResponse.json({ error: 'username_exists' }, { status: 409 })
  }

  const pkg = packageId ? await db.package.findUnique({ where: { id: packageId } }) : null

  const user = await db.user.create({
    data: {
      username: username.trim(),
      password: hashPassword(password),
      role: 'USER',
      packageId: pkg?.id ?? null,
      status: 'ACTIVE',
    },
    include: { package: true },
  })

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      package: user.package,
    },
  })
}
