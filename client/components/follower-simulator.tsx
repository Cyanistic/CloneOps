"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Users, Play, Pause, Settings } from "lucide-react"

const simulationScenarios = [
  {
    id: 1,
    name: "High Engagement",
    description: "Simulate active followers with frequent interactions",
    settings: { likes: 80, comments: 60, shares: 40 },
    active: true,
  },
  {
    id: 2,
    name: "Spam Attack",
    description: "Test agent response to spam comments and messages",
    settings: { likes: 20, comments: 90, shares: 10 },
    active: false,
  },
  {
    id: 3,
    name: "Viral Content",
    description: "Simulate content going viral with rapid engagement",
    settings: { likes: 95, comments: 85, shares: 90 },
    active: false,
  },
]

export function FollowerSimulator() {
  const [isRunning, setIsRunning] = useState(false)
  const [engagementRate, setEngagementRate] = useState([65])
  const [followerCount, setFollowerCount] = useState([500])

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    console.log(isRunning ? "Stopping simulation" : "Starting simulation")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Follower Simulator
        </CardTitle>
        <CardDescription>Simulate follower behavior for testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Simulation Status</p>
            <p className="text-xs text-muted-foreground">{isRunning ? "Running" : "Stopped"}</p>
          </div>
          <Button onClick={toggleSimulation} variant={isRunning ? "destructive" : "default"} size="sm">
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Stop" : "Start"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Engagement Rate: {engagementRate[0]}%</Label>
            <Slider value={engagementRate} onValueChange={setEngagementRate} max={100} step={5} className="w-full" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Active Followers: {followerCount[0]}</Label>
            <Slider value={followerCount} onValueChange={setFollowerCount} max={1000} step={50} className="w-full" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Simulation Scenarios</h4>
          {simulationScenarios.map((scenario) => (
            <div key={scenario.id} className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                </div>
                <Switch checked={scenario.active} />
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Likes: {scenario.settings.likes}%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Comments: {scenario.settings.comments}%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Shares: {scenario.settings.shares}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
