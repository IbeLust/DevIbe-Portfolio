import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, appeals } from '@/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const timeframe = searchParams.get('timeframe') || '30days' // '7days', '30days', '90days', 'all'

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canViewAnalytics = await hasPermission(session.userId, serverId, 'view_analytics')
    if (!canViewAnalytics) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (timeframe) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate = new Date('2000-01-01')
    }

    // Get all infractions in timeframe
    const allInfractions = await db
      .select()
      .from(infractions_detailed)
      .where(
        and(
          eq(infractions_detailed.serverId, serverId),
          infractions_detailed.createdAt >= startDate
        )
      )

    // Count by type
    const typeStats = {} as Record<string, number>
    const userInfractionCount = {} as Record<string, number>

    allInfractions.forEach((inf) => {
      typeStats[inf.infractionType] = (typeStats[inf.infractionType] || 0) + 1
      userInfractionCount[inf.targetUserId] = (userInfractionCount[inf.targetUserId] || 0) + 1
    })

    // Get top violators
    const topViolators = Object.entries(userInfractionCount)
      .map(([userId, count]) => {
        const user = allInfractions.find((i) => i.targetUserId === userId)
        return {
          userId,
          username: user?.targetUsername || 'Unknown',
          count,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get appeal statistics
    const appeals_data = await db
      .select()
      .from(appeals)
      .where(eq(appeals.serverId, serverId))

    const appealStats = {
      total: appeals_data.length,
      pending: appeals_data.filter((a) => a.status === 'pending').length,
      approved: appeals_data.filter((a) => a.status === 'approved').length,
      denied: appeals_data.filter((a) => a.status === 'denied').length,
      approvalRate: appeals_data.length > 0
        ? (appeals_data.filter((a) => a.status === 'approved').length / appeals_data.length) * 100
        : 0,
    }

    // Calculate trends (daily)
    const dailyStats = {} as Record<string, number>
    allInfractions.forEach((inf) => {
      const dateKey = inf.createdAt.toISOString().split('T')[0]
      dailyStats[dateKey] = (dailyStats[dateKey] || 0) + 1
    })

    // Severity distribution
    const severityStats = {
      low: allInfractions.filter((i) => i.severity && i.severity <= 2).length,
      medium: allInfractions.filter((i) => i.severity && i.severity === 3).length,
      high: allInfractions.filter((i) => i.severity && i.severity >= 4).length,
    }

    // Point distribution
    const totalPoints = allInfractions.reduce((sum, i) => sum + (i.points || 0), 0)
    const avgPoints = allInfractions.length > 0 ? totalPoints / allInfractions.length : 0

    return NextResponse.json({
      success: true,
      timeframe,
      summary: {
        totalInfractions: allInfractions.length,
        totalPoints,
        averagePoints: avgPoints.toFixed(2),
        uniqueUsers: Object.keys(userInfractionCount).length,
      },
      typeBreakdown: typeStats,
      severityBreakdown: severityStats,
      topViolators,
      appealStats,
      dailyTrends: dailyStats,
    })
  } catch (error) {
    console.error('[v0] Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
