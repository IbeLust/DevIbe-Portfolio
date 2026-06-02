const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID

interface NotificationOptions {
  serverId: string
  type: 'infraction' | 'appeal' | 'report' | 'staff_action' | 'warning'
  title: string
  description: string
  userId?: string
  username?: string
  details?: Record<string, string>
  color?: number
}

const API_BASE = 'https://discord.com/api/v10'

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    Authorization: `Bot ${DISCORD_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function initializeBot(): Promise<any> {
  // Verify bot token is valid
  try {
    const botUser = await apiCall('/users/@me')
    console.log(`[v0] Discord bot ready as ${botUser.username}`)
    return { isReady: () => true }
  } catch (error) {
    console.error('[v0] Failed to initialize bot:', error)
    return { isReady: () => false }
  }
}

export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  try {
    // Get the guild
    const guild = await apiCall(`/guilds/${options.serverId}`)
    if (!guild) {
      console.error('[v0] Guild not found:', options.serverId)
      return false
    }

    // List channels to find or create notifications channel
    const channels = await apiCall(`/guilds/${options.serverId}/channels`)
    let notificationChannel = channels.find(
      (ch: any) => ch.name === 'admin-notifications' && ch.type === 0
    )

    if (!notificationChannel) {
      try {
        notificationChannel = await apiCall(`/guilds/${options.serverId}/channels`, {
          method: 'POST',
          body: JSON.stringify({
            name: 'admin-notifications',
            type: 0,
            topic: 'Admin Panel moderation and action notifications',
          }),
        })
      } catch (error) {
        console.error('[v0] Failed to create notifications channel:', error)
        return false
      }
    }

    // Create embed
    const embed = createNotificationEmbed(options)

    // Send notification
    await apiCall(`/channels/${notificationChannel.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ embeds: [embed] }),
    })

    console.log(`[v0] Notification sent to ${guild.name}`)
    return true
  } catch (error) {
    console.error('[v0] Error sending notification:', error)
    return false
  }
}

function createNotificationEmbed(options: NotificationOptions): any {
  const colorMap = {
    infraction: 16711680, // red (0xef4444)
    appeal: 4017727, // blue (0x3b82f6)
    report: 16157439, // amber (0xf59e0b)
    staff_action: 9175039, // purple (0x8b5cf6)
    warning: 14991144, // yellow (0xeab308)
  }

  const embed = {
    title: options.title,
    description: options.description,
    color: options.color || colorMap[options.type],
    timestamp: new Date().toISOString(),
    footer: { text: 'Discord Admin Panel' },
    fields: [] as any[],
  }

  if (options.username) {
    embed.fields.push({
      name: 'User',
      value: `${options.username}${options.userId ? ` (${options.userId})` : ''}`,
      inline: true,
    })
  }

  if (options.details) {
    Object.entries(options.details).forEach(([key, value]) => {
      embed.fields.push({
        name: key,
        value: value,
        inline: true,
      })
    })
  }

  return embed
}

export async function sendDMNotification(
  userId: string,
  options: Omit<NotificationOptions, 'serverId'>
): Promise<boolean> {
  try {
    // Create DM channel
    const dmChannel = await apiCall('/users/@me/channels', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: userId }),
    })

    if (!dmChannel) {
      console.error('[v0] Failed to create DM channel with user:', userId)
      return false
    }

    const embed = createNotificationEmbed({
      ...options,
      serverId: '', // Not needed for DM
    })

    await apiCall(`/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ embeds: [embed] }),
    })

    console.log(`[v0] DM notification sent to user ${userId}`)
    return true
  } catch (error) {
    console.error('[v0] Error sending DM notification:', error)
    return false
  }
}

export async function executeModeration(
  serverId: string,
  userId: string,
  username: string,
  action: 'kick' | 'ban' | 'mute' | 'timeout',
  reason: string,
  duration?: number
): Promise<boolean> {
  try {
    const guild = await apiCall(`/guilds/${serverId}`)
    if (!guild) {
      console.error('[v0] Guild not found for moderation:', serverId)
      return false
    }

    switch (action) {
      case 'kick':
        await apiCall(`/guilds/${serverId}/members/${userId}`, {
          method: 'DELETE',
          body: JSON.stringify({ reason }),
        })
        console.log(`[v0] Kicked ${username} from ${guild.name}`)
        break

      case 'ban':
        await apiCall(`/guilds/${serverId}/bans/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ reason }),
        })
        console.log(`[v0] Banned ${username} from ${guild.name}`)
        break

      case 'timeout':
      case 'mute':
        if (duration) {
          const communicationDisabledUntil = new Date(
            Date.now() + duration
          ).toISOString()
          await apiCall(`/guilds/${serverId}/members/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              communication_disabled_until: communicationDisabledUntil,
            }),
          })
          console.log(
            `[v0] ${action === 'timeout' ? 'Timed out' : 'Muted'} ${username} for ${duration}ms in ${guild.name}`
          )
        }
        break
    }

    return true
  } catch (error) {
    console.error('[v0] Error executing moderation action:', error)
    return false
  }
}

export function getBot(): any {
  return { isReady: () => true }
}
