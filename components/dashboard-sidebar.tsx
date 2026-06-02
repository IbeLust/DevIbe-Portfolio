'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Gavel, LogOut, Settings, BarChart3, Bell, Shield, AlertTriangle, FileText, MessageSquare, Award, Zap } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/members', label: 'Members', icon: Users },
    { href: '/dashboard/moderation', label: 'Moderation', icon: Gavel },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/infractions', label: 'Infractions', icon: Shield },
    { href: '/dashboard/staff-management', label: 'Staff Punishment', icon: Award },
    { href: '/dashboard/reports', label: 'Reports', icon: AlertTriangle },
    { href: '/dashboard/appeals', label: 'Appeals', icon: MessageSquare },
    { href: '/dashboard/bot-status', label: 'Bot Status', icon: Zap },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Discord Admin
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Server Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:bg-sidebar-primary/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
