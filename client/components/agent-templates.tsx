"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Heart, Shield, Zap } from "lucide-react"

const templates = [
  {
    id: 1,
    name: "Customer Support",
    type: "Communication",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Handles customer inquiries with professional responses",
    persona: "Professional & Helpful",
    rules: ["Escalate complaints", "Provide quick responses", "Use knowledge base"],
    popular: true,
  },
  {
    id: 2,
    name: "Content Creator",
    type: "Publishing",
    icon: <Send className="h-5 w-5" />,
    description: "Creates engaging content with AI-generated captions",
    persona: "Creative & Engaging",
    rules: ["Post daily content", "Generate captions", "Use trending hashtags"],
    popular: true,
  },
  {
    id: 3,
    name: "Community Manager",
    type: "Interaction",
    icon: <Heart className="h-5 w-5" />,
    description: "Engages with community members and builds relationships",
    persona: "Friendly & Approachable",
    rules: ["Like relevant posts", "Reply to comments", "Share user content"],
    popular: false,
  },
  {
    id: 4,
    name: "Brand Guardian",
    type: "Moderation",
    icon: <Shield className="h-5 w-5" />,
    description: "Monitors mentions and protects brand reputation",
    persona: "Professional & Vigilant",
    rules: ["Monitor brand mentions", "Flag negative content", "Report spam"],
    popular: false,
  },
]

export function AgentTemplates() {
  const handleUseTemplate = (template: any) => {
    // Handle template selection logic
    console.log("Using template:", template)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Agent Templates
        </CardTitle>
        <CardDescription>Quick start with pre-configured agent templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-primary">{template.icon}</div>
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    {template.name}
                    {template.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="text-xs">
                  {template.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Persona:</span>
                <span className="text-xs">{template.persona}</span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Includes:</p>
              <div className="flex flex-wrap gap-1">
                {template.rules.slice(0, 2).map((rule, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {rule}
                  </Badge>
                ))}
                {template.rules.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.rules.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <Button size="sm" className="w-full" onClick={() => handleUseTemplate(template)}>
              Use Template
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
