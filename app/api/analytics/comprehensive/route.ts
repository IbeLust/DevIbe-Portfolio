import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { access_logs, infractions_detailed, reports, appeals } from '@/lib/db/schema'
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

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_analytics')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all data for the server
    const [infractionData, reportsData, appealsData, auditData] = await Promise.all([
      db.select().from(infractions_detailed).where(eq(infractions_detailed.serverId, serverId)),
      db.select().from(reports).where(eq(reports.serverId, serverId)),
      db.select().from(appeals).where(eq(appeals.serverId, serverId)),
      db.select().from(access_logs).where(eq(access_logs.serverId, serverId)),
    ])

    // Calculate comprehensive statistics
    const stats = {
      infractions: {
        total: infractionData.length,
        byType: aggregateByType(infractionData),
        bySeverity: aggregateBySeverity(infractionData),
        totalPoints: infractionData.reduce((sum, i) => sum + (i.points || 0), 0),
        averagePointsPerInfraction: infractionData.length > 0
          ? (infractionData.reduce((sum, i) => sum + (i.points || 0), 0) / infractionData.length).toFixed(2)
          : 0,
        appealableCount: infractionData.filter((i) => i.appealable).length,
      },
      reports: {
        total: reportsData.length,
        byStatus: aggregateByField(reportsData, 'status'),
        byType: aggregateByField(reportsData, 'reportType'),
        pendingCount: reportsData.filter((r) => r.status === 'pending').length,
        averageResolutionTime: calculateAverageResolutionTime(reportsData),
      },
      appeals: {
        total: appealsData.length,
        byStatus: aggregateByField(appealsData, 'status'),
        approvalRate: appealsData.length > 0
          ? ((appealsData.filter((a) => a.status === 'approved').length / appealsData.length) * 100).toFixed(2)
          : 0,
        pendingCount: appealsData.filter((a) => a.status === 'pending').length,
        averageResolutionTime: calculateAverageResolutionTime(appealsData),
      },
      audit: {
        totalActions: auditData.length,
        successfulActions: auditData.filter((a) => a.success).length,
        failedActions: auditData.filter((a) => !a.success).length,
        successRate: auditData.length > 0
          ? ((auditData.filter((a) => a.success).length / auditData.length) * 100).toFixed(2)
          : 0,
      },
    }

    // Activity trends (last 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentActivity = {
      infractions: infractionData.filter((i) => new Date(i.createdAt) > sevenDaysAgo).length,
      reports: reportsData.filter((r) => new Date(r.createdAt) > sevenDaysAgo).length,
      appeals: appealsData.filter((a) => new Date(a.createdAt) > sevenDaysAgo).length,
    }

    return NextResponse.json({
      success: true,
      statistics: stats,
      recentActivity7Days: recentActivity,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error fetching comprehensive stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comprehensive statistics' },
      { status: 500 }
    )
  }
}

function aggregateByType(data: any[]): Record<string, number> {
  const result = {} as Record<string, number>
  data.forEach((item) => {
    const key = item.infractionType || 'unknown'
    result[key] = (result[key] || 0) + 1
  })
  return result
}

function aggregateBySeverity(data: any[]): Record<string, number> {
  const result = {} as Record<string, number>
  data.forEach((item) => {
    const severity = item.severity || 0
    const key = `level_${severity}`
    result[key] = (result[key] || 0) + 1
  })
  return result
}

function aggregateByField(data: any[], field: string): Record<string, number> {
  const result = {} as Record<string, number>
  data.forEach((item) => {
    const key = item[field] || 'unknown'
    result[key] = (result[key] || 0) + 1
  })
  return result
}

function calculateAverageResolutionTime(data: any[]): number {
  const resolved = data.filter((item) => item.resolvedAt || item.reviewedAt)
  if (resolved.length === 0) return 0

  const totalTime = resolved.reduce((sum, item) => {
    const created = new Date(item.createdAt).getTime()
    const resolved = new Date(item.resolvedAt || item.reviewedAt).getTime()
    return sum + (resolved - created)
  }, 0)

  return Math.round((totalTime / resolved.length) / (1000 * 60 * 60)) // Convert to hours
}
