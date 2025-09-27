"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield, Pause, StopCircle, Power } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function EmergencyControls() {
  const [killSwitchActive, setKillSwitchActive] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)

  const activateKillSwitch = () => {
    setKillSwitchActive(true)
    console.log("KILL SWITCH ACTIVATED - All agents stopped")
  }

  const deactivateKillSwitch = () => {
    setKillSwitchActive(false)
    console.log("Kill switch deactivated - System ready for restart")
  }

  const pauseAllAgents = () => {
    console.log("All agents paused")
  }

  const enableEmergencyMode = () => {
    setEmergencyMode(!emergencyMode)
    console.log("Emergency mode:", !emergencyMode ? "enabled" : "disabled")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          Emergency Controls
        </CardTitle>
        <CardDescription>Critical system controls for emergency situations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg border-2 border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-sm text-red-500">Global Kill Switch</h4>
              <p className="text-xs text-muted-foreground">Immediately stop all agent activities</p>
            </div>
            <Badge variant={killSwitchActive ? "destructive" : "secondary"} className="text-xs">
              {killSwitchActive ? "ACTIVE" : "READY"}
            </Badge>
          </div>

          {killSwitchActive ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <StopCircle className="h-4 w-4" />
                <span className="text-sm font-medium">All systems stopped</span>
              </div>
              <Button onClick={deactivateKillSwitch} variant="outline" size="sm" className="w-full bg-transparent">
                <Power className="h-4 w-4 mr-2" />
                Reactivate System
              </Button>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  <StopCircle className="h-4 w-4 mr-2" />
                  ACTIVATE KILL SWITCH
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-500">Activate Kill Switch?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately stop all agent activities, pause message processing, and halt content posting.
                    This action should only be used in emergency situations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={activateKillSwitch} className="bg-red-500 hover:bg-red-600">
                    Activate Kill Switch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Emergency Mode</Label>
              <p className="text-xs text-muted-foreground">Enhanced monitoring and restricted operations</p>
            </div>
            <Switch checked={emergencyMode} onCheckedChange={enableEmergencyMode} />
          </div>

          <Button onClick={pauseAllAgents} variant="outline" size="sm" className="w-full bg-transparent">
            <Pause className="h-4 w-4 mr-2" />
            Pause All Agents
          </Button>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Security Status</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Two-factor authentication: Enabled</p>
              <p>• Data encryption: Active</p>
              <p>• Access monitoring: Real-time</p>
              <p>• Backup systems: Operational</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
