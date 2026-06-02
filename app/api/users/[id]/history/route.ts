import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, access_logs } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const userId = searchParams.get('userId')

    if (!serverId || !userId) {
      return NextResponse.json(
        { error: 'serverId and userId are required' },
        { status: 400 }
      )
    }

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_infractions')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all infractions for user
    const userInfractions = await db
      .select()
      .from(infractions_detailed)
      .where((row) => row.targetUserId === userId)

    // Sort by date
    const sorted = userInfractions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Calculate totals
    const totalPoints = sorted.reduce((sum, i) => sum + (i.points || 0), 0)
    const activeInfractions = sorted.filter(
      (i) => !i.expiresAt || new Date(i.expiresAt) > new Date()
    )

    // Log access
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'view_user_history',
      resource: `user_history:${userId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      userId,
      profile: {
        totalInfractions: sorted.length,
        activeInfractions: activeInfractions.length,
        totalPoints,
        lastInfractionDate: sorted.length > 0 ? sorted[0].createdAt : null,
        firstInfractionDate: sorted.length > 0 ? sorted[sorted.length - 1].createdAt : null,
      },
      history: sorted,
    })
  } catch (error) {
    console.error('[v0] Error fetching user history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    )
  }
}
