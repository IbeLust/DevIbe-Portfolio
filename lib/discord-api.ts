const DISCORD_API_URL = 'https://discord.com/api/v10'

export async function getDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Failed to fetch Discord user')
  return response.json()
}

export async function getDiscordUserGuilds(accessToken: string) {
  const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Failed to fetch guilds')
  return response.json()
}

export async function getGuildMembers(
  guildId: string,
  botToken: string,
  limit: number = 100
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members?limit=${limit}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
    }
  )
  if (!response.ok) throw new Error('Failed to fetch guild members')
  return response.json()
}

export async function kickUser(
  guildId: string,
  userId: string,
  botToken: string,
  reason?: string
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${botToken}`,
        'X-Audit-Log-Reason': reason || 'Moderator action',
      },
    }
  )
  if (!response.ok) throw new Error('Failed to kick user')
}

export async function banUser(
  guildId: string,
  userId: string,
  botToken: string,
  reason?: string,
  deleteMessageDays: number = 0
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/bans/${userId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
        'X-Audit-Log-Reason': reason || 'Moderator action',
      },
      body: JSON.stringify({ delete_message_days: deleteMessageDays }),
    }
  )
  if (!response.ok) throw new Error('Failed to ban user')
}

export async function timeoutUser(
  guildId: string,
  userId: string,
  botToken: string,
  durationSeconds: number,
  reason?: string
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
        'X-Audit-Log-Reason': reason || 'Moderator action',
      },
      body: JSON.stringify({
        communication_disabled_until: new Date(
          Date.now() + durationSeconds * 1000
        ).toISOString(),
      }),
    }
  )
  if (!response.ok) throw new Error('Failed to timeout user')
}

export async function addRole(
  guildId: string,
  userId: string,
  roleId: string,
  botToken: string,
  reason?: string
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'X-Audit-Log-Reason': reason || 'Role assignment',
      },
    }
  )
  if (!response.ok) throw new Error('Failed to add role')
}

export async function removeRole(
  guildId: string,
  userId: string,
  roleId: string,
  botToken: string,
  reason?: string
) {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${botToken}`,
        'X-Audit-Log-Reason': reason || 'Role removal',
      },
    }
  )
  if (!response.ok) throw new Error('Failed to remove role')
}
