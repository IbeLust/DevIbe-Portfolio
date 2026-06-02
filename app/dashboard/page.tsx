'use server'

import { getSession } from '@/lib/auth-server'
import { Users, Gavel, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Welcome back, {session?.username}
        </h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your server</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">2,847</p>
              <p className="text-xs text-accent">+12% from last month</p>
            </div>
          </div>
        </div>

        {/* Moderations Today */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Moderations</h3>
              <Gavel className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">23</p>
              <p className="text-xs text-accent">Today</p>
            </div>
          </div>
        </div>

        {/* Active Infractions */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-destructive/20 rounded-xl p-6 hover:border-destructive/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Infractions</h3>
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">156</p>
              <p className="text-xs text-destructive">+8 this week</p>
            </div>
          </div>
        </div>

        {/* Server Health */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-chart-2/20 rounded-xl p-6 hover:border-chart-2/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Health</h3>
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-xs text-chart-2">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Recent Moderation</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-border last:border-b-0 hover:bg-card/80 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">User warned</p>
                    <p className="text-xs text-muted-foreground">Spam prevention</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive">Warning</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Quick Stats</h2>
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Messages Today</p>
              <p className="text-2xl font-bold text-foreground">12.4K</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">New Members</p>
              <p className="text-2xl font-bold text-foreground">45</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold text-foreground">321</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
