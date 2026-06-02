import { createSession } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { user_roles, discordServers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1407048832973406349'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://v0-devibe6test.vercel.app'

interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface DiscordUserResponse {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string
}

interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return new Response('Missing authorization code', { status: 400 })
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('[v0] Discord token error:', error)
      return new Response('Failed to exchange code for token', { status: 400 })
    }

    const tokenData: DiscordTokenResponse = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('[v0] Discord user fetch failed')
      return new Response('Failed to fetch user info', { status: 400 })
    }

    const discordUser: DiscordUserResponse = await userResponse.json()

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    let userGuilds: DiscordGuild[] = []
    if (guildsResponse.ok) {
      userGuilds = await guildsResponse.json()
    }

    // Filter for guilds where user is owner
    const ownedGuilds = userGuilds.filter((g: DiscordGuild) => g.owner || (g.permissions & 0x8) === 0x8)

    console.log('[v0] User has', ownedGuilds.length, 'owned/admin guilds')

    // Create session
    await createSession({
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email,
    })

    // Assign roles for owned guilds
    for (const guild of ownedGuilds) {
      try {
        // Check if user has a role in this guild
        const existingRole = await db
          .select()
          .from(user_roles)
          .where(
            and(
              eq(user_roles.userId, discordUser.id),
              eq(user_roles.serverId, guild.id)
            )
          )
          .limit(1)

        if (existingRole.length === 0) {
          // Assign owner role
          await db.insert(user_roles).values({
            id: nanoid(),
            userId: discordUser.id,
            serverId: guild.id,
            roleType: 'owner',
            grantedAt: new Date(),
          })
          console.log('[v0] Assigned owner role to', discordUser.username, 'for guild', guild.id)
        }

        // Ensure server exists in database
        const existingServer = await db
          .select()
          .from(discordServers)
          .where(eq(discordServers.serverId, guild.id))
          .limit(1)

        if (existingServer.length === 0) {
          await db.insert(discordServers).values({
            id: nanoid(),
            serverId: guild.id,
            serverName: guild.name,
            userId: discordUser.id,
            createdAt: new Date(),
          })
        }
      } catch (error) {
        console.error('[v0] Error assigning role for guild', guild.id, ':', error)
      }
    }

    // Redirect to dashboard
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
      },
    })
  } catch (error) {
    console.error('[v0] OAuth error:', error)
    return new Response('Authentication failed', { status: 500 })
  }
}
