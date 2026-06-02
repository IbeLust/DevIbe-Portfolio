import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const query = searchParams.get('q') || ''
    const infractionType = searchParams.get('type')
    const severity = searchParams.get('severity')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canSearch = await hasPermission(session.userId, serverId, 'view_infractions')
    if (!canSearch) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all infractions for this server
    let results = await db
      .select()
      .from(infractions_detailed)
      .where((row) => row.serverId === serverId)

    // Filter by text query (username, reason)
    if (query) {
      results = results.filter(
        (inf) =>
          inf.targetUsername.toLowerCase().includes(query.toLowerCase()) ||
          inf.moderatorUsername.toLowerCase().includes(query.toLowerCase()) ||
          (inf.reason && inf.reason.toLowerCase().includes(query.toLowerCase()))
      )
    }

    // Filter by type
    if (infractionType) {
      results = results.filter((inf) => inf.infractionType === infractionType)
    }

    // Filter by severity
    if (severity) {
      const sevLevel = parseInt(severity, 10)
      results = results.filter((inf) => inf.severity === sevLevel)
    }

    // Sort by date descending
    results = results.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Apply limit
    const limited = results.slice(0, limit)

    return NextResponse.json({
      success: true,
      query,
      filters: {
        type: infractionType || null,
        severity: severity || null,
      },
      resultCount: limited.length,
      totalMatches: results.length,
      results: limited,
    })
  } catch (error) {
    console.error('[v0] Error searching infractions:', error)
    return NextResponse.json(
      { error: 'Failed to search infractions' },
      { status: 500 }
    )
  }
}
