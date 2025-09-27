"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserCheck, UserX, Settings, Crown } from "lucide-react"

const userAccess = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=32&width=32",
    lastActive: "2 minutes ago",
    permissions: ["full_access", "agent_management", "security_settings"],
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "Editor",
    avatar: "/placeholder.svg?height=32&width=32",
    lastActive: "15 minutes ago",
    permissions: ["content_creation", "agent_interaction"],
    status: "active",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@example.com",
    role: "Guest",
    avatar: "/placeholder.svg?height=32&width=32",
    lastActive: "1 hour ago",
    permissions: ["view_only"],
    status: "restricted",
  },
]

const permissionCategories = [
  {
    name: "Agent Management",
    description: "Create, modify, and delete agents",
    enabled: true,
  },
  {
    name: "Content Creation",
    description: "Access content creation tools",
    enabled: true,
  },
  {
    name: "Message Processing",
    description: "View and manage message processing",
    enabled: true,
  },
  {
    name: "Security Settings",
    description: "Modify security and audit settings",
    enabled: false,
  },
]

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Admin":
      return <Crown className="h-4 w-4 text-yellow-500" />
    case "Editor":
      return <UserCheck className="h-4 w-4 text-blue-500" />
    case "Guest":
      return <UserX className="h-4 w-4 text-gray-500" />
    default:
      return <Users className="h-4 w-4" />
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "Editor":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "Guest":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export function AccessControls() {
  const [permissions, setPermissions] = useState(permissionCategories)

  const togglePermission = (index: number) => {
    const updated = [...permissions]
    updated[index].enabled = !updated[index].enabled
    setPermissions(updated)
  }

  const revokeAccess = (userId: number) => {
    console.log("Revoking access for user:", userId)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Access Controls
        </CardTitle>
        <CardDescription>Manage user permissions and access levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Active Users</h4>
          {userAccess.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => revokeAccess(user.id)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border space-y-3">
          <h4 className="text-sm font-medium">Permission Settings</h4>
          {permissions.map((permission, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{permission.name}</Label>
                <p className="text-xs text-muted-foreground">{permission.description}</p>
              </div>
              <Switch checked={permission.enabled} onCheckedChange={() => togglePermission(index)} />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Users className="h-4 w-4 mr-2" />
            Manage Team Access
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
