import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, seedDatabase } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await seedDatabase()
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Only owner can list all packages; users get all packages too (so they can see what's available)
  const packages = await db.package.findMany({
    orderBy: { price: 'asc' },
  })
  return NextResponse.json({ packages })
}
