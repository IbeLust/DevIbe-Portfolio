import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { access_logs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, serverId, action, resource, success = true, errorMessage } = body

    // Log the access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId,
      serverId,
      action,
      resource,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success,
      errorMessage,
      createdAt: new Date(),
    })

    console.log(`[v0] Audit log: ${action} by user ${userId} on resource ${resource}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error logging access:', error)
    return NextResponse.json(
      { error: 'Failed to log access' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions - only owners and managers can view access logs
    const canViewLogs = await hasPermission(session.userId, serverId, 'view_access_logs')
    if (!canViewLogs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const logs = await db
      .select()
      .from(access_logs)
      .where(eq(access_logs.serverId, serverId))
      .orderBy(desc(access_logs.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error('[v0] Error fetching access logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access logs' },
      { status: 500 }
    )
  }
}
