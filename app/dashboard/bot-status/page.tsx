'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Check, Link as LinkIcon, Settings, Zap } from 'lucide-react'

interface BotStatus {
  connected: boolean
  permissions: Record<string, boolean>
  channels: string[]
  latency?: number
}

export default function BotStatusPage() {
  const [status, setStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupBot = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/discord/setup-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: 'default-server' }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to setup bot')
        return
      }

      const data = await response.json()
      setStatus({
        connected: true,
        permissions: data.botPermissions,
        channels: [data.adminChannel.name],
      })
    } catch (err) {
      setError('Failed to setup bot')
      console.error('[v0] Setup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const requiredPermissions = [
    'sendMessages',
    'manageMessages',
    'moderateMembers',
    'banMembers',
    'kickMembers',
    'createChannel',
    'manageRoles',
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Bot Configuration</h1>
        <p className="text-muted-foreground">Manage Discord bot settings and permissions</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Bot Status</h3>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">
                {status?.connected ? '✅ Online' : '❌ Offline'}
              </p>
              <p className="text-xs text-muted-foreground">
                {status?.latency ? `${status.latency}ms latency` : 'Status unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-xl p-6 hover:border-accent/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
              <Check className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              {status && (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {Object.values(status.permissions).filter((p) => p).length}/{requiredPermissions.length}
                  </p>
                  <p className="text-xs text-accent">Configured</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-card to-card/50 border border-chart-2/20 rounded-xl p-6 hover:border-chart-2/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Channels</h3>
              <LinkIcon className="w-5 h-5 text-chart-2" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{status?.channels.length || 0}</p>
              <p className="text-xs text-chart-2">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h2 className="font-semibold text-foreground">Required Permissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Permission</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">Description</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  key: 'sendMessages',
                  name: 'Send Messages',
                  desc: 'Send notifications and responses',
                },
                {
                  key: 'manageMessages',
                  name: 'Manage Messages',
                  desc: 'Delete and edit messages',
                },
                {
                  key: 'moderateMembers',
                  name: 'Moderate Members',
                  desc: 'Timeout and suspend members',
                },
                {
                  key: 'banMembers',
                  name: 'Ban Members',
                  desc: 'Ban users from the server',
                },
                {
                  key: 'kickMembers',
                  name: 'Kick Members',
                  desc: 'Kick users from the server',
                },
                {
                  key: 'createChannel',
                  name: 'Create Channels',
                  desc: 'Create notification channel',
                },
                {
                  key: 'manageRoles',
                  name: 'Manage Roles',
                  desc: 'Assign and manage roles',
                },
              ].map((perm) => (
                <tr key={perm.key} className="border-b border-border hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{perm.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{perm.desc}</td>
                  <td className="px-6 py-4 text-center">
                    {status?.permissions[perm.key] ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <Check className="w-4 h-4" />
                        Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        Missing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Section */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Bot Setup</h2>
          <p className="text-muted-foreground">Initialize the bot for your server and verify permissions</p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={setupBot}
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          {loading ? 'Setting up...' : 'Setup Bot for This Server'}
        </button>

        <div className="p-4 bg-card/50 border border-border/50 rounded-lg space-y-2 text-sm text-muted-foreground">
          <p>
            The bot will:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Verify permissions in your server</li>
            <li>Create an admin-notifications channel if needed</li>
            <li>Enable real-time moderation notifications</li>
            <li>Setup webhook handlers for Discord events</li>
          </ul>
        </div>
      </div>

      {/* Invite Link */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Invite Bot to Server</h2>
          <p className="text-muted-foreground">Add the Discord Admin bot to your server</p>
        </div>

        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground mb-4">
            Use this link to invite the bot to your Discord server:
          </p>
          <input
            type="text"
            readOnly
            value={`https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'CLIENT_ID'}&permissions=8&scope=bot`}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground font-mono"
          />
        </div>
      </div>
    </div>
  )
}
