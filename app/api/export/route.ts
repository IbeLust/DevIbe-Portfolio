import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/db'
import { infractions_detailed, reports, appeals } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')
    const format = searchParams.get('format') || 'json' // 'json', 'csv'
    const dataType = searchParams.get('type') || 'infractions' // 'infractions', 'reports', 'appeals'

    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 })
    }

    // Check permissions
    const canExport = await hasPermission(session.userId, serverId, 'export_data')
    if (!canExport) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let data: any[] = []

    // Get appropriate data
    if (dataType === 'infractions') {
      data = await db
        .select()
        .from(infractions_detailed)
        .where((row) => row.serverId === serverId)
    } else if (dataType === 'reports') {
      data = await db
        .select()
        .from(reports)
        .where((row) => row.serverId === serverId)
    } else if (dataType === 'appeals') {
      data = await db
        .select()
        .from(appeals)
        .where((row) => row.serverId === serverId)
    }

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${dataType}_${Date.now()}.csv"`,
        },
      })
    }

    // JSON format (default)
    return NextResponse.json({
      success: true,
      dataType,
      recordCount: data.length,
      exportDate: new Date().toISOString(),
      data,
    })
  } catch (error) {
    console.error('[v0] Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return 'No data to export'
  }

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')

  const rows = data.map((row) =>
    headers
      .map((header) => {
        let value = row[header]
        if (value === null || value === undefined) {
          return ''
        }
        // Escape quotes in CSV
        value = String(value).replace(/"/g, '""')
        // Wrap in quotes if contains comma
        if (String(value).includes(',')) {
          value = `"${value}"`
        }
        return value
      })
      .join(',')
  )

  return [csvHeaders, ...rows].join('\n')
}
