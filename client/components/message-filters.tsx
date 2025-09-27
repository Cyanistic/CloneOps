"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Filter, Plus, X } from "lucide-react"

const activeFilters = [
  { id: 1, name: "Urgent Keywords", keywords: ["help", "problem", "urgent", "issue"], enabled: true },
  { id: 2, name: "Spam Patterns", keywords: ["win", "congratulations", "click here", "free money"], enabled: true },
  { id: 3, name: "Fan Mail", keywords: ["love", "amazing", "great work", "fan"], enabled: true },
]

export function MessageFilters() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Message Filters
        </CardTitle>
        <CardDescription>Configure automatic message categorization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFilters.map((filter) => (
          <div key={filter.id} className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{filter.name}</h4>
              <Switch checked={filter.enabled} />
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {filter.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  {keyword}
                  <X className="h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Keyword
            </Button>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <Label htmlFor="new-filter" className="text-sm font-medium">
            Create New Filter
          </Label>
          <div className="flex gap-2 mt-2">
            <Input id="new-filter" placeholder="Filter name..." className="text-sm" />
            <Button size="sm">Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
