'use server'

import { getSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1407048832973406349'
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://v0-devibe6test.vercel.app'

export default async function SignInPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify+guilds+email`

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12 space-y-2">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.754 19.754 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.126-.094.252-.192.372-.291a.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.099.246.198.373.292a.072.072 0 0 1-.01.119c-.598.35-1.225.645-1.873.891a.07.07 0 0 0-.038.099c.36.687.772 1.341 1.292 2.1a.078.078 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.030a.079.079 0 0 0 .033-.057c.5-4.761-.838-8.898-3.549-12.571a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Discord Admin Panel</h1>
          <p className="text-muted-foreground text-lg">Advanced server management & moderation</p>
        </div>

        {/* Sign in card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-8 shadow-2xl space-y-6">
          {/* Main Discord button */}
          <a
            href={discordAuthUrl}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-primary to-[#4752C4] text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-semibold text-lg group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.754 19.754 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.126-.094.252-.192.372-.291a.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.099.246.198.373.292a.072.072 0 0 1-.01.119c-.598.35-1.225.645-1.873.891a.07.07 0 0 0-.038.099c.36.687.772 1.341 1.292 2.1a.078.078 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.030a.079.079 0 0 0 .033-.057c.5-4.761-.838-8.898-3.549-12.571a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
            </svg>
            Sign in with Discord
          </a>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card/80 text-muted-foreground uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Email sign in */}
          <button className="w-full px-4 py-3 bg-secondary/50 hover:bg-secondary border border-border text-foreground rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Continue with Email
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>New to Discord Admin Panel?</p>
          <Link href="/sign-up" className="inline-block text-primary hover:text-accent transition-colors font-semibold">
            Create an account
          </Link>
        </div>

        {/* Features highlight */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Real-time</p>
            <p className="text-xs text-muted-foreground">Live moderation</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-accent/20 rounded-lg mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Logging</p>
            <p className="text-xs text-muted-foreground">Webhook logs</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Powerful</p>
            <p className="text-xs text-muted-foreground">Advanced tools</p>
          </div>
        </div>
      </div>
    </main>
  )
}
