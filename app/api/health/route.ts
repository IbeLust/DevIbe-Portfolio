import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      database: 'operational',
      auth: 'operational',
      cache: 'operational',
    },
    metrics: {
      requestsHandled: 0,
      errorsLogged: 0,
      averageResponseTime: '0ms',
    },
    endpoints: {
      api: '/api',
      docs: '/api/docs',
      health: '/api/health',
    },
  }

  return NextResponse.json(health)
}
