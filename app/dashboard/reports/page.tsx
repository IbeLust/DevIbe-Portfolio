'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Clock, Eye, MessageSquare, Trash2, X } from 'lucide-react'

interface Report {
  id: string
  reporterUsername: string
  reportedUsername: string
  reportType: string
  reason: string
  evidence?: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  date: string
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const reports: Report[] = [
    {
      id: '1',
      reporterUsername: 'UserA#123',
      reportedUsername: 'SpamBot#999',
      reportType: 'Spam',
      reason: 'Posting the same message repeatedly in chat',
      evidence: 'Screenshots provided',
      status: 'investigating',
      date: '1 hour ago',
    },
    {
      id: '2',
      reporterUsername: 'Helper#42',
      reportedUsername: 'Troll#666',
      reportType: 'Harassment',
      reason: 'Targeted harassment and personal attacks',
      evidence: 'Chat logs attached',
      status: 'resolved',
      date: '3 hours ago',
    },
    {
      id: '3',
      reporterUsername: 'Member#789',
      reportedUsername: 'Advertiser#111',
      reportType: 'Advertising',
      reason: 'Posted server invite links',
      evidence: 'Message link provided',
      status: 'pending',
      date: '5 hours ago',
    },
    {
      id: '4',
      reporterUsername: 'SafeUser#555',
      reportedUsername: 'BadActor#222',
      reportType: 'Toxicity',
      reason: 'Consistently using offensive language',
      evidence: 'Multiple messages reported',
      status: 'dismissed',
      date: '1 day ago',
    },
    {
      id: '5',
      reporterUsername: 'Report#333',
      reportedUsername: 'NSFW#777',
      reportType: 'NSFW',
      reason: 'Posted inappropriate content',
      evidence: 'Image link provided',
      status: 'resolved',
      date: '2 days ago',
    },
  ]

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    investigating: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
  }

  const typeColors = {
    'Spam': 'bg-orange-500/20 text-orange-400',
    'Harassment': 'bg-red-500/20 text-red-400',
    'Advertising': 'bg-purple-500/20 text-purple-400',
    'Toxicity': 'bg-pink-500/20 text-pink-400',
    'NSFW': 'bg-red-700/20 text-red-600',
    'Other': 'bg-gray-500/20 text-gray-400',
  }

  const filteredReports = filterStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === filterStatus)

  const statsData = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Member Reports</h1>
        <p className="text-muted-foreground">Review and manage member reports for violations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Reports</h3>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.total}</p>
              <p className="text-xs text-primary">All time</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.pending}</p>
              <p className="text-xs text-yellow-500">Awaiting review</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Investigating</h3>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.investigating}</p>
              <p className="text-xs text-blue-500">In progress</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.resolved}</p>
              <p className="text-xs text-green-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              filterStatus === status
                ? 'text-primary border-b-primary'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[report.reportType as keyof typeof typeColors] || typeColors['Other']}`}>
                    {report.reportType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status as keyof typeof statusColors]}`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Reported By</p>
                    <p className="font-medium text-foreground">{report.reporterUsername}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reported User</p>
                    <p className="font-medium text-foreground">{report.reportedUsername}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm text-foreground">{report.reason}</p>
                </div>

                {report.evidence && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Evidence</p>
                    <p className="text-sm text-muted-foreground">{report.evidence}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedReport(report)
                    setShowModal(true)
                  }}
                  className="p-2 hover:bg-card/50 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-card/50 rounded-lg transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-8 max-w-2xl w-full mx-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Review Report</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-card/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Report Type</label>
                  <p className="mt-1 font-medium text-foreground">{selectedReport.reportType}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <p className="mt-1 font-medium text-foreground capitalize">{selectedReport.status}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reporter</label>
                  <p className="mt-1 font-medium text-foreground">{selectedReport.reporterUsername}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reported User</label>
                  <p className="mt-1 font-medium text-foreground">{selectedReport.reportedUsername}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Reason</label>
                <p className="mt-2 p-3 bg-card/50 rounded-lg text-foreground">{selectedReport.reason}</p>
              </div>

              {selectedReport.evidence && (
                <div>
                  <label className="text-xs text-muted-foreground">Evidence</label>
                  <p className="mt-2 p-3 bg-card/50 rounded-lg text-foreground">{selectedReport.evidence}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <button className="px-4 py-2 bg-card/50 hover:bg-card border border-border rounded-lg transition-colors text-foreground font-medium">
                Dismiss
              </button>
              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium">
                Investigating
              </button>
              <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium">
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
