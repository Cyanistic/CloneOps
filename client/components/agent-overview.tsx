"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bot, MessageSquare, Heart, Send, MoreHorizontal, Play, Pause } from "lucide-react"

const agents = [
  {
    id: 1,
    name: "DM Responder",
    type: "Communication",
    status: "active",
    persona: "Professional & Friendly",
    messagesProcessed: 247,
    responseRate: 94,
    lastActivity: "2 minutes ago",
  },
  {
    id: 2,
    name: "Content Poster",
    type: "Publishing",
    status: "active",
    persona: "Creative & Engaging",
    messagesProcessed: 12,
    responseRate: 100,
    lastActivity: "15 minutes ago",
  },
  {
    id: 3,
    name: "Engagement Agent",
    type: "Interaction",
    status: "paused",
    persona: "Casual & Humorous",
    messagesProcessed: 89,
    responseRate: 87,
    lastActivity: "1 hour ago",
  },
]

export function AgentOverview() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Active Agents
            </CardTitle>
            <CardDescription>Monitor and control your specialized agents</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Add Agent
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {agent.type === "Communication" && <MessageSquare className="h-5 w-5 text-primary" />}
                  {agent.type === "Publishing" && <Send className="h-5 w-5 text-primary" />}
                  {agent.type === "Interaction" && <Heart className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{agent.name}</h3>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.persona}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-medium">{agent.messagesProcessed}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Progress value={agent.responseRate} className="w-16 h-2" />
                    <span className="text-sm font-medium">{agent.responseRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{agent.lastActivity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    {agent.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
