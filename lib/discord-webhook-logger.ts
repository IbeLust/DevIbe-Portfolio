interface WebhookLogPayload {
  title: string
  description?: string
  color?: number
  moderatorId?: string
  moderatorUsername?: string
  targetUserId?: string
  targetUsername?: string
  actionType?: string
  reason?: string
  duration?: number
  timestamp?: string
}

export async function sendWebhookLog(
  webhookUrl: string,
  payload: WebhookLogPayload
): Promise<boolean> {
  try {
    if (!webhookUrl) {
      console.log('[v0] No webhook URL provided, skipping webhook log')
      return false
    }

    const embed = {
      title: payload.title,
      description: payload.description || '',
      color: payload.color || 0x5865f2, // Discord Blurple
      fields: [
        ...(payload.moderatorUsername ? [{
          name: 'Moderator',
          value: `<@${payload.moderatorId}> (${payload.moderatorUsername})`,
          inline: true,
        }] : []),
        ...(payload.targetUsername ? [{
          name: 'Target User',
          value: `<@${payload.targetUserId}> (${payload.targetUsername})`,
          inline: true,
        }] : []),
        ...(payload.actionType ? [{
          name: 'Action',
          value: payload.actionType,
          inline: true,
        }] : []),
        ...(payload.reason ? [{
          name: 'Reason',
          value: payload.reason,
          inline: false,
        }] : []),
        ...(payload.duration ? [{
          name: 'Duration',
          value: `${payload.duration} seconds`,
          inline: true,
        }] : []),
      ],
      timestamp: payload.timestamp || new Date().toISOString(),
      footer: {
        text: 'DevIbe Moderation System',
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      console.error('[v0] Failed to send webhook log:', response.statusText)
      return false
    }

    console.log('[v0] Webhook log sent successfully')
    return true
  } catch (error) {
    console.error('[v0] Error sending webhook log:', error)
    return false
  }
}

export async function sendWebhookLogWithAction(
  webhookUrl: string,
  title: string,
  moderatorUsername: string,
  moderatorId: string,
  targetUsername: string,
  targetUserId: string,
  actionType: string,
  reason?: string,
  duration?: number
): Promise<boolean> {
  const actionColors: Record<string, number> = {
    kick: 0xffa500, // Orange
    ban: 0xff0000, // Red
    timeout: 0xffff00, // Yellow
    mute: 0x808080, // Gray
    warn: 0xffa500, // Orange
  }

  return sendWebhookLog(webhookUrl, {
    title,
    moderatorUsername,
    moderatorId,
    targetUsername,
    targetUserId,
    actionType,
    reason,
    duration,
    color: actionColors[actionType] || 0x5865f2,
  })
}
