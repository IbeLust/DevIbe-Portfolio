import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { scheduled_actions, access_logs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serverId,
      actionType, // 'ban', 'kick', 'mute', 'unmute'
      targetUserId,
      targetUsername,
      scheduledFor, // ISO date string
      metadata,
    } = await request.json()

    if (!serverId || !actionType || !targetUserId || !scheduledFor) {
      return NextResponse.json(
        { error: 'serverId, actionType, targetUserId, and scheduledFor are required' },
        { status: 400 }
      )
    }

    // Check permissions - only owners/managers can schedule actions
    const canSchedule = await hasPermission(session.userId, serverId, 'schedule_moderation')
    if (!canSchedule) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      )
    }

    const actionId = nanoid()
    await db.insert(scheduled_actions).values({
      id: actionId,
      serverId,
      actionType,
      targetUserId,
      targetUsername: targetUsername || `User${targetUserId}`,
      scheduledFor: scheduledDate,
      status: 'pending',
      metadata: metadata || {},
      createdAt: new Date(),
    })

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'schedule_moderation_action',
      resource: `scheduled_action:${actionId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      actionId,
      scheduledFor: scheduledDate.toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error scheduling action:', error)
    return NextResponse.json(
      { error: 'Failed to schedule action' },
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
    const status = searchParams.get('status') || 'pending'

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_scheduled_actions')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const actions = await db
      .select()
      .from(scheduled_actions)
      .where((row) => row.serverId === serverId)

    // Filter by status if provided
    let filtered = status ? actions.filter((a) => a.status === status) : actions

    // Sort by scheduled date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledFor).getTime()
      const dateB = new Date(b.scheduledFor).getTime()
      return dateA - dateB
    })

    return NextResponse.json({
      success: true,
      status,
      count: filtered.length,
      actions: filtered,
    })
  } catch (error) {
    console.error('[v0] Error fetching scheduled actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled actions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { actionId, serverId, action } = await request.json()

    if (!actionId || !serverId || !action) {
      return NextResponse.json(
        { error: 'actionId, serverId, and action are required' },
        { status: 400 }
      )
    }

    // Only owners can cancel scheduled actions
    const canCancel = await hasPermission(session.userId, serverId, 'schedule_moderation')
    if (!canCancel) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // action can be 'cancel', 'execute', 'reschedule'
    let newStatus = action === 'cancel' ? 'cancelled' : action === 'execute' ? 'executed' : 'pending'

    await db
      .update(scheduled_actions)
      .set({
        status: newStatus,
        executedAt: newStatus === 'executed' ? new Date() : undefined,
      })
      .where(eq(scheduled_actions.id, actionId))

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: `${action}_scheduled_action`,
      resource: `scheduled_action:${actionId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating scheduled action:', error)
    return NextResponse.json(
      { error: 'Failed to update scheduled action' },
      { status: 500 }
    )
  }
}
