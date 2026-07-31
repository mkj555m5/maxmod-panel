import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, createSession, getUserFromRequest, setSessionCookie, seedDatabase } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await seedDatabase()
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { username: username.trim() },
      include: { package: true },
    })

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'account_suspended' }, { status: 403 })
    }

    const token = createSession(user.id)
    const res = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        package: user.package,
      },
    })
    return setSessionCookie(res, token)
  } catch (e: any) {
    console.error('Login error:', e?.message || e)
    return NextResponse.json({ error: 'server_error', message: e?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await seedDatabase()
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        package: user.package,
      },
    })
  } catch (e: any) {
    console.error('Me error:', e?.message || e)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
