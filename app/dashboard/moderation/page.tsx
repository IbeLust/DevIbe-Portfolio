'use server'

import { Gavel, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

export default async function ModerationPage() {
  const moderationActions = [
    { id: '1', user: 'SpamBot123', action: 'Muted', reason: 'Spam in #general', by: 'devibe6', time: '2 hours ago', duration: '24h' },
    { id: '2', user: 'Troller#9999', action: 'Warned', reason: 'Offensive language', by: 'Mod#1', time: '4 hours ago', duration: 'Permanent' },
    { id: '3', user: 'BadActor#111', action: 'Kicked', reason: 'Harassment', by: 'devibe6', time: '1 day ago', duration: 'N/A' },
    { id: '4', user: 'User#5678', action: 'Timeout', reason: 'Advertising', by: 'Mod#2', time: '2 days ago', duration: '7 days' },
    { id: '5', user: 'Suspicious#123', action: 'Warned', reason: 'Suspicious activity', by: 'devibe6', time: '3 days ago', duration: 'Warning' },
  ]

  const actionBadges = {
    Muted: 'bg-destructive/20 text-destructive',
    Warned: 'bg-yellow-500/20 text-yellow-400',
    Kicked: 'bg-orange-500/20 text-orange-400',
    Timeout: 'bg-blue-500/20 text-blue-400',
    Banned: 'bg-destructive/30 text-destructive',
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Moderation</h1>
        <p className="text-muted-foreground">View and manage moderation actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-destructive/20 rounded-xl p-6 hover:border-destructive/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Actions</h3>
              <Gavel className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">842</p>
              <p className="text-xs text-destructive">23 this month</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Warnings</h3>
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">234</p>
              <p className="text-xs text-primary">+5 today</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Timeouts</h3>
              <TrendingDown className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">156</p>
              <p className="text-xs text-accent">+2 today</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Appeals</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">12</p>
              <p className="text-xs text-green-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h2 className="font-semibold text-foreground">Recent Moderation Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {moderationActions.map((action, idx) => (
                <tr key={action.id} className={`border-b border-border hover:bg-card/50 transition-colors ${idx === moderationActions.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{action.user}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${actionBadges[action.action as keyof typeof actionBadges]}`}>
                      {action.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{action.reason}</td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{action.by}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{action.duration}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{action.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
