'use client'

import { Activity, Filter, Search, Download, Eye } from 'lucide-react'
import { useState } from 'react'

interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  target?: string
  details: string
  severity: 'low' | 'medium' | 'high'
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:32',
    user: 'Admin#1',
    action: 'Issued Infraction',
    target: 'User#5432',
    details: 'Spam - 5 messages in 10 seconds',
    severity: 'medium',
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:28',
    user: 'Mod#2',
    action: 'Member Kicked',
    target: 'User#1234',
    details: 'Violating server rules repeatedly',
    severity: 'high',
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:15',
    user: 'Admin#1',
    action: 'Appeal Denied',
    target: 'User#9876',
    details: 'Insufficient evidence for reversal',
    severity: 'low',
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:05',
    user: 'Mod#1',
    action: 'Warning Issued',
    target: 'User#5555',
    details: 'Inappropriate language in #general',
    severity: 'low',
  },
  {
    id: '5',
    timestamp: '2024-01-15 13:45',
    user: 'Admin#1',
    action: 'Appeal Approved',
    target: 'User#7777',
    details: 'Appeal for false positive spam detection',
    severity: 'medium',
  },
]

export default function ActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const filteredLogs = mockActivityLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = filterAction === 'all' || log.action.includes(filterAction)
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity

    return matchesSearch && matchesAction && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground">View all moderation and admin actions</p>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, target, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors inline-flex items-center gap-2 text-muted-foreground">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Actions</option>
            <option value="Issued Infraction">Issued Infraction</option>
            <option value="Kicked">Member Kicked</option>
            <option value="Warning">Warning Issued</option>
            <option value="Appeal">Appeal</option>
            <option value="Report">Report</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Moderator</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Target</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Details</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Severity</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className="border-b border-border hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.target || '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                      {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {mockActivityLogs.length} entries
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm text-muted-foreground">
            Previous
          </button>
          <div className="flex gap-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  page === 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm text-muted-foreground">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
