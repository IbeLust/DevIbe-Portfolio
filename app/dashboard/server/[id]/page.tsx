'use client'

import { useState, useEffect } from 'react'
import { 
  getServerMembers, 
  getModerationLogs, 
  getInfractions,
  logModeration,
  getServerStats
} from '@/app/actions/discord'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Member {
  id: string
  userId: string
  username: string
  avatar?: string
}

interface ModerationLog {
  id: string
  targetUsername: string
  moderatorUsername: string
  actionType: string
  reason?: string
  createdAt: string
}

interface Infraction {
  id: string
  userId: string
  username: string
  infractionType: string
  severity: number
  reason?: string
  createdAt: string
}

export default function ServerPage() {
  const params = useParams()
  const serverId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')
  const [members, setMembers] = useState<Member[]>([])
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [infractions, setInfractions] = useState<Infraction[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [moderationForm, setModerationForm] = useState({
    userId: '',
    username: '',
    actionType: 'warn' as 'ban' | 'kick' | 'mute' | 'timeout' | 'warn',
    reason: '',
    duration: '',
  })

  useEffect(() => {
    loadServerData()
  }, [serverId])

  async function loadServerData() {
    try {
      const [membersData, logsData, infraData, statsData] = await Promise.all([
        getServerMembers(serverId),
        getModerationLogs(serverId),
        getInfractions(serverId),
        getServerStats(serverId),
      ])
      setMembers(membersData)
      setLogs(logsData)
      setInfractions(infraData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load server data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleModeration(e: React.FormEvent) {
    e.preventDefault()
    try {
      await logModeration(
        serverId,
        moderationForm.userId,
        moderationForm.username,
        'system',
        'Admin Panel',
        moderationForm.actionType,
        moderationForm.reason || undefined,
        moderationForm.duration ? parseInt(moderationForm.duration) * 1000 : undefined
      )
      setModerationForm({
        userId: '',
        username: '',
        actionType: 'warn',
        reason: '',
        duration: '',
      })
      await loadServerData()
    } catch (error) {
      console.error('Failed to log moderation action:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="outline">← Back to Dashboard</Button>
      </Link>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="infractions">Infractions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalMembers || 0}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Moderation Logs</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalLogs || 0}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Infractions</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalInfractions || 0}</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Moderation Actions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No moderation actions yet</p>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{log.targetUsername}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.actionType.toUpperCase()} by {log.moderatorUsername}
                        </p>
                        {log.reason && (
                          <p className="text-sm text-muted-foreground mt-1">Reason: {log.reason}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Server Members</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members found</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{member.username}</p>
                      <p className="text-xs text-muted-foreground">ID: {member.userId}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Log Moderation Action</h3>
            <form onSubmit={handleModeration} className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Discord User ID"
                  value={moderationForm.userId}
                  onChange={(e) =>
                    setModerationForm({ ...moderationForm, userId: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Discord Username"
                  value={moderationForm.username}
                  onChange={(e) =>
                    setModerationForm({ ...moderationForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="actionType">Action Type</Label>
                <select
                  id="actionType"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  value={moderationForm.actionType}
                  onChange={(e) =>
                    setModerationForm({
                      ...moderationForm,
                      actionType: e.target.value as any,
                    })
                  }
                >
                  <option value="warn">Warn</option>
                  <option value="mute">Mute</option>
                  <option value="timeout">Timeout</option>
                  <option value="kick">Kick</option>
                  <option value="ban">Ban</option>
                </select>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Reason for action"
                  value={moderationForm.reason}
                  onChange={(e) =>
                    setModerationForm({ ...moderationForm, reason: e.target.value })
                  }
                />
              </div>
              {moderationForm.actionType === 'timeout' && (
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Duration in minutes"
                    value={moderationForm.duration}
                    onChange={(e) =>
                      setModerationForm({
                        ...moderationForm,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <Button type="submit" className="w-full">
                Log Action
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Actions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions logged</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{log.targetUsername}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.actionType.toUpperCase()} by {log.moderatorUsername}
                        </p>
                        {log.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {log.reason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="infractions" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">User Infractions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {infractions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No infractions recorded</p>
              ) : (
                infractions.map((infr) => (
                  <div key={infr.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{infr.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {infr.infractionType.toUpperCase()} - Severity: {infr.severity}/5
                        </p>
                        {infr.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {infr.reason}
                          </p>
                        )}
                        {infr.moderatorUsername && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {infr.moderatorUsername}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(infr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
