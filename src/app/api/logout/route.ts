import { NextRequest, NextResponse } from 'next/server'
import { destroySession, getTokenFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (token) destroySession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('maxmod_session')
  return res
}
