import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Discord Admin Panel app tables ----------------------------------------

export const discordServers = pgTable('discord_servers', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  serverId: text('serverId').notNull(),
  serverName: text('serverName').notNull(),
  adminRoleId: text('adminRoleId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const discordMembers = pgTable('discord_members', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  userId: text('userId').notNull(),
  username: text('username').notNull(),
  avatar: text('avatar'),
  joinedAt: timestamp('joinedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const moderationLogs = pgTable('moderation_logs', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  targetUserId: text('targetUserId').notNull(),
  targetUsername: text('targetUsername').notNull(),
  moderatorId: text('moderatorId').notNull(),
  moderatorUsername: text('moderatorUsername').notNull(),
  actionType: text('actionType').notNull(), // 'ban', 'kick', 'mute', 'timeout', 'warn'
  reason: text('reason'),
  duration: integer('duration'), // in milliseconds for timeouts
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const infractions = pgTable('infractions', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  userId: text('userId').notNull(),
  username: text('username').notNull(),
  infractionType: text('infractionType').notNull(), // 'warning', 'mute', 'timeout', 'kick', 'ban'
  severity: integer('severity'), // 1-5 scale
  reason: text('reason'),
  moderatorId: text('moderatorId'),
  moderatorUsername: text('moderatorUsername'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const serverRoles = pgTable('server_roles', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  roleId: text('roleId').notNull(),
  roleName: text('roleName').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const erlcLogs = pgTable('erlc_logs', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  actionType: text('actionType').notNull(),
  targetPlayer: text('targetPlayer'),
  executedBy: text('executedBy'),
  details: jsonb('details'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- New RBAC and Infractions Tables -------------------------------------------

export const user_roles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  serverId: text('serverId').notNull(),
  roleType: text('roleType').notNull(), // 'owner', 'manager', 'moderator', 'staff', 'member'
  permissions: text('permissions').array(),
  grantedBy: text('grantedBy'),
  grantedAt: timestamp('grantedAt').notNull().defaultNow(),
})

export const role_permissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleType: text('roleType').notNull(),
  permissionCode: text('permissionCode').notNull(),
  permissionName: text('permissionName').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const infractions_detailed = pgTable('infractions_detailed', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  targetUserId: text('targetUserId').notNull(),
  targetUsername: text('targetUsername').notNull(),
  moderatorId: text('moderatorId').notNull(),
  moderatorUsername: text('moderatorUsername').notNull(),
  infractionType: text('infractionType').notNull(),
  severity: integer('severity'),
  points: integer('points').default(0),
  reason: text('reason'),
  duration: integer('duration'),
  appealable: boolean('appealable').default(true),
  appealedAt: timestamp('appealedAt'),
  appealResult: text('appealResult'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt'),
})

export const staff_points = pgTable('staff_points', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  staffUserId: text('staffUserId').notNull(),
  staffUsername: text('staffUsername').notNull(),
  pointsBalance: integer('pointsBalance').default(0),
  totalPointsEarned: integer('totalPointsEarned').default(0),
  totalPointsLost: integer('totalPointsLost').default(0),
  warningLevel: integer('warningLevel').default(0),
  status: text('status').default('active'), // 'active', 'suspended', 'removed'
  suspendedUntil: timestamp('suspendedUntil'),
  suspensionReason: text('suspensionReason'),
  lastUpdated: timestamp('lastUpdated').notNull().defaultNow(),
})

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  reporterUserId: text('reporterUserId').notNull(),
  reporterUsername: text('reporterUsername').notNull(),
  reportedUserId: text('reportedUserId').notNull(),
  reportedUsername: text('reportedUsername').notNull(),
  reportType: text('reportType').notNull(),
  reason: text('reason').notNull(),
  evidence: text('evidence'),
  status: text('status').default('pending'),
  reviewedBy: text('reviewedBy'),
  reviewResult: text('reviewResult'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  resolvedAt: timestamp('resolvedAt'),
})

export const appeals = pgTable('appeals', {
  id: text('id').primaryKey(),
  infractionId: text('infractionId').notNull(),
  serverId: text('serverId').notNull(),
  appealantUserId: text('appealantUserId').notNull(),
  appealantUsername: text('appealantUsername').notNull(),
  appealReason: text('appealReason').notNull(),
  status: text('status').default('pending'),
  reviewedBy: text('reviewedBy'),
  reviewerNotes: text('reviewerNotes'),
  reviewedAt: timestamp('reviewedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const access_logs = pgTable('access_logs', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  serverId: text('serverId').notNull(),
  action: text('action').notNull(),
  resource: text('resource'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  success: boolean('success').default(true),
  errorMessage: text('errorMessage'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const warning_templates = pgTable('warning_templates', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  templateName: text('templateName').notNull(),
  templateContent: text('templateContent').notNull(),
  infractionType: text('infractionType').notNull(),
  pointValue: integer('pointValue'),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const scheduled_actions = pgTable('scheduled_actions', {
  id: text('id').primaryKey(),
  serverId: text('serverId').notNull(),
  actionType: text('actionType').notNull(),
  targetUserId: text('targetUserId').notNull(),
  targetUsername: text('targetUsername').notNull(),
  scheduledFor: timestamp('scheduledFor').notNull(),
  executedAt: timestamp('executedAt'),
  status: text('status').default('pending'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
