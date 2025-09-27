"use client";

import { AgentOverview } from "@/components/agent-overview"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { SystemStatus } from "@/components/system-status"
import ProtectedRoute from "@/components/protected-route"
import { UserProfile } from "@/components/user-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <AgentOverview />
                <ActivityFeed />
              </TabsContent>
              <TabsContent value="profile" className="mt-4">
                <UserProfile />
              </TabsContent>
            </Tabs>
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
