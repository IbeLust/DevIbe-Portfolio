import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { staff_points } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, staffUserId, staffUsername, pointsChange, reason, action } = await request.json()

    // Check permissions - only owners and managers can manage staff
    const canManageStaff = await hasPermission(session.userId, serverId, 'manage_staff')
    if (!canManageStaff) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Find or create staff points record
    const existing = await db
      .select()
      .from(staff_points)
      .where(
        and(
          eq(staff_points.serverId, serverId),
          eq(staff_points.staffUserId, staffUserId)
        )
      )
      .limit(1)

    let staffRecord = existing[0]

    if (!staffRecord) {
      const newRecord = {
        id: nanoid(),
        serverId,
        staffUserId,
        staffUsername,
        pointsBalance: 0,
        totalPointsEarned: 0,
        totalPointsLost: 0,
        warningLevel: 0,
        status: 'active' as const,
        lastUpdated: new Date(),
      }
      await db.insert(staff_points).values(newRecord)
      staffRecord = newRecord
    }

    // Update points
    const newBalance = (staffRecord.pointsBalance || 0) + pointsChange
    const isLoss = pointsChange < 0
    const totalEarned = isLoss ? staffRecord.totalPointsEarned || 0 : (staffRecord.totalPointsEarned || 0) + pointsChange
    const totalLost = isLoss ? (staffRecord.totalPointsLost || 0) + Math.abs(pointsChange) : staffRecord.totalPointsLost || 0

    // Determine new warning level
    let newWarningLevel = staffRecord.warningLevel || 0
    let newStatus = staffRecord.status
    let suspendedUntil = null
    let suspensionReason = null

    if (newBalance <= -10) {
      newStatus = 'suspended'
      suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      suspensionReason = reason
      newWarningLevel = 3
    } else if (newBalance <= -5) {
      newWarningLevel = 2
    } else if (newBalance <= 0) {
      newWarningLevel = 1
    } else {
      newWarningLevel = 0
    }

    await db
      .update(staff_points)
      .set({
        pointsBalance: newBalance,
        totalPointsEarned: totalEarned,
        totalPointsLost: totalLost,
        warningLevel: newWarningLevel,
        status: newStatus,
        suspendedUntil,
        suspensionReason,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(staff_points.serverId, serverId),
          eq(staff_points.staffUserId, staffUserId)
        )
      )

    console.log(`[v0] Staff member ${staffUsername} points updated: ${pointsChange} (reason: ${reason})`)

    return NextResponse.json({
      success: true,
      staffRecord: {
        ...staffRecord,
        pointsBalance: newBalance,
        totalPointsEarned: totalEarned,
        totalPointsLost: totalLost,
        warningLevel: newWarningLevel,
        status: newStatus,
      },
    })
  } catch (error) {
    console.error('[v0] Error updating staff points:', error)
    return NextResponse.json(
      { error: 'Failed to update staff points' },
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

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canViewStaff = await hasPermission(session.userId, serverId, 'manage_staff')
    if (!canViewStaff) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const staffMembers = await db
      .select()
      .from(staff_points)
      .where(eq(staff_points.serverId, serverId))

    return NextResponse.json({
      success: true,
      staffMembers,
    })
  } catch (error) {
    console.error('[v0] Error fetching staff members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    )
  }
}
