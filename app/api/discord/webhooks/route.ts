import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { moderationLogs } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { sendWebhookLogWithAction } from '@/lib/discord-webhook-logger'

interface DiscordAuditLogEntry {
  id: string
  user_id: string
  action_type: number
  target_id: string
  reason?: string
  changes?: Array<{
    key: string
    old_value?: unknown
    new_value?: unknown
  }>
  created_at: string
}

// Discord audit log action types
const AUDIT_LOG_ACTIONS = {
  KICK: 20,
  BAN: 22,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 32,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guild_id, user_id, action_type, target_id, reason, webhook_url, duration } = body

    // Validate required fields
    if (!guild_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log moderation action
    let actionType = 'unknown'
    if (action_type === 'kick') actionType = 'kick'
    if (action_type === 'ban') actionType = 'ban'
    if (action_type === 'timeout') actionType = 'timeout'
    if (action_type === 'mute') actionType = 'mute'

    const moderatorUsername = body.moderator_username || 'Discord Bot'
    const targetUsername = body.target_username || 'Unknown'

    // Insert into database
    await db.insert(moderationLogs).values({
      id: nanoid(),
      serverId: guild_id,
      targetUserId: target_id || 'unknown',
      targetUsername,
      moderatorId: user_id,
      moderatorUsername,
      actionType,
      reason: reason || body.reason,
      duration,
    })

    console.log(`[v0] Webhook: Logged moderation action ${actionType} in guild ${guild_id}`)

    // Send Discord webhook log if webhook_url is provided
    if (webhook_url) {
      const title = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Action Logged`
      await sendWebhookLogWithAction(
        webhook_url,
        title,
        moderatorUsername,
        user_id,
        targetUsername,
        target_id || 'unknown',
        actionType,
        reason || body.reason,
        duration
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error processing Discord webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
