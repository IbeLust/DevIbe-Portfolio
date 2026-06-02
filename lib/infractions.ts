import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export type InfractionType = 'warning' | 'mute' | 'timeout' | 'kick' | 'ban' | 'strike'

export const INFRACTION_POINTS: Record<InfractionType, number> = {
  warning: 1,
  mute: 3,
  timeout: 5,
  kick: 10,
  ban: 25,
  strike: 2,
}

export const SEVERITY_LEVELS: Record<InfractionType, number> = {
  warning: 1,
  strike: 1,
  mute: 2,
  timeout: 3,
  kick: 4,
  ban: 5,
}

export const ESCALATION_THRESHOLDS = {
  autoMute: 5,      // Auto mute after 5 points
  autoTimeout: 10,   // Auto timeout after 10 points
  autoKick: 20,      // Auto kick after 20 points
  autoban: 30,       // Auto ban after 30 points
}

export interface InfractionInput {
  serverId: string
  targetUserId: string
  targetUsername: string
  moderatorId: string
  moderatorUsername: string
  infractionType: InfractionType
  reason: string
  duration?: number
  appealable?: boolean
}

export async function issueInfraction(input: InfractionInput) {
  try {
    const id = nanoid()
    const points = INFRACTION_POINTS[input.infractionType]
    const severity = SEVERITY_LEVELS[input.infractionType]

    const result = await db.query.infractions_detailed.create({
      id,
      serverId: input.serverId,
      targetUserId: input.targetUserId,
      targetUsername: input.targetUsername,
      moderatorId: input.moderatorId,
      moderatorUsername: input.moderatorUsername,
      infractionType: input.infractionType,
      points,
      severity,
      reason: input.reason,
      duration: input.duration,
      appealable: input.appealable !== false,
      createdAt: new Date(),
    })

    console.log('[v0] Infraction issued:', id)

    // Trigger notification to moderator
    await notifyModerator(input.moderatorId, input.targetUsername, input.infractionType, id)

    // Send DM to staff member
    await sendInfractionDM(input.targetUserId, input.targetUsername, input)

    // Check for auto-escalation
    await checkAutoEscalation(input.serverId, input.targetUserId, points)

    return result
  } catch (error) {
    console.error('[v0] Error issuing infraction:', error)
    throw error
  }
}

export async function getInfractionHistory(targetUserId: string, serverId: string) {
  try {
    const infractions = await db.query.infractions_detailed.findMany({
      where: (infr, { eq, and }) => and(
        eq(infr.targetUserId, targetUserId),
        eq(infr.serverId, serverId)
      ),
      orderBy: (infr, { desc }) => desc(infr.createdAt),
    })
    return infractions
  } catch (error) {
    console.error('[v0] Error getting infraction history:', error)
    return []
  }
}

export async function getUserInfractionPoints(targetUserId: string, serverId: string): Promise<number> {
  try {
    const infractions = await db.query.infractions_detailed.findMany({
      where: (infr, { eq, and }) => and(
        eq(infr.targetUserId, targetUserId),
        eq(infr.serverId, serverId),
        eq(infr.status, 'active')
      ),
    })

    const totalPoints = infractions.reduce((sum, inf) => sum + (inf.points || 0), 0)
    return totalPoints
  } catch (error) {
    console.error('[v0] Error getting user points:', error)
    return 0
  }
}

export async function checkAutoEscalation(serverId: string, targetUserId: string, newPoints: number) {
  try {
    const currentPoints = await getUserInfractionPoints(targetUserId, serverId)
    const totalPoints = currentPoints + newPoints

    if (totalPoints >= ESCALATION_THRESHOLDS.autoban) {
      console.log('[v0] Auto-ban threshold reached for user:', targetUserId)
      // Trigger auto-ban logic
    } else if (totalPoints >= ESCALATION_THRESHOLDS.autoKick) {
      console.log('[v0] Auto-kick threshold reached for user:', targetUserId)
      // Trigger auto-kick logic
    } else if (totalPoints >= ESCALATION_THRESHOLDS.autoTimeout) {
      console.log('[v0] Auto-timeout threshold reached for user:', targetUserId)
      // Trigger auto-timeout logic
    } else if (totalPoints >= ESCALATION_THRESHOLDS.autoMute) {
      console.log('[v0] Auto-mute threshold reached for user:', targetUserId)
      // Trigger auto-mute logic
    }
  } catch (error) {
    console.error('[v0] Error checking auto-escalation:', error)
  }
}

export async function notifyModerator(moderatorId: string, targetUsername: string, infractionType: InfractionType, infractionId: string) {
  // This will be integrated with Discord bot
  console.log(`[v0] Notify moderator: ${moderatorId} about ${targetUsername} - ${infractionType} (${infractionId})`)
}

export async function sendInfractionDM(targetUserId: string, targetUsername: string, input: InfractionInput) {
  // This will be integrated with Discord bot
  console.log(`[v0] Send DM to ${targetUsername}: Infraction issued - ${input.infractionType} for ${input.reason}`)
}

export async function appealInfraction(infractionId: string, reason: string) {
  try {
    const infraction = await db.query.infractions_detailed.findFirst({
      where: (infr, { eq }) => eq(infr.id, infractionId),
    })

    if (!infraction || !infraction.appealable) {
      throw new Error('This infraction cannot be appealed')
    }

    const appealId = nanoid()
    
    // Create appeal record
    await db.query.appeals.create({
      id: appealId,
      infractionId,
      serverId: infraction.serverId,
      appealantUserId: infraction.targetUserId,
      appealantUsername: infraction.targetUsername,
      appealReason: reason,
      status: 'pending',
      createdAt: new Date(),
    })

    console.log('[v0] Appeal created:', appealId)
    return appealId
  } catch (error) {
    console.error('[v0] Error appealing infraction:', error)
    throw error
  }
}
