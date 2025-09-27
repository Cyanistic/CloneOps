"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const securityMetrics = [
  {
    title: "Authentication Security",
    status: "secure",
    score: 98,
    details: "2FA enabled, strong passwords enforced",
    icon: <Lock className="h-4 w-4" />,
  },
  {
    title: "Data Encryption",
    status: "secure",
    score: 100,
    details: "End-to-end encryption active",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Access Monitoring",
    status: "active",
    score: 95,
    details: "Real-time access logging enabled",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    title: "Threat Detection",
    status: "warning",
    score: 87,
    details: "3 potential threats detected",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
]

const recentAlerts = [
  {
    id: 1,
    type: "warning",
    title: "Unusual Login Pattern",
    description: "Multiple login attempts from new location",
    timestamp: "2 minutes ago",
    resolved: false,
  },
  {
    id: 2,
    type: "info",
    title: "Agent Permission Change",
    description: "DM Responder permissions updated by admin",
    timestamp: "15 minutes ago",
    resolved: true,
  },
  {
    id: 3,
    type: "critical",
    title: "Sensitive Data Access",
    description: "Attempt to access restricted user data",
    timestamp: "1 hour ago",
    resolved: true,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "secure":
      return "text-green-500"
    case "active":
      return "text-blue-500"
    case "warning":
      return "text-yellow-500"
    case "critical":
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

const getAlertIcon = (type: string, resolved: boolean) => {
  if (resolved) return <CheckCircle className="h-4 w-4 text-green-500" />

  switch (type) {
    case "critical":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <Eye className="h-4 w-4 text-blue-500" />
  }
}

export function SecurityOverview() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityMetrics.map((metric, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={getStatusColor(metric.status)}>{metric.icon}</div>
                    <h4 className="font-medium text-sm">{metric.title}</h4>
                  </div>
                  <Badge
                    variant={metric.status === "secure" || metric.status === "active" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Security Score</span>
                    <span className="text-xs font-medium">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>Recent security events and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                {getAlertIcon(alert.type, alert.resolved)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.type === "critical" ? "destructive" : alert.type === "warning" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {alert.type}
                    </Badge>
                    {alert.resolved && (
                      <Badge variant="default" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
