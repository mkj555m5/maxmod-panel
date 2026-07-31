import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET platform stats (owner only) + user-specific stats
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Platform stats
  const stat = await db.systemStat.findFirst()
  const totalUsers = await db.user.count({ where: { role: 'USER' } })
  const totalApps = await db.app.count()
  const activeApps = await db.app.count({ where: { status: 'RUNNING' } })
  const totalPackages = await db.package.count()

  // Compute actual usage from apps
  const appsAgg = await db.app.aggregate({
    _sum: { ramUsed: true, diskUsed: true },
    _avg: { cpuUsed: true },
  })

  const usedRam = (stat?.usedRam || 0) + (appsAgg._sum.ramUsed || 0)
  const usedDisk = (stat?.usedDisk || 0) + (appsAgg._sum.diskUsed || 0)
  const cpuUsage = appsAgg._avg.cpuUsed || stat?.cpuUsage || 0

  const platform = {
    totalRam: stat?.totalRam || 32768,
    totalDisk: stat?.totalDisk || 512000,
    usedRam,
    usedDisk,
    cpuUsage: Math.min(100, cpuUsage),
    totalUsers,
    totalApps,
    activeApps,
    totalPackages,
  }

  // User-specific resources (if not owner)
  let userStats = null
  if (user.role === 'USER' && user.package) {
    const userApps = await db.app.findMany({ where: { userId: user.id } })
    const userRamUsed = userApps.reduce((s, a) => s + a.ramUsed, 0)
    const userDiskUsed = userApps.reduce((s, a) => s + a.diskUsed, 0)
    const userAppCount = userApps.length
    userStats = {
      ramUsed: userRamUsed,
      diskUsed: userDiskUsed,
      appCount: userAppCount,
      package: user.package,
    }
  } else if (user.role === 'OWNER' || user.package?.isUnlimited) {
    const userApps = await db.app.findMany({ where: { userId: user.id } })
    userStats = {
      ramUsed: userApps.reduce((s, a) => s + a.ramUsed, 0),
      diskUsed: userApps.reduce((s, a) => s + a.diskUsed, 0),
      appCount: userApps.length,
      package: user.package,
    }
  }

  return NextResponse.json({ platform, userStats })
}
