import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "@/components/session-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import "./globals.css"

export const metadata: Metadata = {
  title: "CloneOps - Agent-Based Social Media Automation",
  description:
    "Complete agent-based framework to automate and test social interactions in a safe, controlled environment",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen bg-background grid-pattern">
            <NavigationWrapper>
              <DashboardHeader />
              <DashboardNav />
            </NavigationWrapper>
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined") {
    const isLoginPage = window.location.pathname === "/"
    if (isLoginPage) return null
  }

  return <>{children}</>
}
