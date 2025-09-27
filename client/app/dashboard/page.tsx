"use client";

import { AgentOverview } from "@/components/agent-overview"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { SystemStatus } from "@/components/system-status"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AgentOverview />
            <ActivityFeed />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <SystemStatus />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
