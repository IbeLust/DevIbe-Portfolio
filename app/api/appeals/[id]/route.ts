import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { appeals, infractions_detailed, access_logs } from '@/lib/db/schema'
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
    const canView = await hasPermission(session.userId, serverId, 'view_appeals')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const appeal = await db
      .select()
      .from(appeals)
      .where(eq(appeals.id, id))
      .limit(1)

    if (appeal.length === 0) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })
    }

    // Get associated infraction
    const infraction = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.id, appeal[0].infractionId))
      .limit(1)

    // Log access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'view_appeal_details',
      resource: `appeal:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      appeal: appeal[0],
      infraction: infraction[0] || null,
    })
  } catch (error) {
    console.error('[v0] Error fetching appeal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appeal' },
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
    const { serverId, status, reviewerNotes } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Only owners and managers can review appeals
    const canReview = await hasPermission(session.userId, serverId, 'review_appeals')
    if (!canReview) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get appeal to update related infraction if approved
    const appeal = await db
      .select()
      .from(appeals)
      .where(eq(appeals.id, id))
      .limit(1)

    if (appeal.length === 0) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })
    }

    // Update appeal
    await db
      .update(appeals)
      .set({
        status,
        reviewedBy: session.userId,
        reviewerNotes,
        reviewedAt: new Date(),
      })
      .where(eq(appeals.id, id))

    // If approved, mark infraction as appealed
    if (status === 'approved') {
      await db
        .update(infractions_detailed)
        .set({
          appealResult: 'approved',
          appealedAt: new Date(),
        })
        .where(eq(infractions_detailed.id, appeal[0].infractionId))
    }

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'review_appeal',
      resource: `appeal:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating appeal:', error)
    return NextResponse.json(
      { error: 'Failed to update appeal' },
      { status: 500 }
    )
  }
}
