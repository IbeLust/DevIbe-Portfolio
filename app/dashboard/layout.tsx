'use server'

import { getSession, clearSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function LogoutButton() {
  const handleLogout = async () => {
    'use server'
    await clearSession()
    redirect('/sign-in')
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-all duration-200"
      >
        Logout
      </button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.754 19.754 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.126-.094.252-.192.372-.291a.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.099.246.198.373.292a.072.072 0 0 1-.01.119c-.598.35-1.225.645-1.873.891a.07.07 0 0 0-.038.099c.36.687.772 1.341 1.292 2.1a.078.078 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.030a.079.079 0 0 0 .033-.057c.5-4.761-.838-8.898-3.549-12.571a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Discord Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-secondary/30 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">@{session.username}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-8 py-8">
        {children}
      </main>
    </div>
  )
}
