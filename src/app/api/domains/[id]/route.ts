import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// PATCH - update domain (set primary, status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { isPrimary, status, sslStatus } = body

  const domain = await db.domain.findUnique({ where: { id } })
  if (!domain) {
    return NextResponse.json({ error: 'domain_not_found' }, { status: 404 })
  }

  // Only owner can modify domains
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // If setting as primary, unset other primaries
  if (isPrimary) {
    await db.domain.updateMany({
      where: { isPrimary: true },
      data: { isPrimary: false },
    })
  }

  const data: any = {}
  if (isPrimary !== undefined) data.isPrimary = isPrimary
  if (status !== undefined) data.status = status
  if (sslStatus !== undefined) data.sslStatus = sslStatus

  const updated = await db.domain.update({
    where: { id },
    data,
    include: { app: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ domain: updated })
}

// DELETE - remove a domain
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const domain = await db.domain.findUnique({ where: { id } })
  if (!domain) {
    return NextResponse.json({ error: 'domain_not_found' }, { status: 404 })
  }

  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await db.domain.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
