import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { discordServers } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { serverId, serverName, adminRoleId } = await request.json()

    if (!serverId || !serverName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Add server to database
    const newServer = await db
      .insert(discordServers)
      .values({
        id: nanoid(),
        userId: session.userId,
        serverId,
        serverName,
        adminRoleId: adminRoleId || null,
      })
      .returning()

    return new Response(JSON.stringify(newServer[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[v0] Error adding server:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to add server' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
