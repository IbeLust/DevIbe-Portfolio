import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, appeals, access_logs } from '@/lib/db/schema'
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
    const canView = await hasPermission(session.userId, serverId, 'view_members')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all infractions for member
    const infractions = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.targetUserId, id))

    // Get all appeals for member's infractions
    const memberInfractionIds = infractions.map((i) => i.id)
    let memberAppeals: any[] = []
    if (memberInfractionIds.length > 0) {
      memberAppeals = await db
        .select()
        .from(appeals)
        .where((row) => memberInfractionIds.includes(row.infractionId))
    }

    // Calculate statistics
    const totalPoints = infractions.reduce((sum, i) => sum + (i.points || 0), 0)
    const typeBreakdown = {} as Record<string, number>
    infractions.forEach((i) => {
      typeBreakdown[i.infractionType] = (typeBreakdown[i.infractionType] || 0) + 1
    })

    const appealStats = {
      total: memberAppeals.length,
      pending: memberAppeals.filter((a) => a.status === 'pending').length,
      approved: memberAppeals.filter((a) => a.status === 'approved').length,
      denied: memberAppeals.filter((a) => a.status === 'denied').length,
    }

    // Log access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'view_member_profile',
      resource: `member:${id}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      profile: {
        memberId: id,
        totalInfractions: infractions.length,
        totalPoints,
        typeBreakdown,
        appeals: appealStats,
        recentInfractions: infractions.slice(0, 10),
        lastInfractionDate: infractions.length > 0 ? infractions[0].createdAt : null,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching member profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member profile' },
      { status: 500 }
    )
  }
}
