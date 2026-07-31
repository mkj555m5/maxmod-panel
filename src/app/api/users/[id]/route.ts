import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, hashPassword } from '@/lib/auth'

// PATCH - update user (change package, status, password)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getUserFromRequest(req)
  if (!currentUser || currentUser.role !== 'OWNER') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { packageId, status, password } = body

  const data: any = {}
  if (packageId !== undefined) {
    if (packageId === null) {
      data.packageId = null
    } else {
      const pkg = await db.package.findUnique({ where: { id: packageId } })
      if (!pkg) return NextResponse.json({ error: 'package_not_found' }, { status: 404 })
      data.packageId = pkg.id
    }
  }
  if (status !== undefined) data.status = status
  if (password) {
    if (password.length < 6) return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
    data.password = hashPassword(password)
  }

  const user = await db.user.update({
    where: { id },
    data,
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

// DELETE - delete user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getUserFromRequest(req)
  if (!currentUser || currentUser.role !== 'OWNER') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  const { id } = await params
  if (id === currentUser.id) {
    return NextResponse.json({ error: 'cannot_delete_self' }, { status: 400 })
  }

  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
