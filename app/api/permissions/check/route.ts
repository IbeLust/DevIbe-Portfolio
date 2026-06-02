import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { user_roles, access_logs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const permission = searchParams.get('permission')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Get user's role
    const userRole = await db
      .select()
      .from(user_roles)
      .where(
        and(
          eq(user_roles.userId, session.userId),
          eq(user_roles.serverId, serverId)
        )
      )
      .limit(1)

    if (userRole.length === 0) {
      return NextResponse.json({
        success: true,
        permissions: [],
        roleType: 'member',
        hasPermission: false,
      })
    }

    const role = userRole[0]
    const permissions = role.permissions || []

    // If checking for specific permission
    if (permission) {
      const hasPermission = permissions.includes(permission)
      return NextResponse.json({
        success: true,
        permission,
        hasPermission,
        roleType: role.roleType,
      })
    }

    return NextResponse.json({
      success: true,
      roleType: role.roleType,
      permissions,
      grantedAt: role.grantedAt,
    })
  } catch (error) {
    console.error('[v0] Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    )
  }
}
