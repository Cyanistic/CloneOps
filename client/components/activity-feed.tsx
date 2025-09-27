"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, MessageSquare, Send, Heart, AlertTriangle, CheckCircle, Bot } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useRealtimeEvents } from "@/components/realtime-event-handler"

interface ActivityItem {
  id: string;
  type: string;
  agent: string;
  description: string;
  timestamp: string;
  status: string;
  details: string;
}

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
    case "newMessage":
      return <Bot className="h-4 w-4" />
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { events } = useRealtimeEvents();

  // Fetch initial activities when component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll simulate with some mock data that matches expected structure
        const mockActivities: ActivityItem[] = [
          {
            id: "1",
            type: "message_processed",
            agent: "DM Responder",
            description: "Processed urgent message from @user123",
            timestamp: "Just now",
            status: "success",
            details: "Flagged as urgent and forwarded to user",
          },
          {
            id: "2",
            type: "content_posted",
            agent: "Content Poster",
            description: "Posted new content to feed",
            timestamp: "5 minutes ago",
            status: "success",
            details: "Generated caption and posted image",
          },
          {
            id: "3",
            type: "engagement",
            agent: "Engagement Agent",
            description: "Liked 12 posts and replied to 3 comments",
            timestamp: "10 minutes ago",
            status: "success",
            details: "Maintained casual and humorous tone",
          },
          {
            id: "4",
            type: "alert",
            agent: "System",
            description: "Potential spam detected in DMs",
            timestamp: "15 minutes ago",
            status: "warning",
            details: "5 messages flagged for review",
          },
          {
            id: "5",
            type: "message_processed",
            agent: "DM Responder",
            description: "Auto-replied to fan mail",
            timestamp: "20 minutes ago",
            status: "success",
            details: "Used professional and friendly persona",
          },
        ];
        
        setActivities(mockActivities);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Handle real-time events
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      // Format the new activity based on the event type
      let newActivity: ActivityItem | null = null;
      
      if (latestEvent.type === 'newMessage') {
        newActivity = {
          id: latestEvent.data.id || Date.now().toString(),
          type: 'newMessage',
          agent: 'Message System',
          description: `New message received from @${latestEvent.data.sender || 'unknown'}`,
          timestamp: 'Just now',
          status: 'success',
          details: latestEvent.data.content?.substring(0, 50) + '...' || 'New message',
        };
      } else if (latestEvent.type === 'newConversation') {
        newActivity = {
          id: latestEvent.data.id || Date.now().toString(),
          type: 'newConversation',
          agent: 'Conversation System',
          description: `New conversation created: ${latestEvent.data.title || 'Untitled'}`,
          timestamp: 'Just now',
          status: 'success',
          details: `Conversation with ${latestEvent.data.participants?.length || 0} participants`,
        };
      } else if (latestEvent.type === 'editConversation') {
        newActivity = {
          id: latestEvent.data.id || Date.now().toString(),
          type: 'editConversation',
          agent: 'Conversation System',
          description: `Conversation updated: ${latestEvent.data.title || 'Untitled'}`,
          timestamp: 'Just now',
          status: 'success',
          details: 'Conversation title updated',
        };
      }
      
      if (newActivity) {
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only the 10 most recent
      }
    }
  }, [events]);

  if (loading) {
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
          <div className="text-center py-8">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

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
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
