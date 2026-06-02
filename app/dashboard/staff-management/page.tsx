'use client'

import { useState } from 'react'
import { AlertTriangle, Award, MessageSquare, Shield, TrendingDown, TrendingUp, Users, X } from 'lucide-react'

interface StaffMember {
  id: string
  username: string
  pointsBalance: number
  totalPointsEarned: number
  totalPointsLost: number
  warningLevel: number
  status: 'active' | 'suspended' | 'removed'
  suspendedUntil?: string
  role: 'owner' | 'manager' | 'moderator' | 'staff'
}

interface PunishmentAction {
  id: string
  staffUsername: string
  actionType: 'warning' | 'deduction' | 'suspension' | 'removal'
  points: number
  reason: string
  date: string
  moderator: string
}

export default function StaffManagementPage() {
  const [showPunishmentModal, setShowPunishmentModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [punishmentForm, setPunishmentForm] = useState({
    actionType: 'warning',
    points: 0,
    reason: '',
  })

  const staffMembers: StaffMember[] = [
    {
      id: '1',
      username: 'devibe6',
      pointsBalance: 100,
      totalPointsEarned: 250,
      totalPointsLost: 150,
      warningLevel: 0,
      status: 'active',
      role: 'owner',
    },
    {
      id: '2',
      username: 'Mod#1',
      pointsBalance: 45,
      totalPointsEarned: 150,
      totalPointsLost: 105,
      warningLevel: 1,
      status: 'active',
      role: 'moderator',
    },
    {
      id: '3',
      username: 'Helper#42',
      pointsBalance: -8,
      totalPointsEarned: 80,
      totalPointsLost: 88,
      warningLevel: 2,
      status: 'suspended',
      suspendedUntil: '2026-06-15',
      role: 'staff',
    },
    {
      id: '4',
      username: 'NewMod#999',
      pointsBalance: 15,
      totalPointsEarned: 40,
      totalPointsLost: 25,
      warningLevel: 0,
      status: 'active',
      role: 'moderator',
    },
  ]

  const punishmentHistory: PunishmentAction[] = [
    {
      id: '1',
      staffUsername: 'Mod#1',
      actionType: 'deduction',
      points: -15,
      reason: 'Failed to document moderation action properly',
      date: '2 days ago',
      moderator: 'devibe6',
    },
    {
      id: '2',
      staffUsername: 'Helper#42',
      actionType: 'suspension',
      points: -20,
      reason: 'Abuse of moderator power',
      date: '4 days ago',
      moderator: 'devibe6',
    },
    {
      id: '3',
      staffUsername: 'NewMod#999',
      actionType: 'warning',
      points: -5,
      reason: 'First warning for inactivity',
      date: '1 week ago',
      moderator: 'devibe6',
    },
  ]

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    suspended: 'bg-yellow-500/20 text-yellow-400',
    removed: 'bg-destructive/20 text-destructive',
  }

  const warningColors = {
    0: 'bg-green-500/20 text-green-400',
    1: 'bg-yellow-500/20 text-yellow-400',
    2: 'bg-orange-500/20 text-orange-400',
    3: 'bg-destructive/20 text-destructive',
  }

  const handlePunish = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setShowPunishmentModal(true)
  }

  const submitPunishment = async () => {
    if (!selectedStaff) return

    try {
      const response = await fetch('/api/staff/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: 'default-server',
          staffUserId: selectedStaff.id,
          staffUsername: selectedStaff.username,
          pointsChange: punishmentForm.actionType === 'deduction' ? -punishmentForm.points : -5,
          reason: punishmentForm.reason,
          action: punishmentForm.actionType,
        }),
      })

      if (response.ok) {
        setShowPunishmentModal(false)
        setPunishmentForm({ actionType: 'warning', points: 0, reason: '' })
        // Refresh data
      }
    } catch (error) {
      console.error('[v0] Error submitting punishment:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground">Manage staff members and track performance with point system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Staff</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{staffMembers.length}</p>
              <p className="text-xs text-primary">{staffMembers.filter(s => s.status === 'active').length} active</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Suspended</h3>
              <AlertTriangle className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{staffMembers.filter(s => s.status === 'suspended').length}</p>
              <p className="text-xs text-accent">Need review</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-destructive/20 rounded-xl p-6 hover:border-destructive/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Warnings Issued</h3>
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">7</p>
              <p className="text-xs text-destructive">This month</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-chart-2/20 rounded-xl p-6 hover:border-chart-2/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Avg Performance</h3>
              <Award className="w-5 h-5 text-chart-2" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">38 pts</p>
              <p className="text-xs text-chart-2">Overall score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h2 className="font-semibold text-foreground">Staff Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Points Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Warning Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Total Earned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Total Lost</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff, idx) => (
                <tr key={staff.id} className={`border-b border-border hover:bg-card/50 transition-colors ${idx === staffMembers.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{staff.username}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[staff.status]}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className={staff.pointsBalance >= 0 ? 'text-green-400' : 'text-destructive'}>
                      {staff.pointsBalance >= 0 ? '+' : ''}{staff.pointsBalance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${warningColors[Math.min(staff.warningLevel, 3) as keyof typeof warningColors]}`}>
                      {staff.warningLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {staff.totalPointsEarned}
                  </td>
                  <td className="px-6 py-4 text-sm text-destructive flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {staff.totalPointsLost}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handlePunish(staff)}
                      className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors text-sm font-medium"
                    >
                      Punish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Punishment History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h2 className="font-semibold text-foreground">Punishment History</h2>
        </div>
        <div className="space-y-2 p-6">
          {punishmentHistory.map((action) => (
            <div key={action.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {action.staffUsername}{' '}
                      <span className="text-muted-foreground">received {action.actionType}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{action.reason}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span className={`text-sm font-semibold ${action.points < 0 ? 'text-destructive' : 'text-green-400'}`}>
                  {action.points}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{action.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Punishment Modal */}
      {showPunishmentModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Punish Staff Member</h2>
              <button
                onClick={() => setShowPunishmentModal(false)}
                className="p-2 hover:bg-card/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Staff Member</label>
                <p className="mt-2 px-3 py-2 bg-card/50 rounded-lg text-foreground">{selectedStaff.username}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Action Type</label>
                <select
                  value={punishmentForm.actionType}
                  onChange={(e) => setPunishmentForm({ ...punishmentForm, actionType: e.target.value })}
                  className="w-full mt-2 px-3 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="warning">Warning (-5 points)</option>
                  <option value="deduction">Point Deduction</option>
                  <option value="suspension">Suspension</option>
                  <option value="removal">Removal</option>
                </select>
              </div>

              {punishmentForm.actionType === 'deduction' && (
                <div>
                  <label className="text-sm font-medium text-foreground">Points to Deduct</label>
                  <input
                    type="number"
                    value={punishmentForm.points}
                    onChange={(e) => setPunishmentForm({ ...punishmentForm, points: parseInt(e.target.value) })}
                    className="w-full mt-2 px-3 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter number of points"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground">Reason</label>
                <textarea
                  value={punishmentForm.reason}
                  onChange={(e) => setPunishmentForm({ ...punishmentForm, reason: e.target.value })}
                  className="w-full mt-2 px-3 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Explain the reason for punishment"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowPunishmentModal(false)}
                className="flex-1 px-4 py-2 bg-card/50 hover:bg-card border border-border rounded-lg transition-colors text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitPunishment}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/80 rounded-lg transition-colors text-white font-medium"
              >
                Confirm Punishment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
