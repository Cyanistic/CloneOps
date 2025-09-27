"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, RefreshCw, Wand2 } from "lucide-react"

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "inspiring", label: "Inspiring" },
  { value: "educational", label: "Educational" },
]

const lengthOptions = [
  { value: "short", label: "Short (1-2 sentences)" },
  { value: "medium", label: "Medium (3-4 sentences)" },
  { value: "long", label: "Long (5+ sentences)" },
]

export function CaptionGenerator() {
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState("")
  const [length, setLength] = useState("")
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCaptions = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Simulate AI caption generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockCaptions = [
      "Just discovered something incredible! This changes everything. What do you think about this approach? 🤔 #innovation #discovery",
      "Sharing some insights from today's work session. Hope this sparks some ideas for your own projects! ✨ #productivity #insights",
      "Quick update from the creative process. Sometimes the best ideas come when you least expect them! 🚀 #creativity #process",
      "Reflecting on this week's progress and feeling grateful for the journey. Every step teaches us something new! 🙏 #growth #reflection",
    ]

    setGeneratedCaptions(mockCaptions)
    setIsGenerating(false)
  }

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Caption Generator
        </CardTitle>
        <CardDescription>Generate engaging captions for your social media posts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Content Description</Label>
          <Textarea
            id="prompt"
            placeholder="Describe your image or the topic you want to post about..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateCaptions} disabled={!prompt.trim() || isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Captions
            </>
          )}
        </Button>

        {generatedCaptions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Generated Captions</h4>
            {generatedCaptions.map((caption, index) => (
              <div key={index} className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-sm mb-3">{caption}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Option {index + 1}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => copyCaption(caption)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
