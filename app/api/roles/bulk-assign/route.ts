import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { user_roles, access_logs } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, userIds, roleType, permissions } = await request.json()

    if (!serverId || !Array.isArray(userIds) || userIds.length === 0 || !roleType) {
      return NextResponse.json(
        { error: 'serverId, userIds array, and roleType are required' },
        { status: 400 }
      )
    }

    // Limit to max 50 users per bulk operation
    if (userIds.length > 50) {
      return NextResponse.json(
        { error: 'Cannot assign roles to more than 50 users at once' },
        { status: 400 }
      )
    }

    // Check permissions - only owners can bulk assign roles
    const canAssign = await hasPermission(session.userId, serverId, 'manage_roles')
    if (!canAssign) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const results = [] as Array<{ userId: string; success: boolean; roleId?: string; error?: string }>

    for (const userId of userIds) {
      try {
        const roleId = nanoid()

        await db.insert(user_roles).values({
          id: roleId,
          userId,
          serverId,
          roleType,
          permissions: permissions || [],
          grantedBy: session.userId,
          grantedAt: new Date(),
        })

        // Log action
        await db.insert(access_logs).values({
          id: nanoid(),
          userId: session.userId,
          serverId,
          action: 'bulk_assign_role',
          resource: `role:${roleId}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true,
          createdAt: new Date(),
        })

        results.push({ userId, success: true, roleId })
      } catch (error) {
        console.error(`[v0] Error assigning role to ${userId}:`, error)
        results.push({
          userId,
          success: false,
          error: 'Failed to assign role',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      totalProcessed: userIds.length,
      successful: successCount,
      failed: userIds.length - successCount,
      results,
    })
  } catch (error) {
    console.error('[v0] Error performing bulk role assignment:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk role assignment' },
      { status: 500 }
    )
  }
}
