"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle, Share, TrendingUp, Users, Search, Copy, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api"

const engagementStats = [
  {
    metric: "Likes",
    value: 1247,
    change: "+12%",
    icon: <Heart className="h-4 w-4" />,
    color: "text-red-500",
  },
  {
    metric: "Comments",
    value: 89,
    change: "+8%",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    metric: "Shares",
    value: 156,
    change: "+24%",
    icon: <Share className="h-4 w-4" />,
    color: "text-green-500",
  },
  {
    metric: "Followers",
    value: 2834,
    change: "+5%",
    icon: <Users className="h-4 w-4" />,
    color: "text-purple-500",
  },
]

const recentEngagements = [
  {
    id: 1,
    type: "like",
    user: "sarah_creates",
    content: "Liked your post about productivity",
    timestamp: "2m ago",
    agentAction: "auto_liked_back",
  },
  {
    id: 2,
    type: "comment",
    user: "mike_dev",
    content: "Great insights on time management!",
    timestamp: "5m ago",
    agentAction: "replied",
  },
  {
    id: 3,
    type: "follow",
    user: "design_guru",
    content: "Started following you",
    timestamp: "12m ago",
    agentAction: "followed_back",
  },
]

export function EngagementPanel() {
  const [researchTopic, setResearchTopic] = useState("")
  const [researchResults, setResearchResults] = useState("")
  const [isResearching, setIsResearching] = useState(false)

  const runResearch = async () => {
    if (!researchTopic.trim()) return

    setIsResearching(true)
    try {
      // Call the backend API to research the topic
      const response = await apiClient.researchPrompt(researchTopic)
      setResearchResults(response.output)
    } catch (error) {
      console.error("Error running research:", error)
      setResearchResults("Sorry, I couldn't complete the research at this time. Please try again.")
    } finally {
      setIsResearching(false)
    }
  }

  const copyResults = () => {
    navigator.clipboard.writeText(researchResults)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Engagement Metrics
        </CardTitle>
        <CardDescription>Real-time social interaction analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {engagementStats.map((stat, index) => (
            <div key={index} className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className={stat.color}>{stat.icon}</div>
                <span className="text-xs text-green-500">{stat.change}</span>
              </div>
              <p className="text-lg font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stat.metric}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Research Content Ideas</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Enter topic to research..."
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                disabled={isResearching}
              />
              <button
                onClick={runResearch}
                disabled={!researchTopic.trim() || isResearching}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  !researchTopic.trim() || isResearching
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isResearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Research
                  </>
                )}
              </button>
            </div>

            {researchResults && (
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium">Research Results</h5>
                  <button
                    onClick={copyResults}
                    className="flex items-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="text-sm whitespace-pre-wrap">{researchResults}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          {recentEngagements.map((engagement) => (
            <div key={engagement.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">@{engagement.user}</p>
                <p className="text-xs text-muted-foreground">{engagement.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {engagement.agentAction.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{engagement.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Engagement Rate</span>
              <span className="text-xs">4.2%</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
