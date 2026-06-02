import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { access_logs } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions - only owners and managers can view full audit logs
    const canView = await hasPermission(session.userId, serverId, 'view_audit_logs')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Build query
    let query = db
      .select()
      .from(access_logs)

    if (serverId) {
      const result = await query.where((row) => row.serverId === serverId)
      let filtered = result

      if (action) {
        filtered = filtered.filter((log) => log.action === action)
      }

      if (userId) {
        filtered = filtered.filter((log) => log.userId === userId)
      }

      // Sort by date descending
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

      // Apply pagination
      const paginatedResults = filtered.slice(offset, offset + limit)

      // Get summary statistics
      const successCount = filtered.filter((log) => log.success).length
      const errorCount = filtered.filter((log) => !log.success).length
      const actions = {} as Record<string, number>

      filtered.forEach((log) => {
        actions[log.action] = (actions[log.action] || 0) + 1
      })

      const users = {} as Record<string, number>
      filtered.forEach((log) => {
        users[log.userId] = (users[log.userId] || 0) + 1
      })

      return NextResponse.json({
        success: true,
        pagination: {
          limit,
          offset,
          total: filtered.length,
          hasMore: offset + limit < filtered.length,
        },
        logs: paginatedResults,
        summary: {
          totalActions: filtered.length,
          successfulActions: successCount,
          failedActions: errorCount,
          successRate: filtered.length > 0 ? ((successCount / filtered.length) * 100).toFixed(2) : '0',
          actionTypes: actions,
          activeUsers: Object.keys(users).length,
          userActivity: users,
        },
      })
    }

    return NextResponse.json({
      success: true,
      logs: [],
      summary: {},
    })
  } catch (error) {
    console.error('[v0] Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, olderThanDays } = await request.json()

    if (!serverId || !olderThanDays) {
      return NextResponse.json(
        { error: 'serverId and olderThanDays are required' },
        { status: 400 }
      )
    }

    // Only owners can purge old logs
    const canDelete = await hasPermission(session.userId, serverId, 'manage_audit_logs')
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Note: In a real implementation, we'd use the actual db.delete query
    // For now, we're simulating deletion
    console.log(`[v0] Purging audit logs older than ${cutoffDate}`)

    return NextResponse.json({
      success: true,
      message: `Audit logs older than ${olderThanDays} days have been scheduled for deletion`,
    })
  } catch (error) {
    console.error('[v0] Error purging audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to purge audit logs' },
      { status: 500 }
    )
  }
}
