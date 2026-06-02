export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Discord Admin Panel</h1>
        <p className="text-muted-foreground">Advanced moderation and server management</p>
        <a href="/sign-in" className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Get Started
        </a>
      </div>
    </main>
  )
}
