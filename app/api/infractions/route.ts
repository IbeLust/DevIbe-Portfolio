import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { issueInfraction, InfractionType } from '@/lib/infractions'
import { db } from '@/lib/db'
import { infractions_detailed } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, targetUserId, targetUsername, infractionType, reason, duration, appealable } = await request.json()

    // Check permissions
    const canIssue = await hasPermission(session.userId, serverId, 'issue_infractions')
    if (!canIssue) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate infraction type
    if (!['warning', 'mute', 'timeout', 'kick', 'ban', 'strike'].includes(infractionType)) {
      return NextResponse.json({ error: 'Invalid infraction type' }, { status: 400 })
    }

    // Issue infraction
    const infraction = await issueInfraction({
      serverId,
      targetUserId,
      targetUsername,
      moderatorId: session.userId,
      moderatorUsername: session.username,
      infractionType: infractionType as InfractionType,
      reason,
      duration,
      appealable,
    })

    return NextResponse.json({
      success: true,
      infraction,
    })
  } catch (error) {
    console.error('[v0] Error issuing infraction:', error)
    return NextResponse.json(
      { error: 'Failed to issue infraction' },
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
    const targetUserId = searchParams.get('targetUserId')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_infractions')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let infractions
    if (targetUserId) {
      infractions = await db
        .select()
        .from(infractions_detailed)
        .where(
          and(
            eq(infractions_detailed.serverId, serverId),
            eq(infractions_detailed.targetUserId, targetUserId)
          )
        )
    } else {
      infractions = await db
        .select()
        .from(infractions_detailed)
        .where(eq(infractions_detailed.serverId, serverId))
    }

    return NextResponse.json({
      success: true,
      infractions,
    })
  } catch (error) {
    console.error('[v0] Error fetching infractions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch infractions' },
      { status: 500 }
    )
  }
}
