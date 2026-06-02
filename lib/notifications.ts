import { sendNotification, sendDMNotification } from '@/lib/discord-bot'

export interface InfractionNotification {
  serverId: string
  infractionType: string
  targetUserId: string
  targetUsername: string
  moderatorUsername: string
  reason: string
  severity?: number
  duration?: number
  appealable?: boolean
}

export interface AppealNotification {
  serverId: string
  infractionType: string
  targetUserId: string
  targetUsername: string
  appealReason: string
  severity?: number
}

export interface ReportNotification {
  serverId: string
  reportedUserId: string
  reportedUsername: string
  reporterUsername: string
  reportType: string
  reason: string
}

export interface StaffActionNotification {
  serverId: string
  staffUsername: string
  actionType: string
  pointsChange: number
  reason: string
  newStatus?: string
}

export async function notifyInfraction(data: InfractionNotification): Promise<void> {
  try {
    const severityLevel = ['Low', 'Medium', 'High', 'Critical'][Math.min((data.severity || 1) - 1, 3)]

    // Notify staff in channel
    await sendNotification({
      serverId: data.serverId,
      type: 'infraction',
      title: `⚠️ Infraction Issued: ${data.infractionType}`,
      description: `User **${data.targetUsername}** has received a ${data.infractionType} for: ${data.reason}`,
      username: data.targetUsername,
      userId: data.targetUserId,
      details: {
        'Moderator': data.moderatorUsername,
        'Severity': severityLevel,
        'Appealable': data.appealable ? 'Yes' : 'No',
        ...(data.duration && { 'Duration': formatDuration(data.duration) }),
      },
    })

    // Notify user via DM
    await sendDMNotification(data.targetUserId, {
      type: 'infraction',
      title: `You have received an infraction`,
      description: `You received a **${data.infractionType}** for: ${data.reason}`,
      username: data.targetUsername,
      details: {
        'Moderator': data.moderatorUsername,
        'Severity': severityLevel,
        'Appealable': data.appealable ? 'Yes' : 'No',
      },
    })

    console.log(`[v0] Infraction notification sent for ${data.targetUsername}`)
  } catch (error) {
    console.error('[v0] Error sending infraction notification:', error)
  }
}

export async function notifyAppeal(data: AppealNotification): Promise<void> {
  try {
    await sendNotification({
      serverId: data.serverId,
      type: 'appeal',
      title: `📋 Infraction Appeal Submitted`,
      description: `**${data.targetUsername}** has appealed their ${data.infractionType} infraction`,
      username: data.targetUsername,
      userId: data.targetUserId,
      details: {
        'Appeal Reason': data.appealReason,
        'Original Infraction': data.infractionType,
        'Status': 'Pending Review',
      },
    })

    console.log(`[v0] Appeal notification sent for ${data.targetUsername}`)
  } catch (error) {
    console.error('[v0] Error sending appeal notification:', error)
  }
}

export async function notifyReport(data: ReportNotification): Promise<void> {
  try {
    await sendNotification({
      serverId: data.serverId,
      type: 'report',
      title: `🚩 Member Report Submitted`,
      description: `**${data.reporterUsername}** reported **${data.reportedUsername}** for ${data.reportType.toLowerCase()}`,
      details: {
        'Report Type': data.reportType,
        'Reason': data.reason,
        'Status': 'Pending Investigation',
      },
    })

    console.log(`[v0] Report notification sent`)
  } catch (error) {
    console.error('[v0] Error sending report notification:', error)
  }
}

export async function notifyStaffAction(data: StaffActionNotification): Promise<void> {
  try {
    const actionDescriptions = {
      warning: 'Warning issued',
      deduction: 'Points deducted',
      suspension: 'Suspended',
      removal: 'Removed from staff',
    }

    const description = actionDescriptions[data.actionType as keyof typeof actionDescriptions] || data.actionType

    await sendNotification({
      serverId: data.serverId,
      type: 'staff_action',
      title: `👤 Staff Member Action`,
      description: `Staff member **${data.staffUsername}** has been ${description}`,
      username: data.staffUsername,
      details: {
        'Action': data.actionType,
        'Points Change': `${data.pointsChange > 0 ? '+' : ''}${data.pointsChange}`,
        'Reason': data.reason,
        ...(data.newStatus && { 'New Status': data.newStatus }),
      },
      color: data.pointsChange < 0 ? 0xef4444 : 0x10b981, // red for negative, green for positive
    })

    console.log(`[v0] Staff action notification sent for ${data.staffUsername}`)
  } catch (error) {
    console.error('[v0] Error sending staff action notification:', error)
  }
}

export async function notifyAppealResolution(
  serverId: string,
  username: string,
  userId: string,
  status: 'approved' | 'denied',
  reason?: string
): Promise<void> {
  try {
    const result = status === 'approved' ? '✅ Approved' : '❌ Denied'

    await sendNotification({
      serverId,
      type: 'appeal',
      title: `Appeal ${result}`,
      description: `Your appeal has been **${status}**`,
      username,
      userId,
      details: reason ? { 'Reviewer Notes': reason } : undefined,
      color: status === 'approved' ? 0x10b981 : 0xef4444,
    })

    // Also send DM
    await sendDMNotification(userId, {
      type: 'appeal',
      title: `Your Appeal has been ${status}`,
      description: `Your infraction appeal has been **${status}**`,
      username,
      details: reason ? { 'Reviewer Notes': reason } : undefined,
      color: status === 'approved' ? 0x10b981 : 0xef4444,
    })

    console.log(`[v0] Appeal resolution notification sent to ${username}`)
  } catch (error) {
    console.error('[v0] Error sending appeal resolution notification:', error)
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}
