"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bot, MessageSquare, Send, Heart, MoreHorizontal, Settings, Trash2, Copy } from "lucide-react"

const agents = [
  {
    id: 1,
    name: "DM Responder",
    type: "Communication",
    persona: "Professional & Friendly",
    status: "active",
    description: "Handles direct messages with professional tone and quick responses",
    messagesProcessed: 247,
    responseRate: 94,
    lastActivity: "2 minutes ago",
    rules: ["Flag urgent messages", "Auto-reply to fan mail", "Escalate complaints"],
  },
  {
    id: 2,
    name: "Content Poster",
    type: "Publishing",
    persona: "Creative & Engaging",
    status: "active",
    description: "Creates and publishes content with AI-generated captions",
    messagesProcessed: 12,
    responseRate: 100,
    lastActivity: "15 minutes ago",
    rules: ["Post daily content", "Generate captions", "Schedule optimal times"],
  },
  {
    id: 3,
    name: "Engagement Agent",
    type: "Interaction",
    persona: "Casual & Humorous",
    status: "paused",
    description: "Likes posts, replies to comments, and engages with followers",
    messagesProcessed: 89,
    responseRate: 87,
    lastActivity: "1 hour ago",
    rules: ["Like relevant posts", "Reply with humor", "Avoid controversial topics"],
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "Communication":
      return <MessageSquare className="h-5 w-5" />
    case "Publishing":
      return <Send className="h-5 w-5" />
    case "Interaction":
      return <Heart className="h-5 w-5" />
    default:
      return <Bot className="h-5 w-5" />
  }
}

export function AgentList() {
  const [agentStates, setAgentStates] = useState(
    agents.reduce((acc, agent) => ({ ...acc, [agent.id]: agent.status === "active" }), {}),
  )

  const toggleAgent = (agentId: number) => {
    setAgentStates((prev) => ({ ...prev, [agentId]: !prev[agentId] }))
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card key={agent.id} className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {getIcon(agent.type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={agentStates[agent.id]}
                  onCheckedChange={() => toggleAgent(agent.id)}
                  aria-label={`Toggle ${agent.name}`}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{agent.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Persona</span>
                  <span className="text-sm font-medium">{agent.persona}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="text-sm font-medium">{agent.messagesProcessed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.responseRate} className="w-12 h-2" />
                    <span className="text-sm font-medium">{agent.responseRate}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={agentStates[agent.id] ? "default" : "secondary"}>
                    {agentStates[agent.id] ? "Active" : "Paused"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Activity</span>
                  <span className="text-sm">{agent.lastActivity}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-2">Active Rules</h4>
              <div className="flex flex-wrap gap-2">
                {agent.rules.map((rule, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {rule}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
