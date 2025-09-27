"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, RefreshCw, Wand2, Lightbulb, Search } from "lucide-react"
import { API } from "@/lib/api"

export function CaptionGenerator() {
  const [prompt, setPrompt] = useState("")
  const [suggestedCaption, setSuggestedCaption] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasUserModifiedSuggestion, setHasUserModifiedSuggestion] = useState(false)
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState("")
  
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Function to generate caption based on current prompt
  const generateCaption = async () => {
    if (!prompt.trim() || prompt === lastGeneratedPrompt) return

    setIsGenerating(true)
    try {
      // Call the backend API to enhance the prompt
      const response = await API.api.enhancePrompt({prompt})
      setSuggestedCaption(response.data.output)
      setLastGeneratedPrompt(prompt)
      setHasUserModifiedSuggestion(false)
    } catch (error) {
      console.error("Error generating caption:", error)
      setSuggestedCaption("Sorry, I couldn't generate a caption at this time. Please try rephrasing your input.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Debounced handler for text changes
  const handlePromptChange = (value: string) => {
    setPrompt(value)
    
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Set a new timer to generate caption after 1 second of inactivity
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        generateCaption()
      } else {
        setSuggestedCaption("")
      }
    }, 1000)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption)
  }

  const handleSuggestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSuggestedCaption(e.target.value)
    setHasUserModifiedSuggestion(true)
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
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="suggestion">AI Suggestion</Label>
            {isGenerating && (
              <div className="flex items-center text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </div>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="suggestion"
              placeholder={isGenerating ? "Generating suggestion..." : "AI-generated suggestion will appear here..."}
              value={suggestedCaption}
              onChange={handleSuggestionChange}
              rows={4}
              disabled={isGenerating}
              className="pl-10"
            />
            <Lightbulb className="absolute top-3 left-3 h-4 w-4 text-yellow-500" />
          </div>
          {suggestedCaption && !hasUserModifiedSuggestion && (
            <div className="text-xs text-muted-foreground">
              <p>The AI automatically generated this suggestion based on your description.</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={generateCaption}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1"
            variant="outline"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button 
            onClick={async () => {
              if (prompt.trim()) {
                setIsGenerating(true);
                try {
                  // Call the backend API to research the prompt
                  const response = await API.api.researchPrompt({prompt});
                  setSuggestedCaption(response.data.output);
                  setHasUserModifiedSuggestion(false);
                } catch (error) {
                  console.error("Error running research:", error);
                  setSuggestedCaption("Sorry, I couldn't run research at this time. Please try rephrasing your input.");
                } finally {
                  setIsGenerating(false);
                }
              }
            }}
            disabled={!prompt.trim() || isGenerating}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            Research
          </Button>
          {suggestedCaption && (
            <Button 
              onClick={() => copyCaption(suggestedCaption)}
              variant="secondary"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
