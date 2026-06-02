'use client'

import { BarChart3, TrendingUp, Users, AlertTriangle, Shield, MessageSquare } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const chartData = [
  { date: 'Mon', infractions: 4, warnings: 2, appeals: 1, reports: 3 },
  { date: 'Tue', infractions: 3, warnings: 5, appeals: 2, reports: 2 },
  { date: 'Wed', infractions: 6, warnings: 3, appeals: 1, reports: 4 },
  { date: 'Thu', infractions: 5, warnings: 4, appeals: 3, reports: 1 },
  { date: 'Fri', infractions: 8, warnings: 6, appeals: 2, reports: 5 },
  { date: 'Sat', infractions: 7, warnings: 8, appeals: 4, reports: 3 },
  { date: 'Sun', infractions: 9, warnings: 7, appeals: 3, reports: 6 },
]

const severityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 45, color: '#eab308' },
  { name: 'Low', value: 65, color: '#3b82f6' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground">View comprehensive moderation statistics and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Infractions', value: '247', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
          { label: 'Active Cases', value: '12', icon: Shield, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
          { label: 'Pending Appeals', value: '8', icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
          { label: 'Moderated Users', value: '156', icon: Users, color: 'text-amber-500', bgColor: 'bg-amber-500/20' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="text-xs text-green-500">↑ 12% from last week</p>
          </div>
        ))}
      </div>

      {/* Activity Trend */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Activity Trend (7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Area type="monotone" dataKey="infractions" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            <Area type="monotone" dataKey="warnings" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
            <Area type="monotone" dataKey="appeals" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Infraction Severity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value">
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 text-sm">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Top Violations</h2>
          <div className="space-y-3">
            {[
              { violation: 'Spam', count: 45, percentage: 18 },
              { violation: 'Harassment', count: 38, percentage: 15 },
              { violation: 'Profanity', count: 32, percentage: 13 },
              { violation: 'Off-Topic', count: 28, percentage: 11 },
              { violation: 'Advertising', count: 22, percentage: 9 },
            ].map((item) => (
              <div key={item.violation} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.violation}</span>
                  <span className="text-sm font-medium text-muted-foreground">{item.count}</span>
                </div>
                <div className="w-full bg-card/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-accent rounded-full h-2" style={{ width: `${item.percentage * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moderator Performance */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Moderator Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { moderator: 'Admin#1', actions: 45, appeals: 3, efficiency: 94 },
            { moderator: 'Mod#1', actions: 38, appeals: 5, efficiency: 87 },
            { moderator: 'Mod#2', actions: 32, appeals: 2, efficiency: 91 },
            { moderator: 'Mod#3', actions: 28, appeals: 4, efficiency: 85 },
            { moderator: 'Mod#4', actions: 22, appeals: 1, efficiency: 96 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="moderator" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Legend />
            <Bar dataKey="actions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="appeals" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
