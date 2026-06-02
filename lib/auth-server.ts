'use server'

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const secret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-me'
)

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string
}

interface SessionData {
  userId: string
  discordId: string
  username: string
  email: string
  avatar: string | null
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as SessionData
  } catch (err) {
    return null
  }
}

export async function createSession(discordUser: DiscordUser): Promise<string> {
  // Find or create user in database
  let dbUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, discordUser.email))
    .limit(1)

  if (!dbUser.length) {
    const newUser = await db
      .insert(userTable)
      .values({
        id: `discord_${discordUser.id}`,
        name: discordUser.username,
        email: discordUser.email,
        image: discordUser.avatar,
        emailVerified: true,
      })
      .returning()

    dbUser = newUser
  }

  const sessionData: SessionData = {
    userId: dbUser[0].id,
    discordId: discordUser.id,
    username: discordUser.username,
    email: discordUser.email,
    avatar: discordUser.avatar,
  }

  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return token
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
