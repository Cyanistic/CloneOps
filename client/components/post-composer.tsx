"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Bot, Sparkles, X, Upload, Wrench, Search } from "lucide-react"
import { apiClient } from "@/lib/api"

interface PostComposerProps {
  onNewPost?: (post: any) => void
}

export function PostComposer({ onNewPost }: PostComposerProps) {
  const [postContent, setPostContent] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const agents = [
    { id: "content_poster", name: "Content Poster", persona: "Creative & Engaging" },
    { id: "engagement_bot", name: "Engagement Agent", persona: "Casual & Humorous" },
    { id: "dm_responder", name: "DM Responder", persona: "Professional & Friendly" },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: Date.now(), // Simple ID generation
        author: selectedAgent ? agents.find((a) => a.id === selectedAgent)?.name || "User" : "User",
        username: selectedAgent || "user",
        avatar: "/placeholder.svg?height=40&width=40",
        content: postContent,
        image: selectedImage,
        timestamp: "now",
        likes: 0,
        comments: 0,
        shares: 0,
        isAgent: !!selectedAgent,
        engagement: {
          liked: false,
          commented: false,
          shared: false,
        },
      }

      console.log("[v0] Creating new post:", newPost)
      onNewPost?.(newPost)

      // Reset form
      setPostContent("")
      setSelectedAgent("")
      setScheduledTime("")
      removeImage()
    }
  }

  const generateCaption = () => {
    // Simulate AI caption generation
    const captions = [
      "Just discovered something amazing! What do you think? 🤔",
      "Sharing some insights from today's work. Hope this helps! ✨",
      "Quick update from the team. Exciting things coming soon! 🚀",
      "Reflecting on this week's progress. Grateful for the journey! 🙏",
    ]
    const randomCaption = captions[Math.floor(Math.random() * captions.length)]
    setPostContent(randomCaption)
  }

  const enhancePrompt = async () => {
    if (!postContent.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.enhancePrompt(postContent);
      setPostContent(response.output);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      // Optional: Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  const researchPrompt = async () => {
    if (!postContent.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.researchPrompt(postContent);
      setPostContent(response.output);
    } catch (error) {
      console.error("Error researching prompt:", error);
      // Optional: Show error to user
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Post Composer
        </CardTitle>
        <CardDescription>Create and schedule posts for your agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Posting Agent</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Post as yourself or select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div>
                    <div className="font-medium">Post as Yourself</div>
                    <div className="text-xs text-muted-foreground">Personal post</div>
                  </div>
                </SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.persona}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule (Optional)</label>
            <Select value={scheduledTime} onValueChange={setScheduledTime}>
              <SelectTrigger>
                <SelectValue placeholder="Post immediately" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Post immediately</SelectItem>
                <SelectItem value="1h">In 1 hour</SelectItem>
                <SelectItem value="4h">In 4 hours</SelectItem>
                <SelectItem value="1d">Tomorrow</SelectItem>
                <SelectItem value="custom">Custom time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Post Content</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateCaption}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Caption
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={enhancePrompt}
                disabled={isLoading}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Enhance Prompt
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={researchPrompt}
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                Research Prompt
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{postContent.length}/280 characters</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Mock Platform
              </Badge>
            </div>
          </div>
        </div>

        {selectedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Selected Image</label>
              <Button variant="ghost" size="sm" onClick={removeImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected for post"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            {selectedImage ? "Change Image" : "Add Image"}
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={handlePost} disabled={!postContent.trim()}>
            {scheduledTime && scheduledTime !== "now" ? "Schedule Post" : "Post Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
