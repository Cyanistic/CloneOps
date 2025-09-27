"use client"

import { useState } from "react"
import { SocialFeed } from "@/components/social-feed"
import { PostComposer } from "@/components/post-composer"
import { EngagementPanel } from "@/components/engagement-panel"
import { FollowerSimulator } from "@/components/follower-simulator"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Bed as Feed, User } from "lucide-react"

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "profile">("feed")
  const [newPosts, setNewPosts] = useState<any[]>([])

  const handleNewPost = (post: any) => {
    console.log("[v0] Adding new post to feed:", post)
    setNewPosts((prev) => [post, ...prev])
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mock Social Platform</h1>
          <p className="text-muted-foreground">Test agent interactions in a controlled environment</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "feed" ? "default" : "outline"}
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-2"
          >
            <Feed className="h-4 w-4" />
            Feed
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>

      {activeTab === "feed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <PostComposer onNewPost={handleNewPost} />
            <SocialFeed newPosts={newPosts} />
          </div>
          <div className="space-y-6">
            <EngagementPanel />
            <FollowerSimulator />
          </div>
        </div>
      ) : (
        <UserProfile newPosts={newPosts} />
      )}
    </div>
  )
}
