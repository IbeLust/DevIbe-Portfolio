import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { warning_templates, access_logs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serverId,
      templateName,
      templateContent,
      infractionType,
      pointValue,
    } = await request.json()

    if (!serverId || !templateName || !templateContent || !infractionType) {
      return NextResponse.json(
        { error: 'All template fields are required' },
        { status: 400 }
      )
    }

    // Check permissions
    const canCreate = await hasPermission(session.userId, serverId, 'manage_templates')
    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const templateId = nanoid()
    await db.insert(warning_templates).values({
      id: templateId,
      serverId,
      templateName,
      templateContent,
      infractionType,
      pointValue: pointValue || 1,
      createdBy: session.userId,
      createdAt: new Date(),
    })

    // Log action
    await db.insert(access_logs).values({
      id: nanoid(),
      userId: session.userId,
      serverId,
      action: 'create_warning_template',
      resource: `template:${templateId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      templateId,
    })
  } catch (error) {
    console.error('[v0] Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const infractionType = searchParams.get('type')

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canView = await hasPermission(session.userId, serverId, 'view_templates')
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let templates = await db
      .select()
      .from(warning_templates)
      .where((row) => row.serverId === serverId)

    if (infractionType) {
      templates = templates.filter((t) => t.infractionType === infractionType)
    }

    return NextResponse.json({
      success: true,
      count: templates.length,
      templates,
    })
  } catch (error) {
    console.error('[v0] Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
