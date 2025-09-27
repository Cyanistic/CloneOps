"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, AlertTriangle, Heart, Mail, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Messages",
    value: "1,247",
    change: "+12%",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    title: "Urgent Messages",
    value: "23",
    change: "-8%",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-red-500",
  },
  {
    title: "Auto-Replied",
    value: "892",
    change: "+18%",
    icon: <Heart className="h-4 w-4" />,
    color: "text-green-500",
  },
  {
    title: "Spam Filtered",
    value: "156",
    change: "+5%",
    icon: <Mail className="h-4 w-4" />,
    color: "text-gray-500",
  },
]

const processingMetrics = [
  {
    label: "Response Rate",
    value: 94,
    target: 95,
  },
  {
    label: "Avg Response Time",
    value: 87,
    target: 90,
  },
  {
    label: "Spam Detection",
    value: 98,
    target: 95,
  },
  {
    label: "User Satisfaction",
    value: 92,
    target: 90,
  },
]

export function MessageStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{stat.change}</span>
                </div>
              </div>
              <div className={`${stat.color}`}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="md:col-span-2 lg:col-span-4 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Processing Performance</CardTitle>
          <CardDescription>Real-time metrics for message processing efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processingMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm text-muted-foreground">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
