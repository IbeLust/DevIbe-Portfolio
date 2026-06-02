import { db } from '@/lib/db'
import { user_roles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export type RoleType = 'owner' | 'manager' | 'moderator' | 'staff' | 'member'

export type Permission = 
  | 'manage_members' 
  | 'manage_roles' 
  | 'issue_infractions' 
  | 'view_infractions' 
  | 'review_appeals' 
  | 'view_reports' 
  | 'manage_staff' 
  | 'view_analytics' 
  | 'manage_settings'
  | 'view_access_logs'

const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  owner: [
    'manage_members',
    'manage_roles',
    'issue_infractions',
    'view_infractions',
    'review_appeals',
    'view_reports',
    'manage_staff',
    'view_analytics',
    'manage_settings',
    'view_access_logs',
  ],
  manager: [
    'manage_members',
    'issue_infractions',
    'view_infractions',
    'review_appeals',
    'view_reports',
    'manage_staff',
    'view_analytics',
  ],
  moderator: [
    'issue_infractions',
    'view_infractions',
    'view_reports',
    'view_analytics',
  ],
  staff: [
    'view_infractions',
    'view_reports',
  ],
  member: [],
}

export async function getUserRole(userId: string, serverId: string): Promise<RoleType | null> {
  try {
    const role = await db
      .select()
      .from(user_roles)
      .where(and(eq(user_roles.userId, userId), eq(user_roles.serverId, serverId)))
      .limit(1)

    return (role[0]?.roleType as RoleType) || null
  } catch (error) {
    console.error('[v0] Error getting user role:', error)
    return null
  }
}

export async function hasPermission(
  userId: string,
  serverId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const role = await getUserRole(userId, serverId)
    if (!role) return false
    
    const permissions = ROLE_PERMISSIONS[role]
    return permissions.includes(permission)
  } catch (error) {
    console.error('[v0] Error checking permission:', error)
    return false
  }
}

export async function requirePermission(
  userId: string,
  serverId: string,
  permission: Permission
): Promise<void> {
  const hasAccess = await hasPermission(userId, serverId, permission)
  if (!hasAccess) {
    throw new Error(`Insufficient permissions: ${permission}`)
  }
}

export function getPermissionsByRole(role: RoleType): Permission[] {
  return ROLE_PERMISSIONS[role]
}
