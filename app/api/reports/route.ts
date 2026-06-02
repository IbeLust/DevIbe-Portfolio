import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { reports } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, reportedUserId, reportedUsername, reportType, reason, evidence } = await request.json()

    // Validate report type
    const validTypes = ['spam', 'harassment', 'toxicity', 'advertising', 'nsfw', 'other']
    if (!validTypes.includes(reportType)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Create report
    const reportId = nanoid()
    await db.insert(reports).values({
      id: reportId,
      serverId,
      reporterUserId: session.userId,
      reporterUsername: session.username,
      reportedUserId,
      reportedUsername,
      reportType,
      reason,
      evidence,
      status: 'pending',
      createdAt: new Date(),
    })

    console.log(`[v0] Report created: ${reportId} for user ${reportedUsername}`)

    return NextResponse.json({
      success: true,
      reportId,
    })
  } catch (error) {
    console.error('[v0] Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
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
    const canViewReports = await hasPermission(session.userId, serverId, 'view_reports')
    if (!canViewReports) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let query
    if (status) {
      query = db
        .select()
        .from(reports)
        .where(and(eq(reports.serverId, serverId), eq(reports.status, status)))
    } else {
      query = db.select().from(reports).where(eq(reports.serverId, serverId))
    }

    const reportsList = await query

    return NextResponse.json({
      success: true,
      reports: reportsList,
    })
  } catch (error) {
    console.error('[v0] Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
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

    const { reportId, serverId, status, reviewResult } = await request.json()

    // Check permissions
    const canReview = await hasPermission(session.userId, serverId, 'view_reports')
    if (!canReview) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await db
      .update(reports)
      .set({
        status,
        reviewedBy: session.userId,
        reviewResult,
        resolvedAt: new Date(),
      })
      .where(eq(reports.id, reportId))

    console.log(`[v0] Report ${reportId} updated to status: ${status}`)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[v0] Error updating report:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}
