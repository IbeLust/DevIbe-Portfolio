import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface DiscordUser {
  id: string
  username: string
  email: string
  avatar?: string
  guilds?: DiscordGuild[]
}

export interface DiscordGuild {
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: number
}

export async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<string> {
  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await tokenResponse.json()
    return data.access_token
  } catch (error) {
    console.error('[v0] Error exchanging code for token:', error)
    throw error
  }
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Discord user')
    }

    const userData = await response.json()
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
    }
  } catch (error) {
    console.error('[v0] Error getting Discord user:', error)
    throw error
  }
}

export async function getDiscordUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  try {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Discord guilds')
    }

    const guilds = await response.json()
    return guilds.map((g: any) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: (g.permissions & 0x8) === 0x8, // ADMINISTRATOR permission
      permissions: g.permissions,
    }))
  } catch (error) {
    console.error('[v0] Error getting Discord guilds:', error)
    throw error
  }
}

export async function verifyUserInGuild(userId: string, guildId: string, accessToken: string): Promise<boolean> {
  try {
    const guilds = await getDiscordUserGuilds(accessToken)
    return guilds.some(g => g.id === guildId && g.owner)
  } catch (error) {
    console.error('[v0] Error verifying user in guild:', error)
    return false
  }
}

export async function createOrUpdateDiscordUser(discordUser: DiscordUser) {
  try {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, discordUser.id),
    })

    if (existingUser) {
      // Update user
      await db.update(user)
        .set({
          username: discordUser.username,
          email: discordUser.email,
          image: discordUser.avatar,
        })
        .where(eq(user.id, discordUser.id))
      return existingUser
    } else {
      // Create new user
      const newUser = {
        id: discordUser.id,
        name: discordUser.username,
        username: discordUser.username,
        email: discordUser.email,
        image: discordUser.avatar,
        emailVerified: new Date(),
        createdAt: new Date(),
      }
      await db.insert(user).values(newUser)
      return newUser
    }
  } catch (error) {
    console.error('[v0] Error creating/updating Discord user:', error)
    throw error
  }
}

export async function getDiscordUserInfo(userId: string) {
  try {
    const discordUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })
    return discordUser
  } catch (error) {
    console.error('[v0] Error getting Discord user info:', error)
    return null
  }
}
