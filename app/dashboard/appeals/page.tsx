'use client'

import { useState } from 'react'
import { Check, Clock, MessageSquare, ThumbsDown, ThumbsUp, X } from 'lucide-react'

interface Appeal {
  id: string
  infractionType: string
  infractionReason: string
  appealantUsername: string
  appealReason: string
  status: 'pending' | 'reviewing' | 'approved' | 'denied'
  date: string
  severity: 'low' | 'medium' | 'high'
}

export default function AppealsPage() {
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [reviewNotes, setReviewNotes] = useState('')

  const appeals: Appeal[] = [
    {
      id: '1',
      infractionType: 'Warning',
      infractionReason: 'Spam in general chat',
      appealantUsername: 'User#123',
      appealReason: 'I didn\'t spam, it was accidental duplicate messages',
      status: 'pending',
      date: '2 hours ago',
      severity: 'low',
    },
    {
      id: '2',
      infractionType: 'Mute',
      infractionReason: 'Offensive language',
      appealantUsername: 'Player#456',
      appealReason: 'I apologize for my behavior and promise it won\'t happen again',
      status: 'reviewing',
      date: '5 hours ago',
      severity: 'medium',
    },
    {
      id: '3',
      infractionType: 'Timeout',
      infractionReason: 'Harassment',
      appealantUsername: 'Member#789',
      appealReason: 'I was just joking around, no harm intended',
      status: 'pending',
      date: '1 day ago',
      severity: 'high',
    },
    {
      id: '4',
      infractionType: 'Warning',
      infractionReason: 'Advertising',
      appealantUsername: 'NoSpam#999',
      appealReason: 'The link was for a related community, not spam',
      status: 'approved',
      date: '2 days ago',
      severity: 'low',
    },
    {
      id: '5',
      infractionType: 'Kick',
      infractionReason: 'Ban evasion attempt',
      appealantUsername: 'Ban#666',
      appealReason: 'I created a new account to contact someone, not to evade the ban',
      status: 'denied',
      date: '3 days ago',
      severity: 'high',
    },
  ]

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    reviewing: 'bg-blue-500/20 text-blue-400',
    approved: 'bg-green-500/20 text-green-400',
    denied: 'bg-destructive/20 text-destructive',
  }

  const severityColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
  }

  const filteredAppeals = filterStatus === 'all'
    ? appeals
    : appeals.filter(a => a.status === filterStatus)

  const statsData = {
    total: appeals.length,
    pending: appeals.filter(a => a.status === 'pending').length,
    approved: appeals.filter(a => a.status === 'approved').length,
    denied: appeals.filter(a => a.status === 'denied').length,
  }

  const handleReview = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
    setShowModal(true)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Infraction Appeals</h1>
        <p className="text-muted-foreground">Review and manage user appeals for infractions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Appeals</h3>
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
              <p className="text-xs text-yellow-500">Need review</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
              <ThumbsUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.approved}</p>
              <p className="text-xs text-green-500">Granted</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-destructive/20 rounded-xl p-6 hover:border-destructive/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Denied</h3>
              <ThumbsDown className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{statsData.denied}</p>
              <p className="text-xs text-destructive">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {['pending', 'reviewing', 'approved', 'denied', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              filterStatus === status
                ? 'text-primary border-b-primary'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appeals List */}
      <div className="space-y-3">
        {filteredAppeals.map((appeal) => (
          <div key={appeal.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[appeal.severity]}`}>
                    {appeal.severity.charAt(0).toUpperCase() + appeal.severity.slice(1)} Severity
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appeal.status as keyof typeof statusColors]}`}>
                    {appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{appeal.date}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Appellant</p>
                    <p className="font-medium text-foreground">{appeal.appealantUsername}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Original Infraction</p>
                    <p className="font-medium text-foreground">{appeal.infractionType}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Infraction Reason</p>
                  <p className="text-sm text-foreground">{appeal.infractionReason}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Appeal Reason</p>
                  <p className="text-sm text-foreground">{appeal.appealReason}</p>
                </div>
              </div>

              <button
                onClick={() => handleReview(appeal)}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-8 max-w-2xl w-full mx-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Review Appeal</h2>
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
                  <label className="text-xs text-muted-foreground">Appellant</label>
                  <p className="mt-1 font-medium text-foreground">{selectedAppeal.appealantUsername}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <p className="mt-1 font-medium text-foreground capitalize">{selectedAppeal.status}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Original Infraction</label>
                  <p className="mt-1 font-medium text-foreground">{selectedAppeal.infractionType}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Severity</label>
                  <p className="mt-1 font-medium text-foreground capitalize">{selectedAppeal.severity}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Infraction Reason</label>
                <p className="mt-2 p-3 bg-card/50 rounded-lg text-foreground">{selectedAppeal.infractionReason}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Appeal Reason</label>
                <p className="mt-2 p-3 bg-card/50 rounded-lg text-foreground">{selectedAppeal.appealReason}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Add your review notes here..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <button className="px-4 py-2 bg-card/50 hover:bg-card border border-border rounded-lg transition-colors text-foreground font-medium">
                Keep Closed
              </button>
              <button className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                Deny
              </button>
              <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
