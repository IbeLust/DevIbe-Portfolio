import { NextRequest, NextResponse } from 'next/server'

const API_ENDPOINTS = [
  {
    category: 'Infractions',
    endpoints: [
      {
        method: 'GET',
        path: '/api/infractions',
        description: 'Get all infractions for a server',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/infractions',
        description: 'Create a new infraction',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/infractions/[id]',
        description: 'Get infraction details',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'PUT',
        path: '/api/infractions/[id]',
        description: 'Update infraction',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'DELETE',
        path: '/api/infractions/[id]',
        description: 'Delete infraction',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/infractions/search',
        description: 'Search infractions',
        params: ['serverId', 'q', 'type', 'severity'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/infractions/bulk',
        description: 'Bulk infraction operation',
        auth: true,
      },
    ],
  },
  {
    category: 'Reports',
    endpoints: [
      {
        method: 'GET',
        path: '/api/reports',
        description: 'Get all reports',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/reports',
        description: 'Create a report',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/reports/[id]',
        description: 'Get report details',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/reports/[id]',
        description: 'Update report status',
        params: ['serverId'],
        auth: true,
      },
    ],
  },
  {
    category: 'Appeals',
    endpoints: [
      {
        method: 'GET',
        path: '/api/appeals',
        description: 'Get all appeals',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/appeals',
        description: 'Create an appeal',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/appeals/[id]',
        description: 'Get appeal details',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/appeals/[id]',
        description: 'Review/update appeal',
        params: ['serverId'],
        auth: true,
      },
    ],
  },
  {
    category: 'Audit & Logs',
    endpoints: [
      {
        method: 'GET',
        path: '/api/audit/logs',
        description: 'Get access logs',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/audit/logs',
        description: 'Log an action',
        auth: false,
      },
      {
        method: 'GET',
        path: '/api/audit/detailed',
        description: 'Get detailed audit logs with filtering',
        params: ['serverId', 'action', 'userId'],
        auth: true,
      },
      {
        method: 'DELETE',
        path: '/api/audit/detailed',
        description: 'Purge old audit logs',
        params: ['olderThanDays'],
        auth: true,
      },
    ],
  },
  {
    category: 'Staff Management',
    endpoints: [
      {
        method: 'GET',
        path: '/api/staff',
        description: 'Get all staff members',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/staff/[id]',
        description: 'Get staff member details',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/staff/[id]',
        description: 'Update staff member role',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'DELETE',
        path: '/api/staff/[id]',
        description: 'Remove staff member',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/staff/stats',
        description: 'Get staff statistics',
        params: ['serverId'],
        auth: true,
      },
    ],
  },
  {
    category: 'Analytics',
    endpoints: [
      {
        method: 'GET',
        path: '/api/analytics/infractions',
        description: 'Get infraction analytics',
        params: ['serverId', 'timeframe'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/analytics/comprehensive',
        description: 'Get comprehensive analytics',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/dashboard/overview',
        description: 'Get dashboard overview',
        params: ['serverId'],
        auth: true,
      },
    ],
  },
  {
    category: 'Utilities',
    endpoints: [
      {
        method: 'GET',
        path: '/api/export',
        description: 'Export data (JSON or CSV)',
        params: ['serverId', 'type', 'format'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/templates',
        description: 'Get warning templates',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/templates',
        description: 'Create warning template',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/scheduled-actions',
        description: 'Get scheduled moderation actions',
        params: ['serverId'],
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/scheduled-actions',
        description: 'Schedule a moderation action',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/permissions/check',
        description: 'Check user permissions',
        params: ['serverId', 'permission'],
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/notifications/settings',
        description: 'Get notification settings',
        params: ['serverId'],
        auth: true,
      },
    ],
  },
]

export async function GET() {
  const documentation = {
    title: 'Discord Admin Panel API Documentation',
    version: '1.0.0',
    baseUrl: 'http://localhost:3000',
    authentication: 'Better Auth (Session-based)',
    endpoints: API_ENDPOINTS,
    summary: {
      totalEndpoints: API_ENDPOINTS.reduce((sum, cat) => sum + cat.endpoints.length, 0),
      categories: API_ENDPOINTS.length,
    },
    features: [
      'Comprehensive infraction management',
      'Advanced audit logging',
      'Appeal processing',
      'Report management',
      'Staff role management',
      'Analytics and statistics',
      'Data export (JSON/CSV)',
      'Scheduled moderation actions',
      'Warning templates',
      'Bulk operations',
      'Permission-based access control',
    ],
  }

  return NextResponse.json(documentation)
}
