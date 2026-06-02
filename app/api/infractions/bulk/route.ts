import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, access_logs } from '@/lib/db/schema'
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
      operation, // 'warn', 'mute', 'kick', 'ban', 'remove_points', 'add_points'
      targetUserIds,
      reason,
      duration,
    } = await request.json()

    if (!serverId || !operation || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
      return NextResponse.json(
        { error: 'serverId, operation, and targetUserIds array are required' },
        { status: 400 }
      )
    }

    // Check permissions - bulk operations require owner/manager level
    const canBulkOp = await hasPermission(session.userId, serverId, 'bulk_operations')
    if (!canBulkOp) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Limit to max 100 users per bulk operation
    if (targetUserIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot perform bulk operation on more than 100 users at once' },
        { status: 400 }
      )
    }

    const results = [] as Array<{ userId: string; success: boolean; infractionId?: string; error?: string }>

    for (const userId of targetUserIds) {
      try {
        let infractionType = operation

        // Map operation to infraction type
        if (operation === 'warn') {
          infractionType = 'warning'
        } else if (operation === 'mute') {
          infractionType = 'mute'
        } else if (operation === 'kick') {
          infractionType = 'kick'
        } else if (operation === 'ban') {
          infractionType = 'ban'
        }

        const infractionId = nanoid()
        await db.insert(infractions_detailed).values({
          id: infractionId,
          serverId,
          targetUserId: userId,
          targetUsername: `User${userId}`,
          moderatorId: session.userId,
          moderatorUsername: session.username,
          infractionType,
          severity: 3,
          points: getPointsForType(infractionType),
          reason: reason || `Bulk ${operation} operation`,
          duration,
          appealable: true,
          createdAt: new Date(),
        })

        // Log action
        await db.insert(access_logs).values({
          id: nanoid(),
          userId: session.userId,
          serverId,
          action: `bulk_${operation}`,
          resource: `infraction:${infractionId}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true,
          createdAt: new Date(),
        })

        results.push({ userId, success: true, infractionId })
      } catch (error) {
        console.error(`[v0] Error creating bulk infraction for ${userId}:`, error)
        results.push({
          userId,
          success: false,
          error: 'Failed to create infraction',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      totalProcessed: targetUserIds.length,
      successful: successCount,
      failed: targetUserIds.length - successCount,
      results,
    })
  } catch (error) {
    console.error('[v0] Error performing bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}

function getPointsForType(type: string): number {
  const pointMap: Record<string, number> = {
    warning: 1,
    mute: 3,
    timeout: 5,
    kick: 10,
    ban: 25,
  }
  return pointMap[type] || 0
}
