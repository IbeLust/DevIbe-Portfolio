import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { user_roles, access_logs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_staff')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const staffMember = await db
      .select()
      .from(user_roles)
      .where(
        and(
          eq(user_roles.userId, id),
          eq(user_roles.serverId, serverId)
        )
      )
      .limit(1)

    if (staffMember.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Log access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'view_staff_member',
      resource: `staff:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      staffMember: staffMember[0],
    })
  } catch (error) {
    console.error('[v0] Error fetching staff member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { serverId, roleType, permissions } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Only owners can modify staff roles
    const canModify = await hasPermission(session.userId, serverId, 'manage_staff')
    if (!canModify) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await db
      .update(user_roles)
      .set({
        roleType,
        permissions: permissions || [],
      })
      .where(
        and(
          eq(user_roles.userId, id),
          eq(user_roles.serverId, serverId)
        )
      )

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'update_staff_role',
      resource: `staff:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { serverId } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Only owners can remove staff
    const canRemove = await hasPermission(session.userId, serverId, 'manage_staff')
    if (!canRemove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Soft delete by setting role to 'removed'
    await db
      .update(user_roles)
      .set({ roleType: 'removed' })
      .where(
        and(
          eq(user_roles.userId, id),
          eq(user_roles.serverId, serverId)
        )
      )

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'remove_staff',
      resource: `staff:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error removing staff member:', error)
    return NextResponse.json(
      { error: 'Failed to remove staff member' },
      { status: 500 }
    )
  }
}
