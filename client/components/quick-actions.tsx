"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pause, Play, Settings, Shield } from "lucide-react"

export function QuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and emergency controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>

        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configure Personas
        </Button>

        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Play className="mr-2 h-4 w-4" />
          Start All Agents
        </Button>

        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Pause className="mr-2 h-4 w-4" />
          Pause All Agents
        </Button>

        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Emergency Controls</p>
          <Button className="w-full justify-start" variant="destructive" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Kill Switch
            <Badge variant="secondary" className="ml-auto text-xs">
              CTRL+K
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
