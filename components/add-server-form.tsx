'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddServerForm() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    serverId: '',
    serverName: '',
    adminRoleId: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleAddServer(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/discord/add-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ serverId: '', serverName: '', adminRoleId: '' })
        setShowForm(false)
        window.location.reload()
      } else {
        alert('Failed to add server')
      }
    } catch (error) {
      console.error('Error adding server:', error)
      alert('Error adding server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          Add Server
        </Button>
      )}

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleAddServer} className="space-y-4">
            <div>
              <Label htmlFor="serverId">Server ID</Label>
              <Input
                id="serverId"
                placeholder="Discord Server ID"
                value={formData.serverId}
                onChange={(e) =>
                  setFormData({ ...formData, serverId: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="serverName">Server Name</Label>
              <Input
                id="serverName"
                placeholder="Server Name"
                value={formData.serverName}
                onChange={(e) =>
                  setFormData({ ...formData, serverName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="adminRoleId">Admin Role ID</Label>
              <Input
                id="adminRoleId"
                placeholder="Admin Role ID"
                value={formData.adminRoleId}
                onChange={(e) =>
                  setFormData({ ...formData, adminRoleId: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Server'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
