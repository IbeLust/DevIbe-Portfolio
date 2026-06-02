import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, reports, appeals, access_logs, user_roles } from '@/lib/db/schema'
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

    // Check basic permissions
    const canView = await hasPermission(session.userId, serverId, 'view_infractions')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get dashboard data
    const infractions = await db
      .select()
      .from(infractions_detailed)
      .where((row) => row.serverId === serverId)

    const reports_data = await db
      .select()
      .from(reports)
      .where((row) => row.serverId === serverId)

    const appeals_data = await db
      .select()
      .from(appeals)
      .where((row) => row.serverId === serverId)

    // Count staff members
    const staffMembers = await db
      .select()
      .from(user_roles)
      .where((row) => row.serverId === serverId)

    // Calculate recent activity (last 24 hours)
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentInfractions = infractions.filter(
      (i) => new Date(i.createdAt) > yesterday
    ).length

    const recentReports = reports_data.filter(
      (r) => new Date(r.createdAt) > yesterday
    ).length

    const recentAppeals = appeals_data.filter(
      (a) => new Date(a.createdAt) > yesterday
    ).length

    return NextResponse.json({
      success: true,
      overview: {
        totalInfractions: infractions.length,
        totalReports: reports_data.length,
        totalAppeals: appeals_data.length,
        totalStaffMembers: staffMembers.length,
      },
      recentActivity24h: {
        infractions: recentInfractions,
        reports: recentReports,
        appeals: recentAppeals,
      },
      stats: {
        infractionTypes: aggregateByType(infractions),
        reportStatuses: aggregateByStatus(reports_data),
        appealStatuses: aggregateByStatus(appeals_data),
        topViolators: getTopViolators(infractions, 5),
      },
      pending: {
        reports: reports_data.filter((r) => r.status === 'pending').length,
        appeals: appeals_data.filter((a) => a.status === 'pending').length,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}

function aggregateByType(data: any[]): Record<string, number> {
  const result = {} as Record<string, number>
  data.forEach((item) => {
    const key = item.infractionType || item.reportType || 'unknown'
    result[key] = (result[key] || 0) + 1
  })
  return result
}

function aggregateByStatus(data: any[]): Record<string, number> {
  const result = {} as Record<string, number>
  data.forEach((item) => {
    const key = item.status || 'unknown'
    result[key] = (result[key] || 0) + 1
  })
  return result
}

function getTopViolators(infractions: any[], limit: number) {
  const violators = {} as Record<string, { count: number; username: string }>
  infractions.forEach((inf) => {
    if (!violators[inf.targetUserId]) {
      violators[inf.targetUserId] = { count: 0, username: inf.targetUsername }
    }
    violators[inf.targetUserId].count++
  })

  return Object.entries(violators)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, data]) => ({
      userId: id,
      username: data.username,
      infractionCount: data.count,
    }))
}
