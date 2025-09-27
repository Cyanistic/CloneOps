"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bot, Settings } from "lucide-react"

const responseTemplates = [
  {
    id: 1,
    category: "fan_mail",
    name: "Fan Mail Response",
    template: "Thank you so much for the kind words! Really appreciate your support! 😊",
    enabled: true,
  },
  {
    id: 2,
    category: "regular",
    name: "General Inquiry",
    template: "Thanks for reaching out! I'll review your message and get back to you within 24 hours.",
    enabled: true,
  },
  {
    id: 3,
    category: "urgent",
    name: "Urgent Escalation",
    template: "I've received your urgent message and will prioritize this. Expect a response shortly.",
    enabled: false,
  },
]

export function AutoResponseSettings() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Auto-Response
        </CardTitle>
        <CardDescription>Configure automated response templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {responseTemplates.map((template) => (
          <div key={template.id} className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {template.category.replace("_", " ")}
                </Badge>
              </div>
              <Switch checked={template.enabled} />
            </div>
            <Textarea value={template.template} className="text-sm mb-2" rows={2} placeholder="Response template..." />
            <Button variant="ghost" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Edit Template
            </Button>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">AI-Generated Responses</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Response Delay (seconds)</Label>
              <span className="text-sm text-muted-foreground">5-15</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Human Review Required</Label>
              <Switch />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
