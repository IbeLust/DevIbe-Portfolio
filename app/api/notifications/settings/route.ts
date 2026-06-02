import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'

// In-memory notification settings (in production, store in database)
const notificationSettings = new Map<string, Record<string, any>>()

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

    const key = `${session.userId}:${serverId}`
    const settings = notificationSettings.get(key) || getDefaultNotificationSettings()

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('[v0] Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, settings } = await request.json()

    if (!serverId || !settings) {
      return NextResponse.json(
        { error: 'serverId and settings are required' },
        { status: 400 }
      )
    }

    const key = `${session.userId}:${serverId}`
    notificationSettings.set(key, settings)

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated',
    })
  } catch (error) {
    console.error('[v0] Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

function getDefaultNotificationSettings() {
  return {
    emailNotifications: true,
    dmNotifications: true,
    discordWebhook: '',
    notifyOn: {
      infractionCreated: true,
      reportSubmitted: true,
      appealSubmitted: true,
      appealResolved: true,
      staffActionTaken: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    batchNotifications: {
      enabled: false,
      frequency: 'daily', // 'hourly', 'daily', 'weekly'
    },
  }
}
