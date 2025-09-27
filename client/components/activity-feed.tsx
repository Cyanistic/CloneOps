"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, MessageSquare, Send, Heart, AlertTriangle, CheckCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "message_processed",
    agent: "DM Responder",
    description: "Processed urgent message from @user123",
    timestamp: "2 minutes ago",
    status: "success",
    details: "Flagged as urgent and forwarded to user",
  },
  {
    id: 2,
    type: "content_posted",
    agent: "Content Poster",
    description: "Posted new content to feed",
    timestamp: "15 minutes ago",
    status: "success",
    details: "Generated caption and posted image",
  },
  {
    id: 3,
    type: "engagement",
    agent: "Engagement Agent",
    description: "Liked 12 posts and replied to 3 comments",
    timestamp: "32 minutes ago",
    status: "success",
    details: "Maintained casual and humorous tone",
  },
  {
    id: 4,
    type: "alert",
    agent: "System",
    description: "Potential spam detected in DMs",
    timestamp: "45 minutes ago",
    status: "warning",
    details: "5 messages flagged for review",
  },
  {
    id: 5,
    type: "message_processed",
    agent: "DM Responder",
    description: "Auto-replied to fan mail",
    timestamp: "1 hour ago",
    status: "success",
    details: "Used professional and friendly persona",
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "message_processed":
      return <MessageSquare className="h-4 w-4" />
    case "content_posted":
      return <Send className="h-4 w-4" />
    case "engagement":
      return <Heart className="h-4 w-4" />
    case "alert":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-500"
    case "warning":
      return "text-yellow-500"
    case "error":
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

export function ActivityFeed() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
        <CardDescription>Real-time log of all agent activities</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                <div className={`mt-1 ${getStatusColor(activity.status)}`}>{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.agent}
                    </Badge>
                    {activity.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
