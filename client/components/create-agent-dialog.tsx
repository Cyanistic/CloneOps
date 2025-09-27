"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

const agentTypes = [
  { value: "communication", label: "Communication Agent", description: "Handles DMs and messages" },
  { value: "publishing", label: "Content Publisher", description: "Creates and posts content" },
  { value: "interaction", label: "Engagement Agent", description: "Likes, comments, and engages" },
  { value: "moderation", label: "Content Moderator", description: "Reviews and moderates content" },
]

const personaPresets = [
  "Professional & Friendly",
  "Casual & Humorous",
  "Creative & Engaging",
  "Formal & Authoritative",
  "Warm & Supportive",
  "Witty & Sarcastic",
]

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [agentType, setAgentType] = useState("")
  const [persona, setPersona] = useState("")
  const [description, setDescription] = useState("")
  const [rules, setRules] = useState<string[]>([])
  const [newRule, setNewRule] = useState("")

  const addRule = () => {
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      setRules([...rules, newRule.trim()])
      setNewRule("")
    }
  }

  const removeRule = (ruleToRemove: string) => {
    setRules(rules.filter((rule) => rule !== ruleToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle agent creation logic here
    console.log({ agentName, agentType, persona, description, rules })
    setOpen(false)
    // Reset form
    setAgentName("")
    setAgentType("")
    setPersona("")
    setDescription("")
    setRules([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>Configure a new specialized agent for your social media automation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="e.g., Customer Support Bot"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-type">Agent Type</Label>
              <Select value={agentType} onValueChange={setAgentType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Persona</Label>
            <Select value={persona} onValueChange={setPersona} required>
              <SelectTrigger>
                <SelectValue placeholder="Select persona style" />
              </SelectTrigger>
              <SelectContent>
                {personaPresets.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this agent will do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Behavior Rules</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a behavior rule..."
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
              />
              <Button type="button" onClick={addRule} size="sm">
                Add
              </Button>
            </div>
            {rules.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {rules.map((rule) => (
                  <Badge key={rule} variant="secondary" className="flex items-center gap-1">
                    {rule}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeRule(rule)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Agent</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
