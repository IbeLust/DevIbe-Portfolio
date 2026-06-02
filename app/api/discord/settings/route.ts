import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'

interface ServerSettings {
  notificationsEnabled: boolean
  modLogChannel: string
  appealChannel: string
  reportChannel: string
  staffChannel: string
  autoModEnabled: boolean
  spamThreshold: number
  muteOnSpam: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, settings } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canManageSettings = await hasPermission(session.userId, serverId, 'manage_settings')
    if (!canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate settings
    const validatedSettings: ServerSettings = {
      notificationsEnabled: settings.notificationsEnabled ?? true,
      modLogChannel: settings.modLogChannel || 'admin-notifications',
      appealChannel: settings.appealChannel || 'appeals',
      reportChannel: settings.reportChannel || 'reports',
      staffChannel: settings.staffChannel || 'staff-logs',
      autoModEnabled: settings.autoModEnabled ?? false,
      spamThreshold: Math.max(1, Math.min(50, settings.spamThreshold || 5)),
      muteOnSpam: settings.muteOnSpam ?? false,
    }

    // TODO: Save settings to database
    // For now, just return success
    console.log(`[v0] Updated settings for server ${serverId}:`, validatedSettings)

    return NextResponse.json({
      success: true,
      settings: validatedSettings,
    })
  } catch (error) {
    console.error('[v0] Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
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
    const canViewSettings = await hasPermission(session.userId, serverId, 'view_settings')
    if (!canViewSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // TODO: Fetch settings from database
    // For now, return defaults
    const defaultSettings: ServerSettings = {
      notificationsEnabled: true,
      modLogChannel: 'admin-notifications',
      appealChannel: 'appeals',
      reportChannel: 'reports',
      staffChannel: 'staff-logs',
      autoModEnabled: false,
      spamThreshold: 5,
      muteOnSpam: false,
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    })
  } catch (error) {
    console.error('[v0] Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
