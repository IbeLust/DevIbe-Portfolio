import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { user_roles, infractions_detailed } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions - staff can view only their own stats
    const canView = await hasPermission(session.userId, serverId, 'view_staff_stats')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get staff member info
    const staffInfo = await db
      .select()
      .from(user_roles)
      .where(
        eq(user_roles.userId, session.userId)
      )
      .limit(1)

    // Get infractions issued by this staff member
    const infractionsByStaff = await db
      .select()
      .from(infractions_detailed)
      .where(eq(infractions_detailed.moderatorId, session.userId))

    // Calculate statistics
    const stats = {
      totalInfractionsIssued: infractionsByStaff.length,
      averagePointsPerInfraction: infractionsByStaff.length > 0
        ? (infractionsByStaff.reduce((sum, i) => sum + (i.points || 0), 0) / infractionsByStaff.length).toFixed(2)
        : 0,
      infractionBreakdown: {} as Record<string, number>,
      uniqueUsersInfracted: new Set(infractionsByStaff.map((i) => i.targetUserId)).size,
      averageInfractionsPerDay: 0,
    }

    // Breakdown by type
    infractionsByStaff.forEach((inf) => {
      stats.infractionBreakdown[inf.infractionType] = (stats.infractionBreakdown[inf.infractionType] || 0) + 1
    })

    // Calculate avg per day
    if (infractionsByStaff.length > 0) {
      const oldestInfraction = infractionsByStaff[infractionsByStaff.length - 1].createdAt
      const daysDifference = Math.ceil(
        (new Date().getTime() - new Date(oldestInfraction).getTime()) / (1000 * 60 * 60 * 24)
      )
      stats.averageInfractionsPerDay = (infractionsByStaff.length / Math.max(daysDifference, 1)).toFixed(2) as any
    }

    return NextResponse.json({
      success: true,
      staffInfo: staffInfo[0] || null,
      stats,
      recentInfractions: infractionsByStaff.slice(0, 10),
    })
  } catch (error) {
    console.error('[v0] Error fetching staff stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff stats' },
      { status: 500 }
    )
  }
}
