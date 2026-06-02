'use server'

import { Search, Shield, Users as UsersIcon } from 'lucide-react'

export default async function MembersPage() {
  // Mock data with devibe6 as owner
  const members = [
    { id: '1', username: 'devibe6', avatar: '👑', role: 'Owner', joinDate: '2024-01-01', status: 'online' },
    { id: '2', username: 'Member#1', avatar: '👤', role: 'Moderator', joinDate: '2024-02-15', status: 'online' },
    { id: '3', username: 'Member#2', avatar: '👤', role: 'Member', joinDate: '2024-03-20', status: 'idle' },
    { id: '4', username: 'Member#3', avatar: '👤', role: 'Member', joinDate: '2024-04-10', status: 'offline' },
    { id: '5', username: 'Member#4', avatar: '👤', role: 'Member', joinDate: '2024-05-05', status: 'online' },
  ]

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-500',
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Members</h1>
        <p className="text-muted-foreground">Manage and monitor your server members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-2">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-3xl font-bold text-foreground">2,847</p>
            <p className="text-xs text-primary">↑ 12% this month</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-2">
            <p className="text-sm text-muted-foreground">Online Now</p>
            <p className="text-3xl font-bold text-foreground">1,203</p>
            <p className="text-xs text-accent">42% online</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-chart-2/20 rounded-xl p-6 hover:border-chart-2/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-2">
            <p className="text-sm text-muted-foreground">New This Week</p>
            <p className="text-3xl font-bold text-foreground">142</p>
            <p className="text-xs text-chart-2">Verified</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr key={member.id} className={`border-b border-border hover:bg-card/50 transition-colors ${idx === members.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{member.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[member.status as keyof typeof statusColors]}`} />
                      <span className="text-sm text-foreground capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
                      member.role === 'Owner' ? 'bg-accent/20 text-accent' :
                      member.role === 'Moderator' ? 'bg-primary/20 text-primary' :
                      'bg-muted/20 text-muted-foreground'
                    }`}>
                      {member.role === 'Owner' || member.role === 'Moderator' && <Shield className="w-4 h-4" />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-primary hover:text-accent transition-colors text-sm font-medium">View</button>
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
