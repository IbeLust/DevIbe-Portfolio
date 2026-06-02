import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { appeals, infractions_detailed } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { infractionId, serverId, appealReason } = await request.json()

    // Get infraction details
    const infractionResult = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.id, infractionId))
      .limit(1)

    const infraction = infractionResult[0]

    if (!infraction) {
      return NextResponse.json({ error: 'Infraction not found' }, { status: 404 })
    }

    if (!infraction.appealable) {
      return NextResponse.json({ error: 'This infraction cannot be appealed' }, { status: 400 })
    }

    // Check if already appealed
    const existingAppealResult = await db
      .select()
      .from(appeals)
      .where(eq(appeals.infractionId, infractionId))
      .limit(1)

    if (existingAppealResult.length > 0) {
      return NextResponse.json({ error: 'This infraction has already been appealed' }, { status: 400 })
    }

    // Create appeal
    const appealId = nanoid()
    await db.insert(appeals).values({
      id: appealId,
      infractionId,
      serverId,
      appealantUserId: session.userId,
      appealantUsername: session.username,
      appealReason,
      status: 'pending',
      createdAt: new Date(),
    })

    console.log(`[v0] Appeal created: ${appealId} for infraction ${infractionId}`)

    return NextResponse.json({
      success: true,
      appealId,
    })
  } catch (error) {
    console.error('[v0] Error creating appeal:', error)
    return NextResponse.json(
      { error: 'Failed to create appeal' },
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
    const status = searchParams.get('status')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canReviewAppeals = await hasPermission(session.userId, serverId, 'review_appeals')
    if (!canReviewAppeals) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let query
    if (status) {
      query = db
        .select()
        .from(appeals)
        .where(and(eq(appeals.serverId, serverId), eq(appeals.status, status)))
    } else {
      query = db.select().from(appeals).where(eq(appeals.serverId, serverId))
    }

    const appealsList = await query

    return NextResponse.json({
      success: true,
      appeals: appealsList,
    })
  } catch (error) {
    console.error('[v0] Error fetching appeals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appeals' },
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

    const { appealId, serverId, status, reviewerNotes } = await request.json()

    // Check permissions
    const canReview = await hasPermission(session.userId, serverId, 'review_appeals')
    if (!canReview) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await db
      .update(appeals)
      .set({
        status,
        reviewedBy: session.userId,
        reviewerNotes,
        reviewedAt: new Date(),
      })
      .where(eq(appeals.id, appealId))

    console.log(`[v0] Appeal ${appealId} reviewed with status: ${status}`)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[v0] Error updating appeal:', error)
    return NextResponse.json(
      { error: 'Failed to update appeal' },
      { status: 500 }
    )
  }
}
