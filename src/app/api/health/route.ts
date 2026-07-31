import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test DB connection
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      service: 'maxmod-panel',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT || 8080,
      env: process.env.NODE_ENV || 'development',
      database: 'connected',
    })
  } catch (e) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'maxmod-panel',
        error: 'database_connection_failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
