'use server'

import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { discordServers, discordMembers, moderationLogs, infractions } from '@/lib/db/schema'
import { and, eq, desc, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await getSession()
  if (!session?.userId) throw new Error('Unauthorized')
  return session.userId
}

export async function getDiscordServers() {
  const userId = await getUserId()
  return db
    .select()
    .from(discordServers)
    .where(eq(discordServers.userId, userId))
    .orderBy(desc(discordServers.createdAt))
}

export async function addDiscordServer(
  serverId: string,
  serverName: string,
  adminRoleId: string
) {
  const userId = await getUserId()
  
  const id = `server_${Date.now()}`
  await db.insert(discordServers).values({
    id,
    userId,
    serverId,
    serverName,
    adminRoleId,
  })
  
  revalidatePath('/dashboard')
  return id
}

export async function getServerMembers(serverId: string) {
  const userId = await getUserId()
  
  // Verify user owns this server
  await db
    .select()
    .from(discordServers)
    .where(and(eq(discordServers.id, serverId), eq(discordServers.userId, userId)))
  
  return db
    .select()
    .from(discordMembers)
    .where(eq(discordMembers.serverId, serverId))
    .orderBy(desc(discordMembers.createdAt))
}

export async function getModerationLogs(serverId: string, limit: number = 50) {
  const userId = await getUserId()
  
  // Verify user owns this server
  await db
    .select()
    .from(discordServers)
    .where(and(eq(discordServers.id, serverId), eq(discordServers.userId, userId)))
  
  return db
    .select()
    .from(moderationLogs)
    .where(eq(moderationLogs.serverId, serverId))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(limit)
}

export async function getInfractions(serverId: string, userId?: string) {
  const authUserId = await getUserId()
  
  // Verify user owns this server
  await db
    .select()
    .from(discordServers)
    .where(and(eq(discordServers.id, serverId), eq(discordServers.userId, authUserId)))
  
  const where = userId
    ? and(eq(infractions.serverId, serverId), eq(infractions.userId, userId))
    : eq(infractions.serverId, serverId)
  
  return db
    .select()
    .from(infractions)
    .where(where)
    .orderBy(desc(infractions.createdAt))
}

export async function logModeration(
  serverId: string,
  targetUserId: string,
  targetUsername: string,
  moderatorId: string,
  moderatorUsername: string,
  actionType: 'ban' | 'kick' | 'mute' | 'timeout' | 'warn',
  reason?: string,
  duration?: number
) {
  const userId = await getUserId()
  
  // Verify user owns this server
  const server = await db
    .select()
    .from(discordServers)
    .where(and(eq(discordServers.id, serverId), eq(discordServers.userId, userId)))
  
  if (!server.length) throw new Error('Server not found')
  
  const logId = `log_${Date.now()}`
  await db.insert(moderationLogs).values({
    id: logId,
    serverId,
    targetUserId,
    targetUsername,
    moderatorId,
    moderatorUsername,
    actionType,
    reason: reason || null,
    duration: duration || null,
  })
  
  // Also create an infraction record
  const infractionId = `infr_${Date.now()}`
  const severityMap = {
    warn: 1,
    mute: 2,
    timeout: 2,
    kick: 3,
    ban: 5,
  }
  
  await db.insert(infractions).values({
    id: infractionId,
    serverId,
    userId: targetUserId,
    username: targetUsername,
    infractionType: actionType,
    severity: severityMap[actionType],
    reason: reason || null,
    moderatorId,
    moderatorUsername,
  })
  
  revalidatePath('/dashboard')
  return { logId, infractionId }
}

export async function getServerStats(serverId: string) {
  const userId = await getUserId()
  
  // Verify user owns this server
  await db
    .select()
    .from(discordServers)
    .where(and(eq(discordServers.id, serverId), eq(discordServers.userId, userId)))
  
  const membersCount = await db
    .select({ count: discordMembers.id })
    .from(discordMembers)
    .where(eq(discordMembers.serverId, serverId))
  
  const logsCount = await db
    .select({ count: moderationLogs.id })
    .from(moderationLogs)
    .where(eq(moderationLogs.serverId, serverId))
  
  const infraCount = await db
    .select({ count: infractions.id })
    .from(infractions)
    .where(eq(infractions.serverId, serverId))
  
  return {
    totalMembers: membersCount[0]?.count || 0,
    totalLogs: logsCount[0]?.count || 0,
    totalInfractions: infraCount[0]?.count || 0,
  }
}
