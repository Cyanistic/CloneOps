import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">CloneOps</h1>
          <p className="text-muted-foreground text-balance">Agent-based framework for social media automation</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
