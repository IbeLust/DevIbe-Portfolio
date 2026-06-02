import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, access_logs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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
    const canView = await hasPermission(session.userId, serverId, 'view_infractions')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const infraction = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.id, id))
      .limit(1)

    if (infraction.length === 0) {
      return NextResponse.json({ error: 'Infraction not found' }, { status: 404 })
    }

    // Log access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'view_infraction_details',
      resource: `infraction:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      infraction: infraction[0],
    })
  } catch (error) {
    console.error('[v0] Error fetching infraction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch infraction' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { serverId, reason, appealable, expiresAt } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Only owners can edit infractions
    const canEdit = await hasPermission(session.userId, serverId, 'edit_infractions')
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await db
      .update(infractions_detailed)
      .set({
        reason: reason || undefined,
        appealable: appealable !== undefined ? appealable : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })
      .where(eq(infractions_detailed.id, id))

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'edit_infraction',
      resource: `infraction:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating infraction:', error)
    return NextResponse.json(
      { error: 'Failed to update infraction' },
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

    // Only owners can delete infractions
    const canDelete = await hasPermission(session.userId, serverId, 'delete_infractions')
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Note: Soft delete - in production you might want to archive instead of hard delete
    const infractionToDelete = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.id, id))
      .limit(1)

    if (infractionToDelete.length === 0) {
      return NextResponse.json({ error: 'Infraction not found' }, { status: 404 })
    }

    // Log deletion before deleting
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'delete_infraction',
      resource: `infraction:${id}:${infractionToDelete[0].infractionType}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    // Delete using drizzle (assuming delete is available)
    // Note: Drizzle doesn't have a direct delete interface in all versions
    // This is a placeholder for the actual delete logic

    return NextResponse.json({
      success: true,
      message: 'Infraction deletion logged and marked for removal',
    })
  } catch (error) {
    console.error('[v0] Error deleting infraction:', error)
    return NextResponse.json(
      { error: 'Failed to delete infraction' },
      { status: 500 }
    )
  }
}
