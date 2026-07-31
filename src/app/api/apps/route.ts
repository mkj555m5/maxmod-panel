import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET apps - owner gets all, user gets own
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const where = user.role === 'OWNER' ? {} : { userId: user.id }
  const apps = await db.app.findMany({
    where,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ apps })
}

// POST - create new app (with limit checks)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (user.status === 'SUSPENDED') {
    return NextResponse.json({ error: 'account_suspended' }, { status: 403 })
  }

  const body = await req.json()
  const { name, nodeVersion, repoUrl, port, ramNeeded, diskNeeded } = body

  if (!name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 })
  }

  // Check package limits (GOD package bypasses)
  if (user.role !== 'OWNER' && !user.package?.isUnlimited) {
    if (!user.package) {
      return NextResponse.json({ error: 'no_package' }, { status: 403 })
    }
    const pkg = user.package

    // Count existing apps
    const appCount = await db.app.count({ where: { userId: user.id } })
    if (appCount >= pkg.appLimit) {
      return NextResponse.json({ error: 'app_limit_reached' }, { status: 403 })
    }

    // Check RAM
    const ramReq = ramNeeded || 256
    const appsAgg = await db.app.aggregate({ where: { userId: user.id }, _sum: { ramUsed: true } })
    const usedRam = appsAgg._sum.ramUsed || 0
    if (usedRam + ramReq > pkg.ramLimit) {
      return NextResponse.json({ error: 'ram_limit_reached' }, { status: 403 })
    }

    // Check disk
    const diskReq = diskNeeded || 256
    const diskAgg = await db.app.aggregate({ where: { userId: user.id }, _sum: { diskUsed: true } })
    const usedDisk = diskAgg._sum.diskUsed || 0
    if (usedDisk + diskReq > pkg.diskLimit) {
      return NextResponse.json({ error: 'disk_limit_reached' }, { status: 403 })
    }
  }

  const app = await db.app.create({
    data: {
      name: name.trim(),
      userId: user.id,
      status: 'STOPPED',
      port: port || Math.floor(10000 + Math.random() * 50000),
      ramUsed: ramNeeded || 256,
      diskUsed: diskNeeded || 256,
      cpuUsed: 0,
      nodeVersion: nodeVersion || '22.x',
      repoUrl: repoUrl || null,
    },
  })

  return NextResponse.json({ app })
}
