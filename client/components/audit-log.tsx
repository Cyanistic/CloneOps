"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Search, Download, User, Bot, Settings, MessageSquare } from "lucide-react"

const auditEntries = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:15",
    user: "john.doe@example.com",
    action: "agent_created",
    resource: "DM Responder Agent",
    details: "Created new communication agent with professional persona",
    ip: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0",
    severity: "info",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:28:42",
    user: "system",
    action: "message_processed",
    resource: "Urgent Message #1247",
    details: "Automatically flagged and escalated urgent customer message",
    ip: "internal",
    userAgent: "CloneOps Agent",
    severity: "info",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:25:18",
    user: "guest.user@example.com",
    action: "access_denied",
    resource: "Agent Configuration",
    details: "Attempted to access restricted agent settings",
    ip: "203.0.113.45",
    userAgent: "Firefox/121.0.0.0",
    severity: "warning",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:20:33",
    user: "admin@example.com",
    action: "security_settings_changed",
    resource: "Two-Factor Authentication",
    details: "Enabled mandatory 2FA for all users",
    ip: "192.168.1.50",
    userAgent: "Chrome/120.0.0.0",
    severity: "critical",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:15:07",
    user: "content_poster_agent",
    action: "content_published",
    resource: "Social Media Post #892",
    details: "Published scheduled content with AI-generated caption",
    ip: "internal",
    userAgent: "CloneOps Agent",
    severity: "info",
  },
]

const getActionIcon = (action: string) => {
  switch (action) {
    case "agent_created":
    case "agent_modified":
      return <Bot className="h-4 w-4" />
    case "message_processed":
      return <MessageSquare className="h-4 w-4" />
    case "security_settings_changed":
    case "access_denied":
      return <Settings className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    case "warning":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "info":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterAction, setFilterAction] = useState("all")

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesSearch =
      searchTerm === "" ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = filterSeverity === "all" || entry.severity === filterSeverity
    const matchesAction = filterAction === "all" || entry.action === filterAction

    return matchesSearch && matchesSeverity && matchesAction
  })

  const exportAuditLog = () => {
    console.log("Exporting audit log...")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>Complete activity trail for security and compliance</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportAuditLog}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="agent_created">Agent Created</SelectItem>
                <SelectItem value="message_processed">Message Processed</SelectItem>
                <SelectItem value="access_denied">Access Denied</SelectItem>
                <SelectItem value="security_settings_changed">Security Changed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{getActionIcon(entry.action)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{entry.resource}</h4>
                          <Badge className={`text-xs ${getSeverityColor(entry.severity)}`}>{entry.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.details}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>User: {entry.user}</span>
                      <span>IP: {entry.ip}</span>
                    </div>
                    <span>Action: {entry.action.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
