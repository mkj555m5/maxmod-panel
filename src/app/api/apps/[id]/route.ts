import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// PATCH - start/stop/restart app
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { action } = body // 'start' | 'stop' | 'restart'

  const app = await db.app.findUnique({ where: { id } })
  if (!app) {
    return NextResponse.json({ error: 'app_not_found' }, { status: 404 })
  }

  // Owner can manage any app, user can manage own
  if (user.role !== 'OWNER' && app.userId !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let status = app.status
  let cpuUsed = app.cpuUsed
  if (action === 'start') {
    status = 'RUNNING'
    cpuUsed = Math.random() * (user.package?.cpuLimit || 50) + 5
  } else if (action === 'stop') {
    status = 'STOPPED'
    cpuUsed = 0
  } else if (action === 'restart') {
    status = 'RUNNING'
    cpuUsed = Math.random() * (user.package?.cpuLimit || 50) + 5
  }

  const updated = await db.app.update({
    where: { id },
    data: { status, cpuUsed },
  })

  return NextResponse.json({ app: updated })
}

// DELETE - delete app
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const app = await db.app.findUnique({ where: { id } })
  if (!app) {
    return NextResponse.json({ error: 'app_not_found' }, { status: 404 })
  }

  if (user.role !== 'OWNER' && app.userId !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await db.app.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
