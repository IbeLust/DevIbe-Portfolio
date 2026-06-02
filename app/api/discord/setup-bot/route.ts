import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canManageSettings = await hasPermission(session.userId, serverId, 'manage_settings')
    if (!canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    // Use Discord REST API instead of discord.js
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    })

    if (!guildResponse.ok) {
      if (guildResponse.status === 404) {
        return NextResponse.json({ error: 'Guild not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch guild' }, { status: 500 })
    }

    const guild = await guildResponse.json()

    // Check bot member permissions
    const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/@me`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    })

    if (!memberResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch bot member' }, { status: 500 })
    }

    const member = await memberResponse.json()
    const botPermissions = member.permissions ? parseInt(member.permissions) : 0

    // Required permissions bitmask
    const SEND_MESSAGES = 1 << 11
    const MANAGE_MESSAGES = 1 << 13
    const MODERATE_MEMBERS = 1 << 40
    const BAN_MEMBERS = 1 << 2
    const KICK_MEMBERS = 1 << 1
    const MANAGE_CHANNELS = 1 << 4
    const MANAGE_ROLES = 1 << 12

    const requiredPermissions = {
      sendMessages: !!(botPermissions & SEND_MESSAGES),
      manageMessages: !!(botPermissions & MANAGE_MESSAGES),
      moderateMembers: !!(botPermissions & MODERATE_MEMBERS),
      banMembers: !!(botPermissions & BAN_MEMBERS),
      kickMembers: !!(botPermissions & KICK_MEMBERS),
      manageChannels: !!(botPermissions & MANAGE_CHANNELS),
      manageRoles: !!(botPermissions & MANAGE_ROLES),
    }

    const allPermissionsOk = Object.values(requiredPermissions).every((p) => p)

    if (!allPermissionsOk) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bot is missing required permissions',
          permissions: requiredPermissions,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        memberCount: guild.approximate_member_count || 0,
      },
      botPermissions: requiredPermissions,
      message: 'Bot successfully configured for this server',
    })
  } catch (error) {
    console.error('[v0] Error setting up bot:', error)
    return NextResponse.json(
      { error: 'Failed to setup bot' },
      { status: 500 }
    )
  }
}
