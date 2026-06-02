'use server'

import { Shield, Trash2, RotateCcw } from 'lucide-react'

export default async function InfractionsPage() {
  const infractions = [
    { id: '1', user: 'SpamBot123', type: 'Spam', severity: 'High', count: 3, reason: 'Multiple spam messages', date: '2 hours ago', moderator: 'devibe6' },
    { id: '2', user: 'Troller#9999', type: 'Harassment', severity: 'Critical', count: 5, reason: 'Harassing other members', date: '1 day ago', moderator: 'Mod#1' },
    { id: '3', user: 'User#5678', type: 'Advertising', severity: 'Medium', count: 1, reason: 'Posted invite link', date: '2 days ago', moderator: 'devibe6' },
    { id: '4', user: 'BadLanguage#42', type: 'Language', severity: 'Low', count: 2, reason: 'Offensive language use', date: '3 days ago', moderator: 'Mod#2' },
    { id: '5', user: 'RuleBreaker#111', type: 'Rules', severity: 'High', count: 4, reason: 'Multiple rule violations', date: '5 days ago', moderator: 'devibe6' },
  ]

  const severityColors = {
    Low: 'bg-yellow-500/20 text-yellow-400',
    Medium: 'bg-orange-500/20 text-orange-400',
    High: 'bg-destructive/20 text-destructive',
    Critical: 'bg-destructive/40 text-destructive',
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Infractions</h1>
        <p className="text-muted-foreground">Track and manage user violations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-destructive/20 rounded-xl p-6 hover:border-destructive/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Infractions</h3>
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">156</p>
              <p className="text-xs text-destructive">+8 this week</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Critical</h3>
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">23</p>
              <p className="text-xs text-orange-500">Highest priority</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">34</p>
              <p className="text-xs text-primary">With violations</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
              <RotateCcw className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">89</p>
              <p className="text-xs text-green-500">57% resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Infractions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h2 className="font-semibold text-foreground">Recent Infractions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Count</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Moderator</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {infractions.map((infraction, idx) => (
                <tr key={infraction.id} className={`border-b border-border hover:bg-card/50 transition-colors ${idx === infractions.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{infraction.user}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{infraction.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${severityColors[infraction.severity as keyof typeof severityColors]}`}>
                      {infraction.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{infraction.count}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{infraction.reason}</td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{infraction.moderator}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{infraction.date}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 hover:bg-card/50 rounded transition-colors text-muted-foreground hover:text-primary">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-card/50 rounded transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
