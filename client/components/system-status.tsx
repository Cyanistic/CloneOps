"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Database, Shield, Wifi } from "lucide-react"

const systemMetrics = [
  {
    name: "API Status",
    status: "operational",
    value: 99.9,
    icon: <Server className="h-4 w-4" />,
  },
  {
    name: "Database",
    status: "operational",
    value: 98.5,
    icon: <Database className="h-4 w-4" />,
  },
  {
    name: "Security",
    status: "operational",
    value: 100,
    icon: <Shield className="h-4 w-4" />,
  },
  {
    name: "Network",
    status: "operational",
    value: 97.2,
    icon: <Wifi className="h-4 w-4" />,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "operational":
      return "bg-green-500"
    case "degraded":
      return "bg-yellow-500"
    case "down":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function SystemStatus() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Infrastructure health and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemMetrics.map((metric) => (
          <div key={metric.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-muted-foreground">{metric.icon}</div>
              <span className="text-sm font-medium">{metric.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={metric.value} className="w-16 h-2" />
              <span className="text-xs text-muted-foreground w-10">{metric.value}%</span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Status</span>
            <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
              All Systems Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
