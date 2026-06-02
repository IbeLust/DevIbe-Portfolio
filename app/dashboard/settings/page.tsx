'use server'

import { Settings as SettingsIcon, Bell, Shield, Users as UsersIcon, LogOut } from 'lucide-react'

export default async function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your server and admin panel</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Server Name</label>
              <input
                type="text"
                defaultValue="My Discord Server"
                className="w-full px-4 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Server ID</label>
              <input
                type="text"
                defaultValue="123456789"
                disabled
                className="w-full px-4 py-2 bg-card/50 border border-border rounded-lg text-muted-foreground opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prefix</label>
              <input
                type="text"
                defaultValue="!"
                className="w-full px-4 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all font-medium">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <Bell className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'New member notifications', desc: 'Notify when new members join' },
              { label: 'Moderation alerts', desc: 'Alerts for moderation actions' },
              { label: 'Infraction warnings', desc: 'Notify about rule violations' },
              { label: 'Daily digest', desc: 'Receive daily server summary' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative w-12 h-6 bg-muted rounded-full cursor-pointer peer-checked:bg-primary transition-colors">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <Shield className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Moderation</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Role ID</label>
              <input
                type="text"
                defaultValue="987654321"
                className="w-full px-4 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Auto-Moderation Level</label>
              <select className="w-full px-4 py-2 bg-card/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors">
                <option>Off</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Automod Filters</p>
              <div className="space-y-2">
                {['Spam Detection', 'Profanity Filter', 'Invite Filter', 'Link Filter'].map((filter, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
                    <span className="text-sm text-muted-foreground">{filter}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all font-medium">
              Update Moderation
            </button>
          </div>
        </div>

        {/* Member Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <UsersIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Member Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
              <div>
                <p className="font-medium text-foreground">Restrict Member DMs</p>
                <p className="text-xs text-muted-foreground">Prevent members from DMing each other</p>
              </div>
              <label className="relative w-12 h-6 bg-muted rounded-full cursor-pointer peer-checked:bg-primary transition-colors">
                <input type="checkbox" className="sr-only peer" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
              <div>
                <p className="font-medium text-foreground">Welcome Messages</p>
                <p className="text-xs text-muted-foreground">Send welcome message to new members</p>
              </div>
              <label className="relative w-12 h-6 bg-muted rounded-full cursor-pointer peer-checked:bg-primary transition-colors">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <LogOut className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
          </div>

          <p className="text-sm text-muted-foreground">These actions cannot be undone. Please proceed with caution.</p>

          <div className="space-y-3">
            <button className="w-full px-6 py-2 bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-lg transition-colors font-medium border border-destructive/30">
              Reset All Settings
            </button>
            <button className="w-full px-6 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors font-medium">
              Disconnect Server
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
